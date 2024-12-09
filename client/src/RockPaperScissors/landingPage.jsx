import React from 'react';

const LandingPage = ({ onButtonClick }) => {
  const handleNewGameClick = () => {
    onButtonClick("new_game");  // Pass "new_game" when new game button is clicked
  };

  const handlePlayWithFriendsClick = () => {
    onButtonClick("play_with_friends");  // Pass "play_with_friends" when play with friends button is clicked
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
        onClick={handleNewGameClick}
      >
        New Game
      </button>
      <button
        type="button"
        className="text-white mt-5 bg-gradient-to-r w-fit from-cyan-400 h-fit via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        onClick={handlePlayWithFriendsClick}
      >
        Play with Friends
      </button>
    </div>
  );
};

export default LandingPage;
