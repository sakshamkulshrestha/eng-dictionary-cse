import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookMarked, Target } from 'lucide-react';
import Fuse from 'fuse.js';

export default function PromptWindow({ dictionaryData, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);

  const fuse = new Fuse(dictionaryData, { keys: ['term', 'domain', 'explanation'], threshold: 0.4 });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const searchRes = fuse.search(prompt).slice(0, 6);
    setResults(searchRes.map(r => r.item));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="mb-16">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Target className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">What do you want to learn today?</h1>
        <p className="text-gray-500 font-medium">Describe your goal and we'll map out the topics.</p>
      </div>

      <div className="relative group max-w-2xl mx-auto mb-20">
        <textarea 
          className="w-full p-8 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl focus:border-indigo-500 outline-none text-xl transition-all h-40 resize-none shadow-xl"
          placeholder="e.g. Help me understand how computer memory works..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={handleGenerate} className="absolute bottom-6 right-6 bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-2xl font-black flex items-center gap-3 hover:shadow-2xl transition-all active:scale-95">
          Map It <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {results.length > 0 && (
        <div className="text-left animate-slide-up">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 px-4 flex items-center gap-2"><Sparkles className="w-3 h-3 text-indigo-500"/> Recommended Roadmap</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((item, idx) => (
                <div key={item.id} onClick={() => onNavigate('entry', item.id)} className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500 group transition-all">
                   <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">Step 0{idx+1}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{item.domain}</span>
                   </div>
                   <div className="font-bold text-lg dark:text-white group-hover:text-indigo-500 transition-colors">{item.term}</div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}