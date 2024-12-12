import React from "react";
import { Link } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Memphis-Style Gaming Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://cdn.shutterstock.com/shutterstock/videos/1102153557/thumb/1.jpg')",
        }}
      ></div>

      {/* Wrapper for Centered Content */}
      <div className="relative z-10 w-full max-w-4xl bg-gray-900 bg-opacity-90 rounded-xl shadow-xl p-6 md:p-12 mt-12">
        {/* Main Heading Section */}
        <header className="text-center pb-8 border-b border-gray-700">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide text-yellow-400">
            🎮 GameHub
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-light text-gray-300">
            Your gaming adventure starts here
          </p>
        </header>

        {/* Buttons Section */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
          {/* Rock Paper Scissors */}
          <Link
            to="/rps"
            className="group w-52 h-52 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 flex flex-col justify-center items-center"
          >
            <div className="text-3xl group-hover:text-4xl transition-all duration-200">
              ✊ 📄 ✂️
            </div>
            <span className="mt-4 text-lg font-bold tracking-wider">
              Rock Paper Scissors
            </span>
          </Link>

          {/* Tic Tac Toe */}
          <Link
            to="/tictactoe"
            className="group w-52 h-52 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 hover:from-purple-500 hover:to-purple-700 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 flex flex-col justify-center items-center"
          >
            <div className="text-4xl group-hover:text-5xl transition-all duration-200">
              ❌ ⭕
            </div>
            <span className="mt-4 text-lg font-bold tracking-wider">
              Tic Tac Toe
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-12 py-6 text-center text-sm font-light text-gray-400">
        © {new Date().getFullYear()} GameHub | Built for Gamers, by Gamers
      </footer>
    </div>
  );
};

export default AppLayout;
