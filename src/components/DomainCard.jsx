import React from 'react';
import { ChevronRight, Bookmark } from 'lucide-react';

export default function DomainCard({ title, count, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="group relative bg-[#F9F9FB] dark:bg-[#1C1C1E] p-7 rounded-[2rem] shadow-sm hover:shadow-[0_24px_48px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_24px_48px_rgb(0,0,0,0.4)] border border-black/[0.03] dark:border-white/[0.05] cursor-pointer hover:-translate-y-1 transition-all duration-400 active:scale-[0.98] flex flex-col justify-between min-h-[160px] overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-x-4 group-hover:translate-x-0">
        <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-300" />
        </div>
      </div>
      
      <div>
        <div className="w-10 h-10 rounded-full bg-[var(--ios-blue)]/10 flex items-center justify-center mb-4">
          <Bookmark className="w-5 h-5 text-[var(--ios-blue)]" />
        </div>
        <h3 className="text-[22px] font-bold tracking-tight text-black dark:text-white mb-2 leading-tight">
          {title}
        </h3>
      </div>
      
      <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">
        {count} components
      </p>
    </div>
  );
}