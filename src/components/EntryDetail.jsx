import React, { useState, useEffect } from 'react';
import { Info, Code, Bookmark, AlertCircle, Terminal, ChevronRight, ChevronLeft, Hash, Network, Scale, FileText, Volume2 } from 'lucide-react';
import { getFullDomainName } from '../utils/domains';

export default function EntryDetail({ entry, dictionaryData, onNavigate, onToggleBookmark, isBookmarked, autoSpeak }) {
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (autoSpeak) speakDefinition();
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [entry?.id, autoSpeak]);

  if (!entry) return null;

  const findId = (name) => dictionaryData.find(d => d.term.trim().toLowerCase() === name.trim().toLowerCase())?.id;

  const speakDefinition = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${entry.term}. ${entry.definition_short}`);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-16 animate-fade-in pb-32">
      <button 
        onClick={() => { window.history.length > 2 ? window.history.back() : onNavigate('home') }} 
        className="flex items-center gap-1 text-accent font-semibold hover:opacity-70 transition-opacity mb-8 -ml-2 text-[17px] active:scale-95 origin-left"
      >
        <ChevronLeft className="w-6 h-6 -ml-1" strokeWidth={2.5} /> Back
      </button>

      {/* Editorial Space Hero */}
      <header className="mb-14">
        <div className="flex items-center justify-between mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/5 dark:bg-white/10 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {getFullDomainName(entry.domain)}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={speakDefinition}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white transition-all hover:bg-black/5 dark:hover:bg-white/10"
              title="Read aloud"
            >
              <Volume2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => onToggleBookmark(entry)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isBookmarked ? 'text-accent' : 'text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white'} hover:bg-black/5 dark:hover:bg-white/10`}
            >
              <Bookmark className="w-[18px] h-[18px]" strokeWidth={isBookmarked ? 3 : 2.5} />
            </button>
          </div>
        </div>
        
        <h1 className="text-5xl sm:text-[68px] font-black tracking-[-0.04em] mb-6 leading-[0.95] text-black dark:text-white animate-slide-up">
          {entry.term}
        </h1>
        <p className="text-[20px] sm:text-[24px] text-gray-500 dark:text-gray-400 font-medium leading-snug tracking-tight animate-slide-up delay-100">
          {entry.definition_short}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12 lg:gap-20">
        {/* Left Column: Main Content */}
        <div className="space-y-16">
          <div className="animate-slide-up delay-150">
            <p className="text-[21px] sm:text-[24px] leading-[1.7] text-gray-800 dark:text-gray-200 font-medium tracking-[-0.01em]">
              {entry.explanation}
            </p>
          </div>

          {/* Technical Pull Quote */}
          {entry.technical_definition && (
            <div className="animate-slide-up delay-200 my-16 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent rounded-full opacity-50"></div>
              <div className="pl-10 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-accent uppercase"/>
                  <span className="text-[13px] font-bold text-accent uppercase tracking-widest">Technical Precision</span>
                </div>
                <p className="text-[22px] sm:text-[28px] leading-[1.6] text-gray-600 dark:text-[#EAEAF0] font-medium font-serif italic">
                  "{entry.technical_definition}"
                </p>
              </div>
            </div>
          )}
          
          <div className="hidden lg:block pt-8 border-t border-black/5 dark:border-white/10">
            {/* Tags Desktop */}
            {entry.related_words?.length > 0 && (
              <div>
                <h2 className="text-[13px] font-bold text-gray-400 mb-5 uppercase tracking-widest flex items-center gap-2 pl-2">
                  <Network className="w-4 h-4"/> Related Nodes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {entry.related_words.map((w, i) => {
                    const targetId = findId(w);
                    return (
                      <button 
                        key={i} 
                        onClick={() => targetId && onNavigate('entry', targetId)} 
                        className={`px-6 py-3 rounded-full text-[16px] font-bold transition-all duration-300 shadow-sm ${targetId ? 'bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/[0.05] text-black dark:text-white hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer hover:bg-accent hover:border-accent hover:text-white hover:shadow-accent/30' : 'bg-transparent border border-black/10 dark:border-white/10 text-gray-400 cursor-default'}`}
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

        {/* Right Column: Cards & Details */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Differences */}
            {entry.comparisons?.length > 0 && (
              <div className="apple-card flex flex-col group cursor-default animate-slide-up delay-200 p-8">
                <h2 className="text-[14px] font-bold text-gray-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Scale className="w-4 h-4"/> Differences
                </h2>
                <div className="flex flex-col gap-4">
                  {entry.comparisons.map((c, i) => {
                    const targetId = findId(c.target);
                    return (
                      <div 
                        key={i} 
                        onClick={() => targetId && onNavigate('entry', targetId)}
                        className={`p-6 rounded-3xl border border-black/[0.04] dark:border-white/[0.06] bg-[#EAEAF0] dark:bg-[#151517] flex flex-col transition-all duration-400 ${targetId ? 'cursor-pointer hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg dark:hover:shadow-none hover:bg-white dark:hover:bg-[#2C2C2E] group/card active:scale-[0.97]' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[20px] font-extrabold text-black dark:text-white tracking-tight">{c.target}</span>
                          {targetId && <ChevronRight className="w-5 h-5 text-[#8E8E93] group-hover/card:text-accent transition-colors" />}
                        </div>
                        <span className="text-[16px] font-medium text-[#8E8E93] leading-relaxed">{c.note}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Misconceptions */}
            {entry.common_misconceptions?.length > 0 && (
              <div className="apple-card flex flex-col group !bg-red-50 dark:!bg-red-950/20 !border-red-500/10 cursor-default animate-slide-up delay-250 p-8">
                <h2 className="text-[13px] font-bold text-red-600 dark:text-red-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4"/> Misconceptions
                </h2>
                <ul className="space-y-5">
                  {entry.common_misconceptions.map((m, i) => (
                    <li key={i} className="text-[16px] font-medium text-red-900 dark:text-red-200 flex items-start gap-4 leading-relaxed">
                       <span className="text-red-500 font-black mt-1 text-lg leading-none">•</span>
                       <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        {/* Code Block */}
        {entry.syntax_or_example && (
          <div className="apple-card group !bg-[#282A36] dark:!bg-[#151517] p-8 relative overflow-hidden mt-8 cursor-default animate-slide-up delay-300">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Terminal className="w-4 h-4"/> Implementation
               </h2>
               <button 
                onClick={() => handleCopy(entry.syntax_or_example)} 
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[14px] font-bold text-white transition-all active:scale-95 border border-white/10"
               >
                 {copied ? "Copied!" : "Copy Code"}
               </button>
            </div>
            <pre className="text-gray-200 font-mono text-[16px] leading-relaxed overflow-x-auto pb-4 scrollbar-thin">
              <code>{entry.syntax_or_example}</code>
            </pre>
          </div>
        )}
        </div>
      </div>
      
      {/* Tags Mobile */}
      <div className="block lg:hidden pt-12 mt-12 border-t border-black/5 dark:border-white/10">
        {entry.related_words?.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold text-gray-400 mb-5 uppercase tracking-widest flex items-center gap-2 pl-2">
              <Network className="w-4 h-4"/> Related Nodes
            </h2>
            <div className="flex flex-wrap gap-3">
              {entry.related_words.map((w, i) => {
                const targetId = findId(w);
                return (
                  <button 
                    key={i} 
                    onClick={() => targetId && onNavigate('entry', targetId)} 
                    className={`px-5 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 shadow-sm ${targetId ? 'bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/[0.05] text-black dark:text-white hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer hover:bg-accent hover:border-accent hover:text-white hover:shadow-accent/30' : 'bg-transparent border border-black/10 dark:border-white/10 text-gray-400 cursor-default'}`}
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