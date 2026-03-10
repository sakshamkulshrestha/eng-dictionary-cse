import React, { useState } from 'react';
import { Sparkles, ArrowUp, Compass, ChevronRight, Hash } from 'lucide-react';
import Fuse from 'fuse.js';

export default function PromptWindow({ dictionaryData, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);

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
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 leading-tight">Synthesis</h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Describe your objective to dynamically generate a clinical roadmap.
        </p>
      </header>

      {/* Premium INPUT MODULE (Siri / Apple Intelligence Style) */}
      <div className="w-full max-w-3xl relative mb-20 px-2 sm:px-0">
        <div className="group relative bg-[#F9F9FB] dark:bg-[#1C1C1E] rounded-[2rem] p-5 shadow-sm focus-within:shadow-[0_24px_48px_rgb(0,0,0,0.06)] dark:focus-within:shadow-[0_24px_48px_rgb(0,0,0,0.4)] border border-black/[0.03] dark:border-white/[0.05] transition-all duration-400 min-h-[160px] pb-16 flex flex-col">
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
             {results.map((item, idx) => (
               <div 
                 key={item.id} 
                 onClick={() => onNavigate('entry', item.id)} 
                 className="group relative bg-[#F9F9FB] dark:bg-[#1C1C1E] p-6 rounded-[2rem] shadow-sm hover:shadow-[0_24px_48px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_24px_48px_rgb(0,0,0,0.4)] border border-black/[0.03] dark:border-white/[0.05] cursor-pointer hover:-translate-y-1 transition-all duration-400 active:scale-[0.98] flex flex-col min-h-[180px] overflow-hidden"
               >
                 <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-x-4 group-hover:translate-x-0">
                   <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center">
                     <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                   </div>
                 </div>

                 <div className="flex items-center gap-3 mb-4">
                   <span className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[13px] font-bold text-black dark:text-white flex items-center justify-center flex-shrink-0">
                     {idx + 1}
                   </span>
                   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors group-hover:bg-[var(--ios-blue)] group-hover:text-white">
                     <Hash className="w-3 h-3" />
                     {item.domain}
                   </span>
                 </div>
                 
                 <h3 className="text-[20px] font-bold tracking-tight text-black dark:text-white mb-2 leading-tight pr-6">
                   {item.term}
                 </h3>
                 <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mt-auto">
                   {item.definition_short}
                 </p>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}