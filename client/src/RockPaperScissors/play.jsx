import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";
import Header from "./header"; // Updated header component
const Play = ({ gameMode, onBackToMainMenu }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [socket, setSocket] = useState(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 }); // Added state for score tracking

  useEffect(() => {
    const newSocket = io("https://gamehub-uoab.onrender.com", { withCredentials: true });
    setSocket(newSocket);

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
      setOpponentChoice(data.opponentChoice);
      setWinner(
        data.result === "win"
          ? "You win!"
          : data.result === "lose"
          ? "You lose!"
          : "It's a tie!"
      );
      setScore(data.scores); // Update scores from server
    });

    newSocket.on("error_message", (message) => {
      toast.error(message);
      setLoading(false);
    });

    newSocket.on("disconnect", () => {
      console.warn("Socket disconnected");
    });

    return () => newSocket.disconnect();
  }, []);

  const joinOrCreateRoom = () => {
    if (socket) {
      setLoading(true);

      if (gameMode === "new_game") {
        socket.emit("join_or_create_room", {}, (response) => {
          if (response.success) {
            toast.success(response.message);
            setRoomCode(response.roomCode);
            setLoading(false);
          } else {
            toast.error(response.message);
            setLoading(false);
          }
        });
      } else if (gameMode === "play_with_friends") {
        socket.emit("create_room_for_friends", {}, (response) => {
          if (response.success) {
            toast.success(`Room created! Code: ${response.roomCode}`);
            setRoomCode(response.roomCode);
            setLoading(false);
          } else {
            toast.error(response.message);
            setLoading(false);
          }
        });
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
  <>
          <Header score={score} /> {/* Display updated score */}
    <div className="text-center">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Rock Paper Scissors</h2>
      {loading ? (
        <div>Loading...</div>
      ) : roomCode ? (
        <>
          <div className="mb-4">
            <p className="font-bold">Room Code: {roomCode}</p>
          </div>
          <div className="flex justify-center space-x-4">
            <button className="btn" onClick={() => handleChoice("rock")}>
              Rock
            </button>
            <button className="btn" onClick={() => handleChoice("paper")}>
              Paper
            </button>
            <button className="btn" onClick={() => handleChoice("scissors")}>
              Scissors
            </button>
          </div>
          {playerChoice && <p>Your choice: {playerChoice}</p>}
          {opponentChoice && <p>Opponent's choice: {opponentChoice}</p>}
          {winner && <p className="font-bold">{winner}</p>}
        </>
      ) : (
        <div>No active game. Please try again.</div>
      )}
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={onBackToMainMenu}
      >
        Back to Main Menu
      </button>
    </div>
    </>
  );
};

export default Play;
