import React, { useState, useEffect } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null)); // 3x3 board
  const [isXNext, setIsXNext] = useState(true); // True if it's X's turn, False if O's turn
  const [winner, setWinner] = useState(null); // To track the winner
  const [isSinglePlayer, setIsSinglePlayer] = useState(false); // Mode: Single player or multiplayer
  const [playerWins, setPlayerWins] = useState(0); // Player's score
  const [computerWins, setComputerWins] = useState(0); // Computer's score

  // Function to check for a winner
  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Winner found
      }
    }
    return null; // No winner yet
  };

  // Function to handle clicks on the board
  const handleClick = (index) => {
    if (board[index] || winner) return; // Ignore clicks if the spot is filled or if there's a winner

    // Update the board with the current player's move (X or O)
    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    // Check if there is a winner after the move
    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      if (newWinner === 'X') setPlayerWins(playerWins + 1);
      if (newWinner === 'O') setComputerWins(computerWins + 1);
    } else {
      // Switch the turn to the other player
      setIsXNext(!isXNext);
    }
  };

  // Function to reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  // AI Move (Computer playing as 'O')
  const aiMove = () => {
    const availableMoves = board
      .map((value, index) => (value === null ? index : null))
      .filter((value) => value !== null);

    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];

    // Wait for AI to make a move after the player's move
    if (randomMove !== undefined) {
      setTimeout(() => {
        handleClick(randomMove);
      }, 500); // AI moves after 500ms
    }
  };

  // If the game is in single-player mode and it's the computer's turn
  useEffect(() => {
    if (isSinglePlayer && !isXNext && winner === null) {
      aiMove();
    }
  }, [isXNext, board, isSinglePlayer, winner]);

  // Rendering a single square
  const renderSquare = (index) => {
    return (
      <button
        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-200 border-2 border-blue-500 rounded-lg text-2xl sm:text-3xl font-bold flex items-center justify-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-300"
        onClick={() => handleClick(index)}
      >
        {board[index]}
      </button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-blue-700 to-purple-800 text-white p-4">
      {/* First Column for the Grid */}
      <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-6">
        <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="flex justify-center items-center text-black">
              {renderSquare(index)}
            </div>
          ))}
        </div>
      </div>

      {/* Second Column for Heading, Options, and Info */}
      <div className="flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">Tic Tac Toe</h1>

        <div className="mb-4 md:mb-6">
          <button
            onClick={() => setIsSinglePlayer(!isSinglePlayer)}
            className="bg-yellow-500 text-black px-2 sm:px-4 py-1 sm:py-2 rounded-lg mb-2 md:mb-4 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isSinglePlayer ? 'Switch to Multiplayer' : 'Switch to Single Player'}
          </button>
        </div>

        <div className="text-lg sm:text-xl md:text-2xl mb-4 md:mb-6">
          {winner ? (
            <h2 className="font-semibold">Winner: {winner}</h2>
          ) : (
            <h2 className="font-semibold">{isXNext ? "Player's Turn (X)" : isSinglePlayer ? `Computer's Turn (O)` : "Player's Turn (O)"}</h2>
          )}
        </div>

        <div className="mb-4 md:mb-6">
          <button
            onClick={resetGame}
            className="bg-green-500 text-black px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Reset Game
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-8 text-lg sm:text-xl md:text-2xl font-semibold">
          <div className="text-center">
            <h3>Player X: {playerWins}</h3>
          </div>
          <div className="text-center">
            <h3>Computer O: {computerWins}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
