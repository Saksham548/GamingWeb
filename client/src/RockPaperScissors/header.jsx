import React from 'react'

const header = ({score}) => {
  return (
    <>
    <div className="flex border-4 border-[var(--header-outline)] max-w-[43.75rem] w-full mt-[1.875rem] h-fit rounded-xl p-5 justify-between border-gray-400 ">
    <div className="text flex flex-col items-start uppercase text-[2.5rem] leading-[2rem] text-white font-bold">
    <span>Rock</span>
        <span>Paper</span>
        <span>Scissors</span>
    </div>
    <div className="score-box bg-white text-[var(--score-text)] py-3 px-10 rounded-[5px] text-blue-700 font-semibold">
        <span>Score</span>
        <div className="score-box__score text-[var(--dark-text)] text-[3.5rem] font-bold">
            {score}
        </div>
    </div>
</div>
</>

  )
}

export default header