import React, { useState } from "react";
import Header from "./header";
import Play from "./play";
import LandingPage from "./landingPage";

const Hero = () => {
  const [showGame, setShowGame] = useState(false);
  const [gameMode, setGameMode] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
    setRoomCode("");
    setShowGame(true);
  };

  const handleJoinRoom = (code) => {
    setGameMode("join_room");
    setRoomCode(code);
    setShowGame(true);
  };

  const handleBackToMainMenu = () => {
    setGameMode("");
    setRoomCode("");
    setShowGame(false);
  };

  return (
    <div className="flex items-center min-h-screen flex-col bg-custom-gradient justify-center">
      {showGame ? (
        <Play
          gameMode={gameMode}
          roomCode={roomCode}
          onBackToMainMenu={handleBackToMainMenu}
        />
      ) : (
        <LandingPage
          onGameModeSelect={handleGameModeSelect}
          onJoinRoom={handleJoinRoom}
        />
      )}
    </div>
  );
};

export default Hero;
