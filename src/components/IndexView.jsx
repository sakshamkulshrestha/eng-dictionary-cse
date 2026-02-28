import React from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function IndexView({ dictionaryData, activeFilter, navigate }) {
  const filteredData = activeFilter ? dictionaryData.filter(d => d.domain === activeFilter) : [...dictionaryData];
  filteredData.sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 glass-panel p-6 rounded-3xl">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          {activeFilter ? `${activeFilter} Index` : 'Full Index'}
        </h2>
        {activeFilter && (
          <button onClick={() => navigate('index')} className="mt-4 md:mt-0 px-4 py-2 bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-all active:scale-95 flex items-center text-sm font-semibold shadow-sm">
            <X className="w-4 h-4 mr-1" /> Clear Filter
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredData.map((item, i) => (
          <div 
            key={item.id} 
            onClick={() => navigate('entry', item.id)} 
            className="group glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer flex justify-between items-center animate-fade-in"
            style={{animationDelay: `${(i % 15) * 30}ms`}}
          >
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">{item.term}</h3>
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{item.domain}</p>
            </div>
            <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-cyan-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}