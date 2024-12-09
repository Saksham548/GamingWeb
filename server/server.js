const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

// Initialize express server
const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({ origin: "http://your-frontend-url.com", credentials: true }));

// MongoDB connection
mongoose
  .connect("mongodb+srv://Saksham1242:Saksham548@gamehub.kzg0z.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://your-frontend-url.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// MongoDB Schema for room/session persistence
const GameSessionSchema = new mongoose.Schema({
  roomCode: String,
  players: [String], // Array of Socket IDs
  scores: { player1: { type: Number, default: 0 }, player2: { type: Number, default: 0 } },
  currentRound: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  choices: {},
});

const GameSession = mongoose.model("GameSession", GameSessionSchema);

// Function to generate a room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: ABC123
};

// Socket connection logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle creating a room for friends
  socket.on("create_room_for_friends", async () => {
    const roomCode = generateRoomCode();
    const newSession = new GameSession({
      roomCode,
      players: [socket.id],
    });

    await newSession.save();
    socket.join(roomCode);

    socket.emit("room_created", roomCode);
    console.log(`Room created: ${roomCode}`);
  });

  // Handle joining a matchmaking or room
  socket.on("join_room", async (roomCode) => {
    const session = await GameSession.findOne({ roomCode });

    if (session && session.players.length < 2) {
      session.players.push(socket.id);
      await session.save();

      socket.join(roomCode);
      socket.emit("room_joined", roomCode);
      io.to(roomCode).emit("start_game");
      console.log(`Player joined room: ${roomCode}`);
    } else {
      socket.emit("error_message", "Room is full or doesn't exist");
    }
  });

  // Handle making choices
  socket.on("make_choice", async ({ choice, roomCode }) => {
    const gameSession = await GameSession.findOne({ roomCode });

    if (gameSession) {
      gameSession.choices[socket.id] = choice; // Save choice
      if (Object.keys(gameSession.choices).length === 2) {
        // Both players made a choice, compute result
        const [player1Choice, player2Choice] = [
          gameSession.choices[gameSession.players[0]],
          gameSession.choices[gameSession.players[1]],
        ];
        const result = determineWinner(player1Choice, player2Choice);

        if (result === "player1") {
          gameSession.scores.player1++;
        } else if (result === "player2") {
          gameSession.scores.player2++;
        }

        await gameSession.save();
        io.to(roomCode).emit("round_result", {
          result,
          scores: gameSession.scores,
        });

        // Reset choices for next round
        gameSession.choices = {};
        gameSession.currentRound++;
        await gameSession.save();
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log("Disconnected: ", socket.id);

    await GameSession.updateMany(
      { players: socket.id },
      { $pull: { players: socket.id } }
    );

    const activeSessions = await GameSession.find();

    activeSessions.forEach(async (session) => {
      if (session.players.length === 0) {
        await GameSession.deleteOne({ _id: session._id });
      }
    });
  });
});

// Helper function to determine winner
const determineWinner = (choice1, choice2) => {
  if (choice1 === choice2) return "tie";
  if (
    (choice1 === "rock" && choice2 === "scissors") ||
    (choice1 === "paper" && choice2 === "rock") ||
    (choice1 === "scissors" && choice2 === "paper")
  ) {
    return "player1";
  }
  return "player2";
};

server.listen(3000, () => console.log("Server running on port 3000"));
