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
      setTimeout(() => {
        toast("Welcome Player 1 !", {
          icon: "ℹ️",
          duration: 10000, 
        });
      }, 3000);
    });

    newSocket.on("room_joined", (code) => {
      setRoomCode(code);
      setLoading(false);
      toast.success("You joined the game session successfully!");
      setTimeout(() => {
        toast("Welcome Player 2 !", {
          icon: "ℹ️", 
          duration: 10000, 
        });
      }, 3000);
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
          ? `Player1 win this round!`
          : `Player2 wins this round!`
      );
      setScore(data.scores);
      setWaitingForOpponent(false);

      // Hide result and choices after 5 seconds
      setTimeout(() => {
        setPlayerChoice(null);
        setOpponentChoice(null);
        setWinner("");
      }, 5000);
    });

    newSocket.on("game_over", (data) => {
      if (data.scores.player1 > data.scores.player2) {
        toast.success("Congratulations! You win the game!");
      } else {
        toast.error("Game Over! Opponent wins the game.");
      }
      resetGame();
    });

    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected");
    };
  }, []);

  const resetGame = () => {
    setRoomCode("");
    setPlayerChoice(null);
    setOpponentChoice(null);
    setWinner("");
    setScore({ player1: 0, player2: 0 });
    setWaitingForOpponent(false);
    onBackToMainMenu();
  };

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
    setWaitingForOpponent(true);
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
  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
        .then(() => toast.success("Room code copied to clipboard!"))
        .catch(() => toast.error("Failed to copy room code."));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-[#1f3756] to-[#141539] justify-center items-center text-white">
      <Toaster />
      {loading ? (
        <div className="text-lg font-bold">Loading...</div>
      ) : roomCode ? (
        <>
           <p className="font-bold">
            Room Code: 
            <span 
              className="cursor-pointer text-blue-400 ml-2" 
              onClick={copyRoomCode}
            >
              {roomCode}
            </span>
          </p>
          <Header score={score} />
          <div className="mb-4"></div>
          <div className="flex justify-center items-center space-x-4 mb-4">
            <button
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleChoice("rock")}
            >
              Rock
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                <path
                  fill="#3B4262"
                  d="M45.06 12.22c-.642-8.096-9.734-7.269-9.734-7.269-3.837-6.765-9.832-1.865-9.832-1.865-4.606-6.63-10.38-.486-10.38-.486-9.957-1.074-9.571 7.066-9.571 7.066-.234 2.588 1.403 10.593 1.403 10.593-1.477-4.614-4.68-.784-4.68-.784-3.94 6.078-.975 9.405-.975 9.405 5.33 6.246 16.688 13.743 16.688 13.743 4.113 2.356 2.373 4.457 2.373 4.457l24.876-4.11.571-4.718c3.782-11.436-.739-26.032-.739-26.032z"
                />
              </svg>
            </button>
            <button
              className=" h-fit bg-blue-400 rounded hover:bg-blue-500 text-white font-bold py-2 px-4"
              onClick={() => handleChoice("paper")}
            >
              Paper
              <svg xmlns="http://www.w3.org/2000/svg" width="49" height="59">
                <path
                  fill="#3B4262"
                  d="M47.125 11.832a2.922 2.922 0 00-1.232-.198c-.57.04-1.029.271-1.302.65-1.604 2.248-2.919 6.493-3.979 9.905-.486 1.577-1.14 3.688-1.612 4.69-.493-2.807.064-13.09.28-17.05l.003-.064c.15-2.751.17-3.234.138-3.446-.238-1.509-.843-2.5-1.799-2.943-.966-.45-2.22-.25-3.572.563-.677.41-.865 1.816-1.446 8.19l-.002.028c-.32 3.502-1.058 11.566-1.965 12.91-1.023-1.88-2.431-12.555-3.039-17.176-.425-3.236-.673-5.094-.84-5.655-.35-1.176-1.83-2.176-3.295-2.232-1.22-.06-2.22.56-2.698 1.638-.894.995-.578 4.292.41 12.102.47 3.718 1.44 11.395.83 12.257-1.219-.133-3.31-4.942-6.215-14.299-.816-2.62-1.068-3.408-1.318-3.753-.494-1.202-2.172-2.129-3.676-2.024a3.183 3.183 0 00-.377.049c-.787.156-2.584.881-2.2 4.226 1.06 4.637 2.213 8.041 3.331 11.346l.023.066c.669 1.98 1.302 3.85 1.89 5.925 1.385 4.9.846 7.94.84 7.975-.046.312-.143.503-.288.57a.556.556 0 01-.195.045c-.44.03-1.098-.26-1.437-.45-.776-1.482-4.636-8.544-8.134-9.524l-.126-.037-.127.012c-1.283.121-2.226.606-2.803 1.441-.914 1.32-.535 3.002-.444 3.34l.052.12c.028.051 2.834 5.165 3.268 7.544.374 2.04 2.311 4.25 3.869 6.026l.064.073c.508.58.946 1.083 1.292 1.548 4.519 4.713 11.665 8.677 11.723 8.71.892.657 1.387 1.293 1.44 1.84a.798.798 0 01-.16.58l-.155.162.988.96 18.853-1.324.804-3.684c2.486-10.402 1.967-19.272 1.958-19.33.01-.327.706-3.483 1.266-6.033l.017-.065c1.117-5.08 2.505-11.4 2.772-13.803.116-1.028-.542-1.972-1.675-2.401z"
                />
              </svg>
            </button>
            <button
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleChoice("scissors")}
            >
              Scissors
              <svg xmlns="http://www.w3.org/2000/svg" width="51" height="58"><path fill="#3B4262" d="M13.971 25.702l6.012-8.415c-2.499-.415-7.088-.507-10.846 3.235C3.212 26.421.812 39.163.312 42.248L15.37 57.24c2.711-.232 14.713-1.827 26.279-13.34.122-.249 2.94-2.321.636-4.614-1.1-1.095-2.919-1.074-4.042.044-.572.57-1.461.577-2.021.02-.56-.557-.552-1.443.02-2.012l4.087-4.069c2.076-2.067.119-5.555-2.78-4.717l-3.345 2.851c-.611.53-1.52.439-2.022-.14-.519-.597-.408-1.503.183-2.013 11.687-10.208 9.98-8.979 17.5-15.995 2.809-2.329-.725-6.447-3.493-4.09L28.182 25.45c-.529.448-1.34.457-1.86-.02-.601-.517-.615-1.262-.222-1.85L38.787 3.944c1.854-2.5-1.795-5.277-3.749-2.757L16.28 27.307c-.452.65-1.364.8-1.985.345a1.377 1.377 0 01-.323-1.95z"/></svg>
            </button>
          </div>

          {playerChoice && <p className="mt-4">Your choice: {playerChoice}</p>}
          {opponentChoice && <p>Opponent's choice: {opponentChoice}</p>}
          {winner && <p className="font-bold text-lg mt-2">{winner}</p>}
        </>
      ) : (
        <div>
            <img src="./game.png" height={150} width={150} className="float-right"></img>
          <div className="text flex flex-col items-start uppercase text-[2.5rem] leading-[2rem] text-white font-bold p-8 ">
            <span>Rock</span>
            <span>Paper</span>
            <span>Scissors</span>
          </div>
          

          <div className="flex justify-center mt-4 space-x-4">
            <button
              className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
              onClick={joinOrCreateRoom}
            >
              Join or Create Game
            </button>
            <button
              className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
              onClick={createRoomForFriends}
            >
              Create Room for Friends
            </button>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter room code"
              className="border p-2 rounded text-black"
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
