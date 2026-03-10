import React from 'react';
import { ArrowRight, Hash } from 'lucide-react';

export default function IndexView({ dictionaryData, activeFilter, navigate, title }) {
  // Strict filtering logic
  const filteredData = activeFilter 
    ? dictionaryData.filter(item => item.domain === activeFilter)
    : dictionaryData;

  const sortedData = [...filteredData].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="max-w-6xl mx-auto px-8 py-24 animate-fade-in text-black dark:text-white">
      
      {/* Dynamic Header */}
      <header className="mb-32 border-b border-black dark:border-white pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-3 h-3 text-gray-300" />
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400">
            {activeFilter ? `Collection / ${activeFilter}` : "Full Directory"}
          </span>
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">
          {title}<span className="text-gray-300">.</span>
        </h1>
      </header>

      {sortedData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {sortedData.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate('entry', item.id)}
              className="group border-t border-black dark:border-white pt-8 cursor-pointer transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 group-hover:opacity-100 transition-opacity">
                  {item.domain}
                </span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter leading-tight mb-4 group-hover:opacity-50 transition-opacity">
                {item.term}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                {item.definition_short}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center uppercase tracking-[0.5em] text-[10px] opacity-20 font-black">
          No_Nodes_In_Category
        </div>
      )}
    </div>
  );
}