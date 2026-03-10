import React, { useState } from 'react';
import { Sparkles, ArrowRight, Compass, Target } from 'lucide-react';
import Fuse from 'fuse.js';

export default function PromptWindow({ dictionaryData, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);

  const fuse = new Fuse(dictionaryData, { 
    keys: [{ name: 'term', weight: 2 }, { name: 'explanation', weight: 1 }], 
    threshold: 0.4 
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setResults(fuse.search(prompt).slice(0, 6).map(r => r.item));
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-24 flex flex-col items-center animate-fade-in text-black dark:text-white">
      
      {/* --- HERO --- */}
      <header className="text-center mb-24 space-y-6">
        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
          <Compass className="w-8 h-8 opacity-30" />
        </div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tight">Synthesis<span className="opacity-20">.</span></h1>
        <p className="text-zinc-500 font-medium text-lg max-w-xl">Describe your learning objective to generate a clinical roadmap.</p>
      </header>

      {/* --- INPUT MODULE --- */}
      <div className="w-full max-w-2xl relative mb-32">
        <textarea 
          className="w-full p-10 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] focus:border-black dark:focus:border-white outline-none text-xl transition-all h-48 resize-none text-center font-medium"
          placeholder="e.g. How does a CPU handle logic?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={handleGenerate} 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl"
        >
          Synthesize Path <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      {/* --- ROADMAP GRID --- */}
      {results.length > 0 && (
        <div className="w-full space-y-16">
           <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-8">
              <Sparkles className="w-4 h-4 opacity-20"/>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Constructed_Roadmap</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, idx) => (
                <div 
                  key={item.id} 
                  onClick={() => onNavigate('entry', item.id)} 
                  className="p-10 bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 cursor-pointer transition-all duration-500 hover:border-black dark:hover:border-white active:scale-95 flex flex-col h-56 justify-between"
                >
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Step 0{idx+1}</span>
                   <div className="space-y-2">
                     <h3 className="font-black text-2xl tracking-tight leading-tight">{item.term}</h3>
                     <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{item.domain}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}