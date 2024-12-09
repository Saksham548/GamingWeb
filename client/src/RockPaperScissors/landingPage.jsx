import React, { useState } from "react";

const LandingPage = ({ onGameModeSelect, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState("");

  const handleRoomCodeChange = (e) => {
    setRoomCode(e.target.value.toUpperCase()); // Ensure uppercase codes
  };

  const handleJoinRoom = () => {
    if (roomCode.trim() === "") {
      alert("Please enter a valid room code.");
      return;
    }
    onJoinRoom(roomCode);
  };

  return (
    <div>
      <div className="text flex flex-col items-start uppercase text-[2.5rem] leading-[2rem] text-white font-bold">
        <span>Rock</span>
        <span>Paper</span>
        <span>Scissors</span>
      </div>
      <button
        type="button"
        className="text-white mt-10 bg-gradient-to-r w-fit from-cyan-400 h-fit via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        onClick={() => onGameModeSelect("new_game")}
      >
        New Game
      </button>
      <button
        type="button"
        className="text-white mt-5 bg-gradient-to-r w-fit from-cyan-400 h-fit via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        onClick={() => onGameModeSelect("play_with_friends")}
      >
        Play with Friends
      </button>
      <div className="mt-6">
        <input
          type="text"
          className="input text-black px-3 py-2 border rounded"
          placeholder="Enter room code"
          value={roomCode}
          onChange={handleRoomCodeChange}
        />
        <button
          className="btn ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleJoinRoom}
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
