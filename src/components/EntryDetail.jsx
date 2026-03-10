import React, { useState } from 'react';
import { ChevronRight, ArrowUpRight, Info, BookOpen, AlertCircle, Code, Layers, Bookmark, Check, Copy, Sparkles } from 'lucide-react';

export default function EntryDetail({ entry, dictionaryData, onNavigate, onToggleBookmark, isBookmarked }) {
  const [copied, setCopied] = useState(false);

  if (!entry) return <div className="text-center py-20 text-gray-500">Term not found.</div>;

  const findTermId = (termName) => {
    const found = dictionaryData.find(d => d.term.toLowerCase() === termName.toLowerCase());
    return found ? found.id : null;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
      
      {/* --- TOP HEADER --- */}
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
              {entry.domain}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {entry.term}
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-2xl">
            {entry.definition_short}
          </p>
        </div>

        {/* Simple iOS Style Bookmark */}
        <button 
          onClick={() => onToggleBookmark(entry)}
          className={`p-4 rounded-full transition-all duration-300 ${
            isBookmarked 
            ? 'bg-yellow-400 text-white shadow-lg' 
            : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-10">
          
          {/* THE CONCEPT (Simple & Clean) */}
          <section className="p-8 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Info className="w-4 h-4"/>
              <h2 className="text-xs font-bold uppercase tracking-widest">Simple Explanation</h2>
            </div>
            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {entry.explanation}
            </p>
          </section>

          {/* CODE / IMPLEMENTATION */}
          {entry.syntax_or_example && (
            <section className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Code className="w-4 h-4"/>
                  <h2 className="text-xs font-bold uppercase tracking-widest">How it looks</h2>
                </div>
                <button 
                  onClick={() => handleCopy(entry.syntax_or_example)}
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                >
                  {copied ? "Done!" : "Copy Code"}
                </button>
              </div>
              
              <div className="bg-zinc-900 dark:bg-black rounded-[2rem] p-8 overflow-hidden shadow-xl">
                <pre className="text-indigo-300 font-mono text-sm leading-7 overflow-x-auto whitespace-pre">
                  <code>{entry.syntax_or_example}</code>
                </pre>
              </div>
            </section>
          )}

          {/* HARDWARE DETAILS (Only shows if info exists) */}
          {entry.working_principle && (
            <section className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/20">
               <h2 className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase mb-4 tracking-widest">How it works</h2>
               <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{entry.working_principle}</p>
            </section>
          )}
        </div>

        {/* --- SIDEBAR (iOS Cards) --- */}
        <div className="space-y-6">
          
          {/* COMPARISONS */}
          {entry.comparisons?.length > 0 && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Compare</h2>
              <div className="space-y-6">
                {entry.comparisons.map((c, i) => {
                  const targetId = findTermId(c.target);
                  return (
                    <div key={i} className="group cursor-pointer" onClick={() => targetId && onNavigate('entry', targetId)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                          vs. {c.target}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-gray-300"/>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal">{c.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MISTAKES (Soft Red) */}
          {entry.common_misconceptions?.length > 0 && (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-[2rem] border border-red-100 dark:border-red-900/20">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                <AlertCircle className="w-3 h-3"/> Don't forget
              </h2>
              {entry.common_misconceptions.map((m, i) => (
                <p key={i} className="text-xs font-medium text-red-700 dark:text-red-400 leading-relaxed mb-2 last:mb-0">
                  • {m}
                </p>
              ))}
            </div>
          )}

          {/* RELATED TAGS */}
          {entry.related_words?.length > 0 && (
            <div className="p-2">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Related</h2>
              <div className="flex flex-wrap gap-2">
                {entry.related_words.map((word, i) => {
                  const wordId = findTermId(word);
                  return (
                    <button
                      key={i}
                      onClick={() => wordId && onNavigate('entry', wordId)}
                      className="text-xs font-semibold px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}