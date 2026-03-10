import React from 'react';

export default function Logo({ onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="flex items-center cursor-pointer select-none group"
    >
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tighter text-black dark:text-white leading-none">
          CS<span className="font-light text-gray-400 dark:text-gray-500">Dict</span>
          <span className="text-black dark:text-white transition-opacity group-hover:opacity-30">.</span>
        </span>
        <div className="h-[1px] w-0 group-hover:w-full bg-black dark:bg-white transition-all duration-500 mt-0.5" />
      </div>
    </div>
  );
}