import React from 'react';
import { ArrowRight, Bookmark, Search } from 'lucide-react';

export default function IndexView({ dictionaryData, activeFilter, navigate, title = "Full Index" }) {
  // Filter by domain if a filter is active
  const filteredData = activeFilter 
    ? dictionaryData.filter(item => item.domain === activeFilter)
    : dictionaryData;

  // Alphabetical sort
  const sortedData = [...filteredData].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-12">
        {/* If the title is "Saved Bookmarks", show a yellow icon */}
        {title.includes("Saved") ? (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <Bookmark className="w-8 h-8 text-yellow-500 fill-current" />
          </div>
        ) : (
          <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white">
          {title}
        </h1>
      </div>

      {sortedData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedData.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate('entry', item.id)}
              className="group p-6 bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-white transition-all cursor-pointer flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg dark:text-white mb-1">{item.term}</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{item.domain}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 dark:text-white" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32">
          <p className="text-gray-400 uppercase tracking-[0.3em] text-xs">Nothing found in this collection.</p>
        </div>
      )}
    </div>
  );
}