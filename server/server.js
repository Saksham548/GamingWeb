require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

// Express and server setup
const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = ["https://game-hub-wheat-beta.vercel.app"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS error"));
      }
    },
    credentials: true,
  })
);

// Database connection
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const GameSessionSchema = new mongoose.Schema({
  roomCode: String,
  players: [String],
  scores: { player1: { type: Number, default: 0 }, player2: { type: Number, default: 0 } },
  currentRound: { type: Number, default: 1 },
  choices: {},
});

const GameSession = mongoose.model("GameSession", GameSessionSchema);

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

io.on("connection", (socket) => {
  console.log("New connection established:", socket.id);

  // Handle creating a new or joining an existing game session
  socket.on("join_or_create_room", async () => {
    console.log("Joining or creating room...");
    let session = await GameSession.findOne({ players: { $size: 1 } });

    if (session) {
      session.players.push(socket.id);
      await session.save();
      socket.join(session.roomCode);
      socket.emit("room_joined", session.roomCode);
      io.to(session.roomCode).emit("toast_message", { type: "success", message: `Joined session: ${session.roomCode}` });
    } else {
      const roomCode = generateRoomCode();
      const newSession = new GameSession({
        roomCode,
        players: [socket.id],
      });
      await newSession.save();
      socket.join(roomCode);
      socket.emit("room_created", roomCode);
      io.to(roomCode).emit("toast_message", { type: "success", message: `Room created with code: ${roomCode}` });
    }
  });

  // Handle joining a specific room
  socket.on("join_room", async (roomCode) => {
    const session = await GameSession.findOne({ roomCode });

    if (session && session.players.length < 2) {
      session.players.push(socket.id);
      await session.save();
      socket.join(roomCode);
      socket.emit("room_joined", roomCode);
      io.to(roomCode).emit("toast_message", { type: "success", message: `Joined room with code: ${roomCode}` });
    } else {
      console.log("Join failed.");
      socket.emit("error_message", "Cannot join room. Either it does not exist or is already full.");
      io.to(socket.id).emit("toast_message", { type: "error", message: "Join failed. Room is full or invalid." });
    }
  });

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

server.listen(3000, () => console.log("Server running on port 3000"));
