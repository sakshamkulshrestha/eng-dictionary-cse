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
    <div className="relative w-full max-w-xl mx-auto z-50">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input type="text" className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all" placeholder="Search for terms..." value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => query.length > 1 && setIsOpen(true)} />
        {query && <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"><X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" /></button>}
      </div>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <ul>
            {suggestions.map((item) => (
              <li key={item.id} onClick={() => handleSelect(item.id)} className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 p-3 flex justify-between items-center group transition-colors">
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">{item.term}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.domain}</p></div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}