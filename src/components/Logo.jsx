import React from 'react';

export default function Logo({ onClick }) {
  return (
    <div onClick={onClick} className="flex items-center cursor-pointer select-none">
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tighter text-black dark:text-white leading-none">
          CS<span className="text-gray-400 dark:text-gray-600">Dict</span>.
        </span>
      </div>
    </div>
  );
}