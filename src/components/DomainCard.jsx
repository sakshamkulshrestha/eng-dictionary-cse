import React from 'react';
import { ChevronRight, Bookmark } from 'lucide-react';
import { getFullDomainName } from '../utils/domains';

export default function DomainCard({ title, count, onClick, delay = 0 }) {
  
  return (
    <div 
      onClick={onClick} 
      className={`apple-card cursor-pointer group flex flex-col justify-between min-h-[160px] animate-slide-up hover:border-accent/40 hover:bg-accent-10/30 transition-all duration-500`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0 z-10">
        <div className="w-9 h-9 rounded-full bg-accent shadow-lg shadow-accent/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-full bg-accent-10 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
          <Bookmark className="w-[22px] h-[22px] text-accent" />
        </div>
        <h3 className="text-[24px] font-bold tracking-tight text-black dark:text-white mb-2 leading-tight">
          {getFullDomainName(title)}
        </h3>
      </div>
      
      <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 relative z-10">
        {count} terms
      </p>
    </div>
  );
}