import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Clock, CornerDownLeft } from 'lucide-react';
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
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Bar (Floating appearance) */}
      <div className={`relative flex items-center bg-white dark:bg-black border transition-all duration-500 ${
        isOpen 
        ? 'rounded-[1.5rem] border-black dark:border-white shadow-2xl scale-[1.01]' 
        : 'rounded-[1rem] border-transparent bg-gray-50 dark:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-800'
      }`}>
        <div className="pl-6 pr-4">
          <Search className={`w-4 h-4 transition-colors ${isOpen ? 'text-black dark:text-white' : 'text-gray-400'}`} />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          className="w-full py-5 bg-transparent border-none text-[15px] font-medium outline-none placeholder-gray-400 dark:text-white" 
          placeholder="Command + K to search..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <div className="pr-6 flex items-center gap-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-30">
          {query ? <X className="w-4 h-4 cursor-pointer" onClick={() => setQuery('')}/> : <span>ESC</span>}
        </div>
      </div>

      {/* Droplist Results (Glassmorphism blur) */}
      {isOpen && currentList.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-black dark:border-white rounded-[1.5rem] shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 p-2">
          {query.length === 0 && <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Recents</div>}
          <ul className="space-y-1">
            {currentList.map((itemOrId, idx) => {
              const item = query.length === 0 ? dictionaryData.find(d => d.id === itemOrId) : itemOrId;
              if (!item) return null;
              const active = idx === selectedIndex;
              return (
                <li key={item.id} onClick={() => { onSelectTerm(item.id); setQuery(''); setIsOpen(false); }} className={`px-5 py-3 rounded-[1rem] flex justify-between items-center cursor-pointer transition-colors ${active ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-zinc-900'}`}>
                  <div className="flex flex-col text-left truncate">
                    <span className="text-sm font-bold truncate">{item.term}</span>
                    <span className={`text-[9px] uppercase tracking-widest ${active ? 'opacity-60' : 'opacity-30'}`}>{item.domain}</span>
                  </div>
                  {active && <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}