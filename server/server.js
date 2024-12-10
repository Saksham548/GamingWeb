require("dotenv").config(); // Load environment variables
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

// Initialize express server
const app = express();
const server = http.createServer(app);

// Enable CORS with proper settings
app.use(cors({
  origin: "https://game-hub-wheat-beta.vercel.app",
  methods: ["GET", "POST"],
  credentials: true,
}));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://game-hub-wheat-beta.vercel.app",
    methods: ["GET", "POST"],
    credentials: true, // Allows cookies to work properly
  },
});

// MongoDB Schema for room/session persistence
const GameSessionSchema = new mongoose.Schema({
  roomCode: String,
  players: [String], // Array of Socket IDs
  scores: { player1: { type: Number, default: 0 }, player2: { type: Number, default: 0 } },
  createdAt: { type: Date, default: Date.now },
  currentRound: { type: Number, default: 1 },
  choices: {},
});

const GameSession = mongoose.model("GameSession", GameSessionSchema);

// Function to generate a random room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Socket connection logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Create a room for friends
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

  // Handle joining an existing room with custom room code
  socket.on("join_room", async (roomCode) => {
    const session = await GameSession.findOne({ roomCode });

    if (!session) {
      socket.emit("error_message", "Room doesn't exist.");
      console.log(`Error: Room doesn't exist for code ${roomCode}`);
      return;
    }

    if (session.players.length >= 2) {
      socket.emit("error_message", "Room is already full.");
      console.log(`Error: Room is full for code ${roomCode}`);
      return;
    }

    // Join room logic
    session.players.push(socket.id);
    await session.save();

    socket.join(roomCode);
    socket.emit("room_joined", roomCode);
    io.to(roomCode).emit("start_game");

    console.log(`Player joined room: ${roomCode}`);
  });

  // Handle making choices
  socket.on("make_choice", async ({ choice, roomCode }) => {
    const gameSession = await GameSession.findOne({ roomCode });

    if (gameSession) {
      gameSession.choices[socket.id] = choice;

      if (Object.keys(gameSession.choices).length === 2) {
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

        gameSession.choices = {};
        gameSession.currentRound++;

        if (gameSession.currentRound > 3) {
          io.to(roomCode).emit("game_over", {
            scores: gameSession.scores,
          });

          await GameSession.deleteOne({ roomCode });
        }

        await gameSession.save();
      }
    }
  });

  // Handle disconnecting from a room
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

    const affectedSessions = await GameSession.updateMany(
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

// Helper function to determine the winner
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

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
