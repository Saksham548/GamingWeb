import React, { useState } from "react";
import Header from "./header";
import Play from "./play";
import LandingPage from "./landingPage";

const Hero = () => {
  const [showGame, setShowGame] = useState(false);
  const [gameMode, setGameMode] = useState("");

  const handleButtonClicked = (mode) => {
    setGameMode(mode);
    setShowGame(true);
  };

  const handleBackToMainMenu = () => {
    setGameMode("");
    setShowGame(false);
  };

  return (
    <div className="flex items-center min-h-screen flex-col bg-custom-gradient justify-center">
      {showGame ? (
        <Play gameMode={gameMode} onBackToMainMenu={handleBackToMainMenu} />
      ) : (
        <LandingPage onButtonClick={handleButtonClicked} />
      )}
    </div>
  );
};

export default Hero;
