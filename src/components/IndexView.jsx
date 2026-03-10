import React from 'react';
import { ArrowRight, Hash } from 'lucide-react';

export default function IndexView({ dictionaryData, activeFilter, navigate, title }) {
  // Logic: Filters by activeFilter or shows everything if null
  const filteredData = activeFilter 
    ? dictionaryData.filter(item => item.domain === activeFilter)
    : dictionaryData;

  const sortedData = [...filteredData].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="max-w-6xl mx-auto px-8 py-24 animate-fade-in text-black dark:text-white">
      
      {/* Dynamic Header Module */}
      <header className="mb-32 border-b border-black/5 dark:border-white/5 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
            {activeFilter ? `Collection / ${activeFilter}` : "Full Directory"}
          </span>
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
          {title}
        </h1>
      </header>

      {/* Result Grid */}
      {sortedData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedData.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate('entry', item.id)}
              className="group p-8 bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 cursor-pointer transition-all duration-500 hover:border-black dark:hover:border-white active:scale-95"
            >
              <div className="flex justify-between items-start mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 group-hover:opacity-100">
                  {item.domain}
                </span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-4 group-hover:opacity-60 transition-opacity">
                {item.term}
              </h3>
              
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {item.definition_short}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center opacity-20 uppercase tracking-[0.5em] text-[10px] font-black">
          Directory_Empty
        </div>
      )}
    </div>
  );
}