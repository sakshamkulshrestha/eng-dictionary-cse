import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

export default function SearchBar({ dictionaryData, onSelectTerm }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      const lowerQuery = query.toLowerCase();
      const matches = dictionaryData.filter(item =>
        item.term.toLowerCase().includes(lowerQuery) || item.domain.toLowerCase().includes(lowerQuery)
      ).slice(0, 8);
      setSuggestions(matches);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, dictionaryData]);

  const handleSelect = (termId) => {
    onSelectTerm(termId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full z-50">
      <div className="relative group shadow-lg rounded-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
        </div>
        <input 
          type="text" 
          className="block w-full pl-12 pr-12 py-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300" 
          placeholder="Search engineering terms..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onFocus={() => query.length > 1 && setIsOpen(true)} 
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer active:scale-90 transition-transform">
            <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <X className="h-4 w-4 text-gray-500" />
            </div>
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute mt-3 w-full glass-panel border-white/50 rounded-2xl overflow-hidden animate-fade-in origin-top">
          <ul className="py-2">
            {suggestions.map((item) => (
              <li 
                key={item.id} 
                onClick={() => handleSelect(item.id)} 
                className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 px-4 py-3 flex justify-between items-center group transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">{item.term}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.domain}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}