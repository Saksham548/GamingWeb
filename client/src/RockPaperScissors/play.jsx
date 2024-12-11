import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";
import Header from "./header";

const Play = ({ onBackToMainMenu }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [customRoomCode, setCustomRoomCode] = useState("");
  const [socket, setSocket] = useState(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  useEffect(() => {
    const newSocket = io("https://gamehub-uoab.onrender.com", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("Socket connected"));

    newSocket.on("room_created", (code) => {
      setRoomCode(code);
      setLoading(false);
      toast.success(`Room successfully created with code: ${code}`);
    });

    newSocket.on("room_joined", (code) => {
      setRoomCode(code);
      setLoading(false);
      toast.success("You joined the game session successfully!");
    });

    newSocket.on("error_message", (message) => {
      toast.error(message);
      setLoading(false);
    });

    newSocket.on("round_result", (data) => {
      setOpponentChoice(data.opponentChoice || "Unknown");
      setWinner(
        data.result === "tie"
          ? "It's a tie!"
          : data.result === "player1"
          ? "You win this round!"
          : "Opponent wins this round!"
      );
      setScore(data.scores);
      setWaitingForOpponent(false); // Reset the waiting state

      toast.success(
        data.result === "tie"
          ? "It's a tie!"
          : data.result === "player1"
          ? "You win this round!"
          : "Opponent wins this round!"
      );
    });

    newSocket.on("game_over", (data) => {
      if (data.scores.player1 > data.scores.player2) {
        toast.success("Congratulations! You win the game!");
      } else {
        toast.error("Game Over! Opponent wins the game.");
      }
      setRoomCode("");
      setScore({ player1: 0, player2: 0 });
      onBackToMainMenu();
    });

    return () => {
      newSocket.disconnect();
      console.log("disconnected");
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
    setWaitingForOpponent(true); // Set to waiting state
    if (socket && roomCode) {
      socket.emit("make_choice", { choice, roomCode });
    } else {
      toast.error("Please wait for connection to a game room first.");
    }
  };

  const handleCustomRoomJoin = () => {
    if (socket && customRoomCode) {
      setLoading(true);
      socket.emit("join_room", customRoomCode);
    } else {
      toast.error("Enter a valid room code.");
    }
  };

  return (
    <div className="text-center p-6">
      <Toaster />
      <div className="text flex flex-col items-start uppercase text-[2.5rem] leading-[2rem] text-white font-bold">
        <span>Rock</span>
        <span>Paper</span>
        <span>Scissors</span>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : roomCode ? (
        <>
        <Header/>
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

          {playerChoice && <p className="mt-4">Your choice: {playerChoice}</p>}
          {opponentChoice && <p>Opponent's choice: {opponentChoice}</p>}
          {winner && <p className="font-bold text-lg">{winner}</p>}

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
className="text-white mt-5 bg-gradient-to-r w-fit from-cyan-400 h-fit via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              onClick={joinOrCreateRoom}
            >
              Join or Create Game
            </button>
            <button
              className="text-white mt-5 bg-gradient-to-r w-fit from-cyan-400 h-fit via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              onClick={createRoomForFriends}
            >
              Create Room for Friends
            </button>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter room code"
              className="border p-2 rounded"
              value={customRoomCode}
              onChange={(e) => setCustomRoomCode(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
              onClick={handleCustomRoomJoin}
            >
              Join Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Play;
