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

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Handle session creation or joining
  socket.on("join_or_create_room", async () => {
    let session = await GameSession.findOne({ players: { $size: 1 } });

    if (session) {
      session.players.push(socket.id);
      await session.save();
      socket.emit("room_joined", session.roomCode);
    } else {
      const roomCode = generateRoomCode();
      const newSession = new GameSession({
        roomCode,
        players: [socket.id],
      });
      await newSession.save();
      socket.emit("room_created", roomCode);
    }
  });

  // Handle choice logic for round results
  socket.on("make_choice", async ({ choice, roomCode }) => {
    const session = await GameSession.findOne({ roomCode });

    if (session) {
      session.choices = session.choices || {};
      session.choices[socket.id] = choice;

      // If both players have made their choices, process the round
      if (Object.keys(session.choices).length === 2) {
        const [player1Choice, player2Choice] = [
          session.choices[session.players[0]],
          session.choices[session.players[1]],
        ];

        const result = determineWinner(player1Choice, player2Choice);

        if (result === "player1") {
          session.scores.player1++;
        } else if (result === "player2") {
          session.scores.player2++;
        }

        session.currentRound++;

        io.to(roomCode).emit("round_result", {
          result,
          scores: session.scores,
          choices: { player1Choice, player2Choice },
        });

        session.choices = {};

        // End the game after 3 rounds
        if (session.currentRound > 3) {
          io.to(roomCode).emit("game_over", {
            scores: session.scores,
          });

          await GameSession.deleteOne({ roomCode });
        }

        await session.save();
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

server.listen(3000, () => console.log("Server running on port 3000"));
