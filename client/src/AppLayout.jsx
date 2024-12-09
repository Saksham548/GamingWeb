import React from 'react';
import { Link } from 'react-router-dom';

const AppLayout = () => {
  return (
    <>
      {/* Main Heading Section */}
      <header className="text-center py-10 bg-blue-600 text-white shadow-md">
        <h1 className="text-4xl md:text-5xl font-bold">Welcome to GameHub</h1>
        <p className="mt-2 text-lg md:text-xl">Choose your adventure below:</p>
      </header>

      {/* Buttons Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12 px-4">
        
        {/* Rock Paper Scissors */}
        <Link 
          to="/rps" 
          className="w-60 h-60 bg-green-500 hover:bg-green-600 cursor-pointer flex justify-center items-center text-white text-lg font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Rock Paper Scissors
        </Link>

        {/* Tic Tac Toe */}
        <Link 
          to="/tictactoe" 
          className="w-60 h-60 bg-purple-500 hover:bg-purple-600 cursor-pointer flex justify-center items-center text-white text-lg font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Tic Tac Toe
        </Link>
      </div>
    </>
  );
};

export default AppLayout;
