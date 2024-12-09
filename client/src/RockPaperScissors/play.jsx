import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";

const Play = ({ onBackToMainMenu }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [socket, setSocket] = useState(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  useEffect(() => {
    // Establish the socket connection
    const newSocket = io("https://gamehub-uoab.onrender.com", {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Handle connection
    newSocket.on("connect", () => console.log("Socket connected"));

    // Handle successful room creation
    newSocket.on("room_created", (code) => {
      setRoomCode(code);
      setLoading(false);
      toast.success(`Room successfully created with code: ${code}`);
    });

    // Handle joining room
    newSocket.on("room_joined", (code) => {
      setRoomCode(code);
      setLoading(false);
      toast.success("You joined the game session successfully!");
    });

    // Handle errors
    newSocket.on("error_message", (message) => {
      toast.error(message);
      setLoading(false);
    });

    // Handle round results
    newSocket.on("round_result", (data) => {
      setOpponentChoice(data.opponentChoice || "Unknown");
      setWinner(
        data.result === "tie"
          ? "It's a tie!"
          : data.result === "player1"
          ? "You win!"
          : "You lose!"
      );
      setScore(data.scores);
    });

    // Handle game over scenario
    newSocket.on("game_over", (data) => {
      toast(
        `Game Over! Final Scores - Player 1: ${data.scores.player1}, Player 2: ${data.scores.player2}`
      );
      setRoomCode("");
      setScore({ player1: 0, player2: 0 });
      onBackToMainMenu();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [onBackToMainMenu]);

  const joinOrCreateRoom = () => {
    if (socket) {
      setLoading(true);
      socket.emit("join_or_create_room");
    }
  };

  const createRoomForFriends = () => {
    if (socket) {
      setLoading(true);
      socket.emit("create_room_for_friends");
    }
  };

  const handleChoice = (choice) => {
    setPlayerChoice(choice);
    if (socket && roomCode) {
      socket.emit("make_choice", { choice, roomCode });
    } else {
      toast.error("Please wait for connection to a game room first.");
    }
  };

  return (
    <div className="text-center p-6">
      <Toaster />
      <h2 className="text-3xl font-bold mb-4">Rock Paper Scissors</h2>

      {/* Game session or waiting logic */}
      {loading ? (
        <div>Loading...</div>
      ) : roomCode ? (
        <>
          <div className="mb-4">
            <p className="font-bold">Room Code: {roomCode}</p>
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleChoice("rock")}
            >
              Rock
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleChoice("paper")}
            >
              Paper
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleChoice("scissors")}
            >
              Scissors
            </button>
          </div>

          {/* Display user's choice */}
          {playerChoice && <p className="mt-4">Your choice: {playerChoice}</p>}
          {/* Display opponent's choice */}
          {opponentChoice && <p>Opponent's choice: {opponentChoice}</p>}
          {/* Display game round result */}
          {winner && <p className="font-bold text-lg">{winner}</p>}

          {/* Scores Display */}
          <div className="mt-4">
            <h4 className="text-lg font-semibold">
              Your Score: {score.player1} | Opponent Score: {score.player2}
            </h4>
          </div>
        </>
      ) : (
        <div>
          <p>No active game found. Join an existing game or create one:</p>
          <div className="flex justify-center mt-4 space-x-4">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={joinOrCreateRoom}
            >
              Join or Create Game
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
              onClick={createRoomForFriends}
            >
              Create Room for Friends
            </button>
          </div>
        </div>
      )}

      {/* Back to menu */}
      <div className="mt-8">
        <button
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={onBackToMainMenu}
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default Play;
