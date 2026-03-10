import React from 'react';
import { ChevronRight, Bookmark } from 'lucide-react';

export default function DomainCard({ title, count, onClick, delay = 0 }) {
  const delayClass = delay > 0 ? `delay-${delay}` : '';
  
  return (
    <div 
      onClick={onClick} 
      className={`apple-card cursor-pointer group flex flex-col justify-between min-h-[170px] animate-slide-up ${delayClass}`}
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 z-10">
        <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-300" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-full bg-[var(--ios-blue)]/10 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
          <Bookmark className="w-[22px] h-[22px] text-[var(--ios-blue)]" />
        </div>
        <h3 className="text-[24px] font-bold tracking-tight text-black dark:text-white mb-2 leading-tight">
          {title}
        </h3>
      </div>
      
      <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 relative z-10">
        {count} components
      </p>
    </div>
  );
}