const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

// MongoDB setup
mongoose.connect("mongodb+srv://<username>:<password>@cluster.mongodb.net/rpsGame", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const RoomSchema = new mongoose.Schema({
  code: String,
  players: [String], // Player Socket IDs
  choices: Object, // Player choices (key: socket ID, value: choice)
  status: String, // 'waiting', 'active', 'finished'
});

const Room = mongoose.model("Room", RoomSchema);

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "*", // Replace with frontend URL during production
  methods: ["GET", "POST"],
}));

const io = new Server(server, {
  cors: {
    origin: "*", // Replace with frontend URL during production
    methods: ["GET", "POST"],
  },
});

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Create a friends-only session
  socket.on("create_room", async () => {
    const roomCode = generateRoomCode();
    const room = new Room({
      code: roomCode,
      players: [socket.id],
      choices: {},
      status: "waiting",
    });

    await room.save();
    socket.join(roomCode);
    socket.emit("room_created", roomCode);
    console.log(`Room created: ${roomCode}`);
  });

  // Join a friends-only session
  socket.on("join_room", async (roomCode) => {
    const room = await Room.findOne({ code: roomCode });

    if (room) {
      if (room.players.length < 2) {
        room.players.push(socket.id);
        room.status = "active";
        await room.save();

        socket.join(roomCode);
        socket.emit("room_joined", roomCode);
        io.to(roomCode).emit("game_start", roomCode);
        console.log(`Player ${socket.id} joined room: ${roomCode}`);
      } else {
        socket.emit("error_message", "Room is full");
      }
    } else {
      socket.emit("error_message", "Room does not exist");
    }
  });

  // Join a global session
  socket.on("join_global", async () => {
    let room = await Room.findOne({ status: "waiting" });

    if (!room) {
      // Create a new room if no waiting room exists
      const roomCode = generateRoomCode();
      room = new Room({
        code: roomCode,
        players: [socket.id],
        choices: {},
        status: "waiting",
      });
      await room.save();
      socket.join(roomCode);
      socket.emit("room_created", roomCode);
    } else {
      // Join an existing waiting room
      room.players.push(socket.id);
      room.status = "active";
      await room.save();

      socket.join(room.code);
      io.to(room.code).emit("game_start", room.code);
    }
  });

  // Handle player choices
  socket.on("make_choice", async ({ roomCode, choice }) => {
    const room = await Room.findOne({ code: roomCode });

    if (room) {
      room.choices[socket.id] = choice;

      if (Object.keys(room.choices).length === 2) {
        const [player1, player2] = room.players;
        const result = determineWinner(room.choices[player1], room.choices[player2]);

        io.to(roomCode).emit("round_result", {
          choices: room.choices,
          result,
        });

        room.choices = {}; // Reset choices for the next round
        await room.save();
      }
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

    // Remove player from room and cleanup if necessary
    const room = await Room.findOne({ players: socket.id });

    if (room) {
      room.players = room.players.filter((id) => id !== socket.id);
      if (room.players.length === 0) {
        await Room.deleteOne({ code: room.code });
      } else {
        room.status = "waiting";
        await room.save();
      }
    }
  });

  function determineWinner(choice1, choice2) {
    if (choice1 === choice2) return "tie";
    if (
      (choice1 === "rock" && choice2 === "scissors") ||
      (choice1 === "paper" && choice2 === "rock") ||
      (choice1 === "scissors" && choice2 === "paper")
    ) {
      return "player1";
    }
    return "player2";
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
