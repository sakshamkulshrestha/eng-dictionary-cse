import React, { useState } from 'react';
import { Info, Code, Bookmark, AlertCircle, Terminal, ChevronRight, Hash, Network, Scale, FileText } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in pb-32">
      {/* iOS Large Header with context action */}
      <header className="flex justify-between items-start mb-16 pl-2 sm:pl-0">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--ios-blue)]/10 text-[13px] font-bold text-[var(--ios-blue)] uppercase tracking-widest">
              <Hash className="w-3.5 h-3.5" />
              {entry.domain}
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 leading-tight">
            {entry.term}
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            {entry.definition_short}
          </p>
        </div>
        <button 
          onClick={() => onToggleBookmark(entry)} 
          className={`w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all ml-4 shrink-0 shadow-sm ${isBookmarked ? 'bg-[var(--ios-blue)]/20 shadow-[0_8px_16px_rgba(0,122,255,0.2)]' : 'bg-[#E5E5EA] dark:bg-[#2C2C2E] hover:bg-gray-300 dark:hover:bg-[#3A3A3C]'}`}
        >
          <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-[var(--ios-blue)] text-[var(--ios-blue)]' : 'text-gray-500 dark:text-gray-400'}`} strokeWidth={isBookmarked ? 1 : 2.5} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Concept */}
        <div className="apple-card group p-7 sm:p-10 cursor-default animate-slide-up delay-100">
          <h2 className="text-[14px] font-bold text-gray-500 mb-5 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-4 h-4"/> Concept Overview
          </h2>
          <p className="text-[19px] sm:text-[21px] leading-relaxed text-black dark:text-white font-medium">
            {entry.explanation}
          </p>
        </div>

        {/* Technical Definition */}
        {entry.technical_definition && (
          <div className="apple-card group p-7 cursor-default animate-slide-up delay-150">
            <h2 className="text-[14px] font-bold text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4"/> Technical Definition
            </h2>
            <p className="text-[17px] leading-relaxed text-gray-500 dark:text-gray-400 font-medium italic">
              "{entry.technical_definition}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Differences */}
          {entry.comparisons?.length > 0 && (
            <div className="apple-card flex flex-col group cursor-default animate-slide-up delay-200">
              <h2 className="text-[14px] font-bold text-gray-500 mb-5 uppercase tracking-widest flex items-center gap-2">
                <Scale className="w-4 h-4"/> Differences
              </h2>
              <div className="flex flex-col gap-3">
                {entry.comparisons.map((c, i) => {
                  const targetId = findId(c.target);
                  return (
                    <div 
                      key={i} 
                      onClick={() => targetId && onNavigate('entry', targetId)}
                      className={`p-5 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-[#2C2C2E] flex flex-col transition-all duration-300 ${targetId ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_rgb(0,0,0,0.4)] active:scale-[0.97]' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[18px] font-bold text-black dark:text-white">{c.target}</span>
                        {targetId && <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </div>
                      <span className="text-[15px] font-medium text-gray-500 leading-relaxed">{c.note}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Misconceptions */}
          {entry.common_misconceptions?.length > 0 && (
            <div className="apple-card flex flex-col group !bg-[#FFF9EB] dark:!bg-[#2A2312] !border-amber-500/20 cursor-default animate-slide-up delay-250">
              <h2 className="text-[14px] font-bold text-amber-600 dark:text-amber-500 mb-5 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4"/> Misconceptions
              </h2>
              <ul className="space-y-4">
                {entry.common_misconceptions.map((m, i) => (
                  <li key={i} className="text-[16px] font-medium text-amber-900 dark:text-[#E8DAB2] flex items-start gap-3 leading-relaxed">
                     <span className="text-amber-500 font-bold mt-0.5">•</span>
                     <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Code Block */}
        {entry.syntax_or_example && (
          <div className="apple-card group !bg-[#282A36] dark:!bg-[#151517] p-7 relative overflow-hidden mt-2 cursor-default animate-slide-up delay-300">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Terminal className="w-4 h-4"/> Implementation
               </h2>
               <button 
                onClick={() => handleCopy(entry.syntax_or_example)} 
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[13px] font-bold text-white transition-all active:scale-95 border border-white/10"
               >
                 {copied ? "Copied!" : "Copy Code"}
               </button>
            </div>
            <pre className="text-gray-200 font-mono text-[15px] leading-relaxed overflow-x-auto pb-2 scrollbar-thin">
              <code>{entry.syntax_or_example}</code>
            </pre>
          </div>
        )}

        {/* Tags */}
        {entry.related_words?.length > 0 && (
          <div className="pt-8">
            <h2 className="text-[13px] font-bold text-gray-500 mb-5 uppercase tracking-widest flex items-center gap-2 pl-2">
              <Network className="w-4 h-4"/> Related Nodes
            </h2>
            <div className="flex flex-wrap gap-3">
              {entry.related_words.map((w, i) => {
                const targetId = findId(w);
                return (
                  <button 
                    key={i} 
                    onClick={() => targetId && onNavigate('entry', targetId)} 
                    className={`px-5 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 ${targetId ? 'bg-white dark:bg-[#2C2C2E] border border-black/[0.05] dark:border-white/[0.05] text-black dark:text-white hover:-translate-y-1 hover:shadow-md active:scale-95 shadow-sm cursor-pointer' : 'bg-transparent border border-black/10 dark:border-white/10 text-gray-500 cursor-default'}`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}