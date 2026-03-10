import React, { useState } from 'react';
import { ChevronRight, ArrowUpRight, Info, Code, Layers, Bookmark, Check, Copy, AlertCircle } from 'lucide-react';

export default function EntryDetail({ entry, dictionaryData, onNavigate, onToggleBookmark, isBookmarked }) {
  const [copied, setCopied] = useState(false);

  if (!entry) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-20">Entry_Missing</div>
    </div>
  );

  const findId = (name) => dictionaryData.find(d => d.term.toLowerCase() === name.toLowerCase())?.id;
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-16 animate-fade-in text-black dark:text-white">
      
      {/* --- BREADCRUMBS --- */}
      <nav className="flex items-center gap-2 mb-10 text-[11px] font-bold uppercase tracking-widest opacity-30">
        <span className="hover:opacity-100 cursor-pointer" onClick={() => onNavigate('home')}>Library</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:opacity-100 cursor-pointer" onClick={() => onNavigate('index', null, entry.domain)}>{entry.domain}</span>
      </nav>

      {/* --- HERO HEADER --- */}
      <header className="mb-20 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              {entry.term}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-snug max-w-2xl">
              {entry.definition_short}
            </p>
          </div>
          
          <button 
            onClick={() => onToggleBookmark(entry)} 
            className={`p-4 rounded-full transition-all duration-500 active:scale-90 ${
              isBookmarked 
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xl' 
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* LEFT COLUMN: PRIMARY INFO */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* ABOUT SECTION */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-400">
              <Info className="w-4 h-4"/>
              <h2 className="text-xs font-bold uppercase tracking-widest">About</h2>
            </div>
            <div className="p-8 md:p-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
              <p className="text-lg md:text-xl text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                {entry.explanation}
              </p>
            </div>
          </section>

          {/* IMPLEMENTATION (CLEAN TERMINAL) */}
          {entry.syntax_or_example && (
            <section className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Code className="w-4 h-4"/>
                  <h2 className="text-xs font-bold uppercase tracking-widest">Structure</h2>
                </div>
                <button 
                  onClick={() => handleCopy(entry.syntax_or_example)} 
                  className="text-[11px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  {copied ? "Copied" : "Copy Code"}
                </button>
              </div>
              <div className="bg-zinc-950 rounded-[2rem] p-8 md:p-10 overflow-hidden shadow-2xl border border-zinc-800/50">
                <pre className="text-zinc-300 font-mono text-[14px] leading-8 whitespace-pre">
                  <code>{entry.syntax_or_example}</code>
                </pre>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: INSIGHTS */}
        <div className="space-y-12">
          
          {/* COMPARISONS */}
          {entry.comparisons?.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-2">Differences</h2>
              <div className="space-y-4">
                {entry.comparisons.map((c, i) => {
                  const targetId = findId(c.target);
                  return (
                    <div 
                      key={i} 
                      className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] shadow-sm group cursor-pointer"
                      onClick={() => targetId && onNavigate('entry', targetId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm group-hover:underline underline-offset-4 tracking-tight">vs. {c.target}</span>
                        {targetId && <ArrowUpRight className="w-3 h-3 text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors"/>}
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">{c.note}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* PITFALLS */}
          {entry.common_misconceptions?.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-2">Common Mistakes</h2>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-[1.5rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                <ul className="space-y-4">
                  {entry.common_misconceptions.map((m, i) => (
                    <li key={i} className="flex gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <AlertCircle className="w-3 h-3 text-zinc-400 flex-shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* DISCOVER MORE */}
          {entry.related_words?.length > 0 && (
            <section className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-2">Related Topics</h2>
              <div className="flex flex-wrap gap-2 px-1">
                {entry.related_words.map((w, i) => {
                  const wId = findId(w);
                  return (
                    <button 
                      key={i} 
                      onClick={() => wId && onNavigate('entry', wId)} 
                      className="text-[11px] font-bold px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95"
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}