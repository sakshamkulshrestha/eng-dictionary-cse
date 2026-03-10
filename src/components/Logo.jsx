import React from 'react';

export default function Logo({ onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="flex items-center cursor-pointer select-none active:opacity-60 transition-opacity"
    >
      <span className="text-[18px] font-bold tracking-tight text-black dark:text-white">
        Engineered
      </span>
    </div>
  );
}