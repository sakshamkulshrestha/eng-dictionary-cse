import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Clock, CornerDownLeft } from 'lucide-react';
import Fuse from 'fuse.js';

export default function SearchBar({ dictionaryData, onSelectTerm, history = [] }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  const fuse = new Fuse(dictionaryData, { 
    keys: ['term', 'domain'], 
    threshold: 0.3 
  });

  useEffect(() => {
    if (query.length > 1) {
      const results = fuse.search(query);
      setSuggestions(results.map(r => r.item).slice(0, 6));
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    const list = query.length === 0 ? history : suggestions;
    if (list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % list.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + list.length) % list.length);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const selected = list[selectedIndex];
      handleSelect(query.length === 0 ? selected : selected.id);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (id) => {
    onSelectTerm(id);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const currentList = query.length === 0 ? history : suggestions;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* --- MAIN INPUT BAR --- */}
      <div className={`relative flex items-center transition-all duration-500 border ${
        isOpen 
        ? 'bg-white dark:bg-zinc-900 border-black dark:border-white shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] scale-[1.02]' 
        : 'bg-gray-50 dark:bg-zinc-900/50 border-transparent hover:border-gray-200 dark:hover:border-zinc-700'
      } rounded-2xl overflow-hidden`}>
        
        <div className="pl-6 pr-4">
          <Search className={`w-4 h-4 transition-colors ${isOpen ? 'text-black dark:text-white' : 'text-gray-400'}`} />
        </div>

        <input 
          ref={inputRef}
          type="text" 
          className="w-full py-5 bg-transparent border-none text-[16px] font-medium outline-none placeholder-gray-400 dark:text-white" 
          placeholder="Search for concepts..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />

        <div className="pr-6 flex items-center gap-3">
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-gray-200/50 dark:bg-white/10 rounded-md">
             <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">ESC</span>
          </div>
        </div>
      </div>

      {/* --- RESULTS PANEL --- */}
      {isOpen && currentList.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-black border border-black dark:border-white rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_60px_-12px_rgba(255,255,255,0.05)] z-[100] overflow-hidden animate-fade-in">
          <div className="p-3">
            {query.length === 0 && (
              <div className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 border-b border-gray-50 dark:border-zinc-900 mb-2 flex justify-between items-center">
                <span>Recent History</span>
                <Clock className="w-3 h-3" />
              </div>
            )}
            
            <ul className="space-y-1">
              {currentList.map((itemOrId, idx) => {
                const item = query.length === 0 ? dictionaryData.find(d => d.id === itemOrId) : itemOrId;
                if (!item) return null;
                const active = idx === selectedIndex;

                return (
                  <li 
                    key={item.id} 
                    onClick={() => handleSelect(item.id)} 
                    className={`px-5 py-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all duration-300 ${
                      active ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="flex flex-col items-start truncate text-left">
                        <span className="text-[15px] font-bold tracking-tight truncate">{item.term}</span>
                        <span className={`text-[9px] uppercase tracking-widest font-black ${active ? 'opacity-60' : 'opacity-30'}`}>
                          {item.domain}
                        </span>
                      </div>
                    </div>
                    {active ? (
                      <div className="flex items-center gap-2 opacity-60">
                         <span className="text-[9px] font-black">SELECT</span>
                         <CornerDownLeft className="w-3 h-3" />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-10" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}