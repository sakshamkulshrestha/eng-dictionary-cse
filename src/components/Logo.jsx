import React from 'react';
import { Book } from 'lucide-react';

export default function Logo({ onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-2 cursor-pointer select-none">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-2 rounded-lg">
        <Book className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          CS<span className="text-indigo-600 dark:text-indigo-400">Dict</span>
        </span>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">
          Engineering Edition
        </span>
      </div>
    </div>
  );
}