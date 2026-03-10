import React, { useState } from 'react';
import { Sparkles, ArrowRight, Target, Compass, BookOpen } from 'lucide-react';
import Fuse from 'fuse.js';

export default function PromptWindow({ dictionaryData, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);

  // Intelligent Search: Prioritizes matches in the term and broad context in the explanation
  const fuse = new Fuse(dictionaryData, { 
    keys: [
      { name: 'term', weight: 2 },
      { name: 'explanation', weight: 1 },
      { name: 'domain', weight: 0.5 }
    ], 
    threshold: 0.4,
    distance: 1000,
    ignoreLocation: true
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const searchRes = fuse.search(prompt).slice(0, 6);
    setResults(searchRes.map(r => r.item));
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-24 flex flex-col items-center animate-fade-in text-black dark:text-white">
      
      {/* --- HEADER --- */}
      <header className="text-center mb-24">
        <div className="w-20 h-20 border border-black dark:border-white rounded-full flex items-center justify-center mx-auto mb-10 group hover:bg-black dark:hover:bg-white transition-colors duration-500">
          <Compass className="w-8 h-8 group-hover:text-white dark:group-hover:text-black transition-colors" />
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          Roadmap<span className="text-gray-300">.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg uppercase tracking-widest text-[10px]">
          Describe your learning goal to synthesize a path.
        </p>
      </header>

      {/* --- INPUT --- */}
      <div className="w-full max-w-2xl relative mb-32 group">
        <textarea 
          className="w-full p-10 bg-transparent border border-black/10 dark:border-white/10 rounded-[3rem] focus:border-black dark:focus:border-white outline-none text-xl transition-all h-48 resize-none shadow-none text-center"
          placeholder="e.g. How does a computer store data?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={handleGenerate} 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
        >
          Generate Path <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* --- ROADMAP RESULTS --- */}
      {results.length > 0 && (
        <div className="w-full text-left">
           <div className="flex items-center gap-4 mb-16 border-b border-black/5 dark:border-white/5 pb-8">
              <Sparkles className="w-3 h-3 text-gray-400"/>
              <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400">
                Generated Learning Cycle
              </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {results.map((item, idx) => (
                <div 
                  key={item.id} 
                  onClick={() => onNavigate('entry', item.id)} 
                  className="group border-t border-black dark:border-white pt-8 cursor-pointer hover:opacity-50 transition-all duration-500"
                >
                   <div className="flex justify-between items-start mb-8">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">
                        Step 0{idx+1}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
                        {item.domain}
                      </span>
                   </div>
                   <div className="font-black text-3xl dark:text-white tracking-tighter leading-tight">
                      {item.term}
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                     View Concept <ArrowRight className="w-3 h-3" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}