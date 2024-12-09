import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";

const Play = ({ gameMode, onBackToMainMenu }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [socket, setSocket] = useState(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("https://gamehub-uoab.onrender.com", {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Handle socket events
    newSocket.on("connect", () => console.log("Socket connected"));
    newSocket.on("room_created", (code) => {
      setRoomCode(code);
      setLoading(false);
      toast.success(`Room created! Code: ${code}`);
    });

    newSocket.on("room_joined", (code) => {
      setRoomCode(code);
      setLoading(false);
      toast.success("Joined room successfully!");
    });

    newSocket.on("round_result", (data) => {
      setOpponentChoice(data.opponentChoice || "Unknown");
      setWinner(data.result === "tie" ? "It's a tie!" : data.result === "player1" ? "You win!" : "You lose!");
      setScore(data.scores); // Update score state
    });

    newSocket.on("game_over", (data) => {
      toast(`Game Over! Final Scores: Player 1 - ${data.scores.player1}, Player 2 - ${data.scores.player2}`);
      onBackToMainMenu();
    });

    newSocket.on("error_message", (message) => {
      toast.error(message);
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [onBackToMainMenu]);

  const joinOrCreateRoom = () => {
    if (socket) {
      setLoading(true);

      if (gameMode === "new_game") {
        socket.emit("join_or_create_room");
      } else if (gameMode === "play_with_friends") {
        socket.emit("create_room_for_friends");
      }
    }
  };

  const handleChoice = (choice) => {
    setPlayerChoice(choice);
    if (socket && roomCode) {
      socket.emit("make_choice", { choice, roomCode });
    }
  };

  return (
    <div className="text-center p-6">
      <Toaster />
      <h2 className="text-3xl font-bold mb-4">Rock Paper Scissors</h2>
      {loading ? (
        <div>Loading...</div>
      ) : roomCode ? (
        <>
          <div className="mb-4">
            <p className="font-bold">Room Code: {roomCode}</p>
          </div>
          <div className="flex justify-center space-x-4">
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
          {playerChoice && <p className="mt-4">Your choice: {playerChoice}</p>}
          {opponentChoice && <p>Opponent's choice: {opponentChoice}</p>}
          {winner && <p className="font-bold text-lg">{winner}</p>}
        </>
      ) : (
        <div>
          <p>No active game. Start by joining or creating a room.</p>
          <button
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={joinOrCreateRoom}
          >
            Start Game
          </button>
        </div>
      )}
      <button
        className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={onBackToMainMenu}
      >
        Back to Main Menu
      </button>
    </div>
  );
};

export default Play;
