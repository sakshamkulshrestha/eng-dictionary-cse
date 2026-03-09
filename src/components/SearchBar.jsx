import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import Fuse from 'fuse.js';

export default function SearchBar({ dictionaryData, onSelectTerm }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fuseOptions = {
    keys: ['term', 'domain'],
    threshold: 0.3,
    distance: 100,
    ignoreLocation: true,
    includeScore: true
  };

  const fuse = new Fuse(dictionaryData, fuseOptions);

  useEffect(() => {
    if (query.length > 1) {
      const results = fuse.search(query);
      const matches = results.map(result => result.item).slice(0, 8);
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
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
        </div>
        
        <input 
          type="text" 
          className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#27272A] hover:border-gray-400 dark:hover:border-gray-600 focus:border-black dark:focus:border-white rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all text-sm shadow-sm" 
          placeholder="Search dictionary..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onFocus={() => query.length > 1 && setIsOpen(true)} 
        />
        
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
            <X className="h-4 w-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#27272A] rounded-md shadow-xl overflow-hidden animate-fade-in origin-top z-[100]">
          {/* Added 'text-left' here to ensure nothing inherits centering */}
          <ul className="py-1 divide-y divide-gray-50 dark:divide-gray-800/50 text-left">
            {suggestions.map((item) => (
              <li 
                key={item.id} 
                onClick={() => handleSelect(item.id)} 
                className="cursor-pointer bg-white dark:bg-[#0A0A0A] hover:bg-gray-50 dark:hover:bg-[#111111] px-4 py-3 flex justify-between items-center group transition-colors"
              >
                {/* Fixed internal alignment: ensures term is top and domain is bottom, both left-aligned */}
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate w-full">
                    {item.term}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 truncate w-full">
                    {item.domain}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}