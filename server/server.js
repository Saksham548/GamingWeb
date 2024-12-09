const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: "http://192.168.29.106:5173", // Allow this specific frontend origin
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: "http://192.168.29.106:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const games = {}; // Store game sessions

// Generate a unique room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: ABC123
};

io.on("connection", (socket) => {
  console.log("New client connected");

  // Create a new game room
  socket.on("create_room", () => {
    const roomCode = generateRoomCode();
    games[roomCode] = { players: [], choices: {} };

    socket.emit("room_created", roomCode); // Emit the room code to the player
    console.log(`Room created with code: ${roomCode}`);
  });

  // Join an existing game room
  socket.on("join_room", (roomCode) => {
    if (games[roomCode]) {
      const game = games[roomCode];
      if (game.players.length < 2) {
        game.players.push(socket.id);
        socket.join(roomCode);
        socket.emit("room_joined", roomCode); // Notify the player they joined
        console.log(`Player joined room: ${roomCode}`);
        if (game.players.length === 2) {
          io.to(roomCode).emit("game_start"); // Start game if both players joined
        }
      } else {
        socket.emit("error_message", "Game room is full");
      }
    } else {
      socket.emit("error_message", "Room does not exist");
    }
  });

  // Handle player choices
  socket.on("make_choice", ({ choice, roomCode }) => {
    const game = games[roomCode];
    if (game) {
      game.choices[socket.id] = choice;

      // Check if both players have made their choices
      if (Object.keys(game.choices).length === 2) {
        const [player1, player2] = game.players;
        const result = determineWinner(
          game.choices[player1],
          game.choices[player2]
        );
        io.to(roomCode).emit("round_result", {
          playerChoices: game.choices,
          result,
        });
        game.choices = {}; // Reset for the next round
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // Handle disconnection logic (cleanup if necessary)
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
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://192.168.29.106:${PORT}`);
});
