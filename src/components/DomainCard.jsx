import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function DomainCard({ title, count, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="group p-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 cursor-pointer active-compress transition-all hover:border-black dark:hover:border-white"
    >
      <div className="flex justify-between items-center mb-10 px-1">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{count} Nodes</span>
        {/*
           Minimalist arrow that shifts slightly on mouse hover.
        */}
        <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all bg-white dark:bg-black">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
      <h3 className="text-4xl font-extrabold tracking-tighter leading-none group-hover:opacity-60 transition-opacity">
        {title}
      </h3>
    </div>
  );
}