import React from 'react';
import { Info, List, ChevronRight } from 'lucide-react';

export default function EntryDetail({ entry, onNavigate }) {
  if (!entry) return <div className="text-center py-20 text-gray-500">Term not found.</div>;
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <nav className="flex items-center text-sm text-gray-500 mb-8 space-x-2">
        <span className="hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Home</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white font-medium">{entry.term}</span>
      </nav>
      <div className="mb-10">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">{entry.domain}</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight mt-4">{entry.term}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">{entry.definition_short}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-4"><Info className="w-5 h-5 text-indigo-500" />Detailed Explanation</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-7 text-justify">{entry.explanation}</p>
          </section>
        </div>
      </div>
    </div>
  );
}