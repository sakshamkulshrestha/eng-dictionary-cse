import React from 'react';

export default function Logo({ onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="flex items-center cursor-pointer select-none group"
    >
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tighter text-black dark:text-white leading-none">
          Engineered<span className="font-light text-zinc-400">.</span>
        </span>
        <div className="h-[1px] w-0 group-hover:w-full bg-black dark:bg-white transition-all duration-500 mt-1" />
      </div>
    </div>
  );
}