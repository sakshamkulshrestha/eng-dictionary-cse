import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function DomainCard({ title, count, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="amoled-card p-6 rounded-md cursor-pointer group flex flex-col justify-between min-h-[140px]"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-black dark:text-white tracking-tight">{title}</h3>
        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white transition-colors transform group-hover:translate-x-1" />
      </div>
      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-4 block">
        {count} terms
      </span>
    </div>
  );
}