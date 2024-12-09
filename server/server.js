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
const allowedOrigins = ["https://game-hub-wheat-beta.vercel.app"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS error: Origin not allowed"));
      }
    },
    credentials: true,
  })
);

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
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS error: Origin not allowed"));
      }
    },
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

  // Join an existing room
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
      gameSession.choices[socket.id] = choice;

      if (Object.keys(gameSession.choices).length === 2) {
        // Both players made choices, compute result
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

        // End game after 3 rounds
        if (gameSession.currentRound > 3) {
          io.to(roomCode).emit("game_over", {
            scores: gameSession.scores,
          });
          await GameSession.deleteOne({ roomCode });
        }
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

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
