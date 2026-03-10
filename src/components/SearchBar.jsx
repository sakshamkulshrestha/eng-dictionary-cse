import React, { useState, useEffect, useRef } from 'react';
import { Search, XIcon, Clock, ChevronRight } from 'lucide-react';
import Fuse from 'fuse.js';

export default function SearchBar({ dictionaryData, onSelectTerm, history = [] }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  const fuse = new Fuse(dictionaryData, { keys: ['term', 'domain'], threshold: 0.3 });

  useEffect(() => {
    if (query.length > 1) {
      const results = fuse.search(query);
      setSuggestions(results.map(r => r.item).slice(0, 5));
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    const list = query.length === 0 ? history : suggestions;
    if (list.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => (prev + 1) % list.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => (prev - 1 + list.length) % list.length); }
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      const selected = list[selectedIndex];
      onSelectTerm(query.length === 0 ? selected : selected.id);
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
  };

  const currentList = query.length === 0 ? history : suggestions;

  return (
    <div className="relative w-full mx-auto z-40">
      {/* Search Input Bar iOS Spotlight Style (Premium Pill) */}
      <div className={`relative flex items-center transition-all duration-300 bg-[#EAEAF0] dark:bg-[#2C2C2E] rounded-full h-[44px] px-3 border border-transparent focus-within:bg-white focus-within:dark:bg-[#1C1C1E] focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-20 group`}>
        <div className="pl-3 pr-2">
          <Search className="w-5 h-5 text-[#8E8E93] group-focus-within:text-accent transition-colors" />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          className="w-full h-full bg-transparent border-none text-[16px] font-medium outline-none placeholder-[#8E8E93] text-black dark:text-white caret-[var(--ios-blue)]" 
          placeholder="Search" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {query && (
          <div className="pr-3 flex items-center">
             <button onClick={() => setQuery('')} className="bg-[#8E8E93] rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity">
               <XIcon className="w-3.5 h-3.5 text-white dark:text-black" />
             </button>
          </div>
        )}
      </div>

      {/* Flyout Results */}
      {isOpen && currentList.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-3 bg-[#FFFFFF]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up border border-black/[0.05] dark:border-white/[0.1] transform-gpu">
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {currentList.map((itemOrId, idx) => {
              const item = query.length === 0 ? dictionaryData.find(d => d.id === itemOrId) : itemOrId;
              if (!item) return null;
              const active = idx === selectedIndex;
              return (
                <li key={item.id} onClick={() => { onSelectTerm(item.id); setQuery(''); setIsOpen(false); }} className={`flex justify-between items-center cursor-pointer transition-colors px-5 py-4 ${active ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10'}`}>
                  <div className="flex flex-col text-left truncate flex-grow pr-4">
                    <span className="text-[17px] font-semibold tracking-tight text-black dark:text-white truncate pb-0.5">{item.term}</span>
                    <span className="text-[13px] text-gray-500 truncate">{item.domain}</span>
                  </div>
                  {query.length === 0 ? <Clock className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}