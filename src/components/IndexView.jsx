import React from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function IndexView({ dictionaryData, activeFilter, navigate }) {
  const filteredData = activeFilter ? dictionaryData.filter(d => d.domain === activeFilter) : [...dictionaryData];
  filteredData.sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{activeFilter ? `${activeFilter} Index` : 'Full Index'}</h2>
        {activeFilter && <button onClick={() => navigate('index')} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"><X className="w-4 h-4 mr-1" /> Clear Filter</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map(item => (
          <div key={item.id} onClick={() => navigate('entry', item.id)} className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md cursor-pointer transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600">{item.term}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.domain}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}