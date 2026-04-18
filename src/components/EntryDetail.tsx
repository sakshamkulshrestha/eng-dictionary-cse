import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Info, Code, Bookmark, AlertCircle, Terminal, ChevronRight, ChevronLeft, Network, Scale, FileText, Volume2, Search, ArrowRight, Lightbulb, Zap, CheckCircle, Navigation } from 'lucide-react';
import { getFullDomainName } from '../utils/domains';
import MagneticButton from './primitives/MagneticButton';
import TiltCard from './primitives/TiltCard';
import AnimatedText from './primitives/AnimatedText';

export default function EntryDetail({ entry, dictionaryData, onNavigate, onToggleBookmark, isBookmarked, autoSpeak }: any) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  useEffect(() => {
    if (autoSpeak) speakDefinition();
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [entry?.id, autoSpeak]);

  if (!entry) return null;

  const findId = (name: string) => dictionaryData.find((d: any) => d.term?.trim().toLowerCase() === name.trim().toLowerCase())?.id;

  const speakDefinition = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${entry.term}. ${entry.one_line_definition || ''}`);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1400px] w-full mx-auto p-10 sm:p-20 pb-32 relative"
    >
      <MagneticButton
        onClick={() => { window.history.length > 2 ? window.history.back() : onNavigate('home') }}
        variant="ghost"
        className="flex items-center gap-5 font-black mb-10 -ml-2 text-[14px] uppercase tracking-[0.3em]"
      >
        <ChevronLeft className="w-5 h-5 -ml-1" strokeWidth={3} /> Return
      </MagneticButton>

      {/* Header Section */}
      <header className="mb-16 relative">
        <div className="flex items-center justify-between mb-8">
          <motion.span 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--text)]/5 backdrop-blur-md border border-[var(--border)] rounded-full text-[12px] font-bold text-[var(--muted)] uppercase tracking-widest shadow-sm"
          >
            {getFullDomainName(entry.domain)}
          </motion.span>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2">
            <MagneticButton
              onClick={speakDefinition}
              variant="ghost"
              className="w-12 h-12 rounded-full backdrop-blur-sm border border-[var(--border)]/50 text-[var(--muted)] hover:text-[var(--text)] transition-all bg-[var(--hover)]/80 shadow-sm"
              title="Read aloud"
            >
              <Volume2 className="w-[20px] h-[20px]" strokeWidth={2.5} />
            </MagneticButton>
            <MagneticButton
              onClick={() => onToggleBookmark(entry.id)}
              variant="ghost"
              className={`w-12 h-12 rounded-full backdrop-blur-sm border border-[var(--border)]/50 transition-all bg-[var(--hover)]/80 shadow-sm ${isBookmarked ? 'text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <Bookmark className="w-[20px] h-[20px]" strokeWidth={isBookmarked ? 3 : 2.5} />
            </MagneticButton>
          </motion.div>
        </div>
        
        {/* Term & One-line definition */}
        <div className="relative mb-8">
           <motion.div 
            style={{ scale: bgScale }}
            className="absolute -left-10 top-0 w-[400px] h-[400px] bg-[var(--text)] opacity-[0.03] blur-[150px] pointer-events-none rounded-full"
          />
          <AnimatedText 
            key={entry.id}
            text={entry.term} 
            el="h1" 
            className="text-[10vw] sm:text-[8vw] font-black leading-[0.9] tracking-tight text-[var(--text)] relative z-10 mb-6 drop-shadow-sm" 
            animationType="words" 
            delayOffset={0.1} 
          />
          {entry.one_line_definition && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl sm:text-4xl text-[var(--text)] font-semibold leading-tight tracking-tight relative z-10 max-w-4xl italic opacity-90 border-l-4 border-[var(--text)]/20 pl-6 py-2"
            >
              {entry.one_line_definition}
            </motion.p>
          )}
        </div>
      </header>

      {/* Main Body - Glassmorphism Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 relative z-10">
        
        {/* Left Column (Core Intel) */}
        <div className="space-y-8">
          
          {/* 1. Explanation */}
          {entry.explanation && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="p-8 sm:p-10 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-3xl shadow-lg"
            >
              <h2 className="text-sm font-bold text-[var(--muted)] mb-6 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4" /> Core Explanation
              </h2>
              <p className="text-[18px] sm:text-[22px] leading-[1.8] text-[var(--text)] font-medium tracking-tight">
                {entry.explanation}
              </p>
            </motion.div>
          )}

          {/* 2. Technical Definition */}
          {entry.technical_definition && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="p-8 sm:p-10 bg-[var(--text)]/5 backdrop-blur-xl border border-[var(--border)] rounded-3xl shadow-lg"
            >
              <h2 className="text-sm font-bold text-[var(--muted)] mb-6 uppercase tracking-widest flex items-center gap-2">
                <Code className="w-4 h-4" /> Technical Definition
              </h2>
              <p className="text-[16px] sm:text-[18px] leading-[1.8] text-[var(--text)] font-medium font-mono opacity-90">
                {entry.technical_definition}
              </p>
            </motion.div>
          )}

          {/* 3. Syntax / Example */}
          {entry.syntax_or_example && (
             <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="p-8 sm:p-10 rounded-3xl shadow-2xl bg-[var(--text)]/10 backdrop-blur-2xl border-2 border-[var(--border)] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 transition-opacity opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleCopy(entry.syntax_or_example)}
                  className="bg-[var(--bg)]/80 backdrop-blur-sm px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <h2 className="text-sm font-bold text-[var(--muted)] mb-6 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Usage Example
              </h2>
              <pre className="text-[var(--text)] font-mono text-[14px] sm:text-[16px] leading-[1.8] overflow-x-auto whitespace-pre-wrap">
                <code>{entry.syntax_or_example}</code>
              </pre>
            </motion.div>
          )}

          {/* Analogies Grid (4 & 5) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {entry.real_world_analogy && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="p-8 rounded-3xl bg-[var(--text)] text-[var(--bg)] shadow-xl relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Lightbulb className="w-32 h-32" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Real World Analogy
                </h2>
                <p className="text-[18px] sm:text-[20px] leading-relaxed font-bold italic relative z-10">
                  "{entry.real_world_analogy}"
                </p>
              </motion.div>
            )}

            {entry.computer_analogy && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="p-8 rounded-3xl bg-[var(--hover)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 opacity-[0.03] text-[var(--text)]">
                  <Zap className="w-32 h-32" />
                </div>
                <h2 className="text-[11px] font-black text-[var(--text)] uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
                  <Code className="w-3 h-3" /> System Analogy
                </h2>
                <p className="text-[18px] sm:text-[20px] text-[var(--text)] leading-relaxed font-bold italic relative z-10">
                  "{entry.computer_analogy}"
                </p>
              </motion.div>
            )}
          </div>

          {/* 10. Comparisons UI */}
          {entry.comparisons?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-12 space-y-4">
              <h2 className="text-[14px] font-bold text-[var(--muted)] mb-6 uppercase tracking-widest flex items-center gap-2">
                <Scale className="w-5 h-5" /> Architectural Comparisons
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {entry.comparisons.map((c: any, i: number) => {
                  const targetId = findId(c.target);
                  return (
                    <div key={i} className="group p-6 sm:p-8 bg-[var(--hover)]/30 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-all">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                           <span className="text-[20px] font-bold text-[var(--text)]">{c.target}</span>
                           {targetId && (
                             <button onClick={() => onNavigate(targetId)} className="p-1 rounded-full bg-[var(--text)]/10 text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
                               <ArrowRight className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                       </div>
                       <p className="text-[16px] text-[var(--text)] opacity-90 leading-relaxed mb-4">
                         {c.note}
                       </p>
                       {c.winner_scenario && (
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg text-sm font-medium">
                           <CheckCircle className="w-4 h-4" /> Use when: {c.winner_scenario}
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column (Meta & Links) */}
        <div className="space-y-6">
          
          {/* 6. Common Misconceptions */}
          {entry.common_misconception?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="p-8 bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-3xl"
            >
              <h2 className="text-[12px] font-black text-red-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Common Pitfalls
              </h2>
              <ul className="space-y-4">
                {entry.common_misconception.map((misc: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[14px] font-medium text-[var(--text)] opacity-90 leading-relaxed">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                    <span>{misc}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* 7. Suggested Related Terms */}
          {entry.suggested_related_terms?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="p-8 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-3xl"
            >
              <h2 className="text-[12px] font-bold text-[var(--muted)] mb-5 uppercase tracking-widest flex items-center gap-2">
                <Network className="w-4 h-4" /> Related Nodes
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.suggested_related_terms.map((w: string, i: number) => {
                  const targetId = findId(w);
                  return (
                    <button 
                      key={i} 
                      onClick={() => targetId && onNavigate(targetId)} 
                      className={`px-4 py-2 text-[13px] font-medium rounded-xl border border-[var(--border)] transition-all ${targetId ? 'bg-[var(--text)]/5 hover:bg-[var(--text)] hover:text-[var(--bg)] cursor-pointer' : 'bg-transparent opacity-50 cursor-default'}`}
                    >
                       {w}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 8. Prerequisites */}
          {entry.prerequisites?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-3xl"
            >
              <h2 className="text-[12px] font-bold text-[var(--muted)] mb-5 uppercase tracking-widest flex items-center gap-2">
                <Search className="w-4 h-4" /> Prerequisites
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.prerequisites.map((w: string, i: number) => {
                  const targetId = findId(w);
                  return (
                    <button 
                      key={i} 
                      onClick={() => targetId && onNavigate(targetId)} 
                      className={`px-4 py-2 text-[13px] font-medium rounded-xl border border-[var(--border)] transition-all ${targetId ? 'bg-[var(--text)]/5 hover:bg-[var(--text)] hover:text-[var(--bg)] cursor-pointer' : 'bg-transparent opacity-50 cursor-default'}`}
                    >
                       {w}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 9. Next Steps */}
          {entry.next_steps?.length > 0 && (
             <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-3xl"
            >
              <h2 className="text-[12px] font-bold text-[var(--muted)] mb-5 uppercase tracking-widest flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Next Steps
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.next_steps.map((w: string, i: number) => {
                  const targetId = findId(w);
                  return (
                    <button 
                      key={i} 
                      onClick={() => targetId && onNavigate(targetId)} 
                      className={`group flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-xl border border-[var(--border)] transition-all ${targetId ? 'bg-[var(--text)]/5 hover:bg-[var(--text)] hover:text-[var(--bg)] cursor-pointer' : 'bg-transparent opacity-50 cursor-default'}`}
                    >
                       {w}
                       {targetId && <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
