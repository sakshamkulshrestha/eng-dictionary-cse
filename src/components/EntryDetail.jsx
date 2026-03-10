import React, { useState } from 'react';
import { Info, Code, Layers, Bookmark, AlertCircle, Terminal, ArrowUpRight } from 'lucide-react';

export default function EntryDetail({ entry, dictionaryData, onNavigate, onToggleBookmark, isBookmarked }) {
  const [copied, setCopied] = useState(false);
  if (!entry) return null;

  const findId = (name) => dictionaryData.find(d => d.term.toLowerCase() === name.toLowerCase())?.id;
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-20 animate-fade-in">
      {/* --- HEADER --- */}
      <header className="flex justify-between items-end mb-20 pb-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="space-y-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{entry.domain}</span>
          <h1 className="text-7xl font-black tracking-tighter">{entry.term}</h1>
          <p className="text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-tight max-w-2xl">{entry.definition_short}</p>
        </div>
        <button onClick={() => onToggleBookmark(entry)} className={`p-6 rounded-full transition-all ${isBookmarked ? 'bg-black text-white dark:bg-white dark:text-black shadow-xl' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
          <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </header>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          {/* Concept Card */}
          <section className="apple-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2"><Info className="w-4 h-4"/> Concept</h2>
            <p className="text-xl md:text-2xl font-medium leading-relaxed italic opacity-80">"{entry.explanation}"</p>
          </section>

          {/* Terminal Code Block */}
          {entry.syntax_or_example && (
            <section className="space-y-6 group">
              <div className="flex justify-between px-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Code className="w-4 h-4"/> Implementation</h2>
                <button onClick={() => handleCopy(entry.syntax_or_example)} className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{copied ? "Copied" : "Copy Code"}</button>
              </div>
              <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 relative">
                <div className="flex gap-2 mb-8 opacity-30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <pre className="text-zinc-300 font-mono text-[14px] leading-8"><code>{entry.syntax_or_example}</code></pre>
              </div>
            </section>
          )}
        </div>

        {/* --- SIDEBAR --- */}
        <div className="lg:col-span-4 space-y-12">
          {entry.comparisons?.length > 0 && (
            <section className="apple-card !p-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8">Differences</h2>
              {entry.comparisons.map((c, i) => (
                <div key={i} className="mb-8 last:mb-0 group cursor-pointer" onClick={() => findId(c.target) && onNavigate('entry', findId(c.target))}>
                  <div className="flex justify-between items-center font-bold text-sm mb-1">{c.target} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100" /></div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{c.note}</p>
                </div>
              ))}
            </section>
          )}

          {entry.common_misconceptions?.length > 0 && (
            <section className="apple-card !p-8 !bg-zinc-50 dark:!bg-zinc-900/20">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Misconceptions</h2>
              {entry.common_misconceptions.map((m, i) => <p key={i} className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 last:mb-0 italic">"{m}"</p>)}
            </section>
          )}

          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Related Nodes</h2>
            <div className="flex flex-wrap gap-2">
              {entry.related_words?.map((w, i) => (
                <button key={i} onClick={() => findId(w) && onNavigate('entry', findId(w))} className="text-[10px] font-bold px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-black hover:text-white transition-all">{w}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}