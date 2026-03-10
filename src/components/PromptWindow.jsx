import React, { useState } from 'react';
import { Sparkles, ArrowUp, Compass, ChevronRight, Hash } from 'lucide-react';
import Fuse from 'fuse.js';

export default function PromptWindow({ dictionaryData, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);

  const getFullDomainName = (domainName) => {
    if (domainName === 'DBMS') return 'Database Management System';
    return domainName;
  };

  const fuse = new Fuse(dictionaryData, { 
    keys: [{ name: 'term', weight: 2 }, { name: 'explanation', weight: 1 }, { name: 'definition_short', weight: 1 }], 
    threshold: 0.4 
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setResults(fuse.search(prompt).slice(0, 5).map(r => r.item));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center animate-fade-in text-black dark:text-white pb-32">
      
      {/* Premium HERO */}
      <header className="mb-12 w-full text-center mt-4">
        <div className="inline-flex w-16 h-16 bg-[var(--ios-blue)]/10 rounded-full items-center justify-center mb-6 shadow-sm">
          <Sparkles className="w-8 h-8 text-[var(--ios-blue)]" />
        </div>
        <h1 className="text-6xl sm:text-[84px] font-extrabold tracking-[-0.04em] mb-4 leading-none animate-slide-up bg-clip-text text-transparent bg-gradient-to-b from-blue-500 to-purple-600 pb-3">
          Synthesis
        </h1>
        <p className="text-xl sm:text-[22px] text-[#8E8E93] font-medium max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
          Describe your objective to dynamically generate a clinical roadmap.
        </p>
      </header>

      {/* Premium INPUT MODULE (Siri / Apple Intelligence Style) */}
      <div className="w-full max-w-3xl relative mb-20 px-2 sm:px-0 animate-slide-up delay-150">
        <div className="apple-card group p-6 min-h-[170px] pb-16 flex flex-col focus-within:shadow-[0_24px_48px_rgb(0,0,0,0.06)] dark:focus-within:shadow-[0_24px_48px_rgb(0,0,0,0.4)]">
          <textarea 
            className="w-full bg-transparent border-none outline-none text-[19px] resize-none text-black dark:text-white placeholder-[#8E8E93] font-medium leading-relaxed flex-1"
            placeholder="e.g. How does a CPU handle logic and memory synchronization?"
            value={prompt}
            rows={3}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            onClick={handleGenerate} 
            disabled={!prompt.trim()}
            className={`absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              prompt.trim() ? 'bg-[var(--ios-blue)] text-white shadow-[0_8px_16px_rgba(0,122,255,0.4)] hover:shadow-[0_12px_24px_rgba(0,122,255,0.6)] active:scale-90 hover:-translate-y-0.5' : 'bg-[#E5E5EA] dark:bg-[#2C2C2E] text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ROADMAP GRID (Premium Apple Cards) */}
      {results.length > 0 && (
        <div className="w-full px-2 sm:px-0 mb-12 animate-fade-in">
           <div className="flex items-center gap-3 mb-8 pl-2 w-full justify-center">
             <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2C2C2E] flex items-center justify-center">
               <Compass className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
             </div>
             <h2 className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">
               Curated Pathway
             </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
             {results.map((item, idx) => {
               const delayClass = `delay-${((idx % 4) * 50) + 100}`;
               return (
               <div 
                 key={item.id} 
                 onClick={() => onNavigate('entry', item.id)} 
                 className={`apple-card cursor-pointer group flex flex-col min-h-[190px] overflow-hidden animate-slide-up ${delayClass}`}
               >
                 <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 z-10">
                   <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center">
                     <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                   </div>
                 </div>
                 
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-5">
                     <span className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[13px] font-bold text-black dark:text-white flex items-center justify-center flex-shrink-0">
                       {idx + 1}
                     </span>
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors group-hover:bg-purple-500 group-hover:text-white">
                       <Hash className="w-3.5 h-3.5" />
                       {getFullDomainName(item.domain)}
                     </span>
                   </div>
                   
                   <h3 className="text-[22px] font-bold tracking-tight text-black dark:text-white mb-2 leading-tight pr-6">
                     {item.term}
                   </h3>
                 </div>
                 <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mt-auto relative z-10">
                   {item.definition_short}
                 </p>
               </div>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
}