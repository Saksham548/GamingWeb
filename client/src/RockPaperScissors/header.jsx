import React from "react";

const Header = ({ score }) => {
  return (
    <>
      <div className="flex border-4 border-[var(--header-outline)] max-w-[43.75rem] w-full mt-[1.875rem] h-fit rounded-xl p-5 justify-between border-gray-400 ">
        <div className="text flex flex-col items-start uppercase text-[2.5rem] leading-[2rem] text-white font-bold">
          <span>Rock</span>
          <span>Paper</span>
          <span>Scissors</span>
        </div>
        <div className="bg-white flex 
        flex-col py-3 px-10 rounded-[5px] text-blue-700 font-semibold text-center">
          <span >Score  </span>
          <span>Player 1 : {score.player1}</span>
          <span>Player 2 : {score.player2}</span>
        </div>
      </div>
    </>
  );
};

export default Header;
