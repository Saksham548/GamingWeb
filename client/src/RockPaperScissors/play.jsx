import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";

const Play = ({ gameMode }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [winner, setWinner] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Connect to the backend
  useEffect(() => {
    const newSocket = io("http://192.168.29.106:3000", { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

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

    newSocket.on("start_game", () => {
      toast.success("Game started!");
    });

    newSocket.on("round_result", (data) => {
      setOpponentChoice(data.opponentChoice);
      setWinner(data.result === "win" ? "You win!" : data.result === "lose" ? "You lose!" : "It's a tie!");
    });

    newSocket.on("error_message", (message) => {
      setLoading(false);
      toast.error(message);
    });

    newSocket.on("disconnect", () => {
      console.warn("Socket disconnected");
    });

    return () => newSocket.disconnect();
  }, []);

  // Handle player choice
  const handleChoice = (choice) => {
    setPlayerChoice(choice);
    if (socket && roomCode) {
      socket.emit("make_choice", { choice, roomCode });
    }
  };

  // Handle game mode logic
  const joinOrCreateRoom = () => {
    if (socket) {
      setLoading(true); // Show loading spinner
      if (gameMode === "new_game") {
        socket.emit("join_or_create_room");
      } else if (gameMode === "play_with_friends") {
        socket.emit("create_room_for_friends");
      }
    }
  };

  // Trigger room creation or joining based on game mode
  useEffect(() => {
    if (gameMode) {
      joinOrCreateRoom();
    }
  }, [gameMode]);

  return (
    <div className="text-center">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Rock Paper Scissors</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        roomCode && (
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
        )
      )}
    </div>
  );
};

export default Play;
