import React, { useState } from 'react';
import Header from './header';
import Play from './play';
import LandingPage from './landingPage';

const Hero = () => {
  const [showBoth, setShowBoth] = useState(false);
  const [gameMode, setGameMode] = useState(null);  // Track if the game mode is for "new game" or "play with friends"

  // Handle button clicks from LandingPage to determine game mode
  const handleButtonClicked = (mode) => {
    setGameMode(mode);
    setShowBoth(true);
  };

  return (
    <div className="flex items-center min-h-screen flex-col bg-custom-gradient justify-center">
      {showBoth ? (
        <>
          <Header />
          <Play gameMode={gameMode} />
        </>
      ) : (
        <LandingPage onButtonClick={handleButtonClicked} />
      )}
    </div>
  );
};

export default Hero;
