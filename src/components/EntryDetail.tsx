import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Info, Code, Bookmark, AlertCircle, Terminal, ChevronRight, ChevronLeft, Hash, Network, Scale, FileText, Volume2 } from 'lucide-react';
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

  const titleY = useTransform(scrollYProgress, [0, 1], ["0px", "200px"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  useEffect(() => {
    if (autoSpeak) speakDefinition();
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [entry?.id, autoSpeak]);

  if (!entry) return null;

  const findId = (name: string) => dictionaryData.find((d: any) => d.term.trim().toLowerCase() === name.trim().toLowerCase())?.id;

  const speakDefinition = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${entry.term}. ${entry.definition_short}`);
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
      className="max-w-[1400px] w-full mx-auto p-20 pb-32 relative"
    >
      <MagneticButton
        onClick={() => { window.history.length > 2 ? window.history.back() : onNavigate('home') }}
        variant="ghost"
        className="flex items-center gap-5 font-black mb-10 -ml-2 text-[14px] uppercase tracking-[0.3em]"
      >
        <ChevronLeft className="w-5 h-5 -ml-1" strokeWidth={3} /> Protocol Back
      </MagneticButton>

      {/* Editorial Space Hero */}
      <header className="mb-20 relative">
        <div className="flex items-center justify-between mb-10">
          <motion.span 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] bg-transparent text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]"
          >
            {getFullDomainName(entry.domain)}
          </motion.span>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2">
            <MagneticButton
              onClick={speakDefinition}
              variant="ghost"
              className="w-10 h-10 p-0 text-[var(--muted)] hover:text-[var(--text)] transition-all bg-[var(--hover)]"
              title="Read aloud"
            >
              <Volume2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </MagneticButton>
            <MagneticButton
              onClick={() => onToggleBookmark(entry.id)}
              variant="ghost"
              className={`w-10 h-10 p-0 transition-all bg-[var(--hover)] ${isBookmarked ? 'text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <Bookmark className="w-[18px] h-[18px]" strokeWidth={isBookmarked ? 3 : 2.5} />
            </MagneticButton>
          </motion.div>
        </div>
        
        <div className="relative mb-10 overflow-visible">
          <motion.div 
            style={{ scale: bgScale }}
            className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--neo-purple)] opacity-[0.25] blur-[180px] pointer-events-none"
          />
          <AnimatedText 
            text={entry.term} 
            el="h1" 
            className="text-[12vw] sm:text-[10vw] font-black leading-[0.85] tracking-tighter uppercase text-[var(--text)] relative z-10 break-words" 
            animationType="chars" 
            delayOffset={0.1} 
          />
        </div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          className="text-2xl sm:text-3xl text-[var(--muted)] font-bold leading-tight tracking-tight relative z-10 max-w-4xl"
        >
          {entry.definition_short}
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12 lg:gap-20">
        {/* Left Column: Main Content */}
        <div className="space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          >
            <p className="text-[21px] sm:text-[24px] leading-[1.7] text-[var(--text)] font-medium tracking-[-0.01em]">
              {entry.definition_detailed}
            </p>
            {entry.logic_deep && (
              <p className="mt-6 text-[18px] leading-[1.7] text-[var(--muted)] font-medium tracking-[-0.01em]">
                {entry.logic_deep}
              </p>
            )}
          </motion.div>

          {/* Technical Pull Quote */}
          {entry.analogy && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
              className="my-20 relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[var(--text)]" />
              <div className="pl-15 py-5">
                <div className="flex items-center gap-3 mb-5">
                  <FileText className="w-4 h-4 text-[var(--text)] uppercase" />
                  <span className="text-[10px] font-black text-[var(--text)] uppercase tracking-[0.4em]">Protocol Analogy</span>
                </div>
                <p className="text-[24px] sm:text-[32px] leading-[1.4] text-[var(--muted)] font-black tracking-tight italic">
                  "{entry.analogy}"
                </p>
              </div>
            </motion.div>
          )}

          <div className="hidden lg:block pt-8 border-t border-[var(--border)]">
            {/* Tags Desktop */}
            {entry.related_terms?.length > 0 && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-[13px] font-bold text-[var(--muted)] mb-5 uppercase tracking-widest flex items-center gap-2 pl-2">
                  <Network className="w-4 h-4" /> Related Words
                </h2>
                <div className="flex flex-wrap gap-3">
                  {entry.related_terms.map((w: string, i: number) => {
                    const targetId = findId(w);
                    if (targetId) {
                      return (
                        <MagneticButton key={i} onClick={() => onNavigate(targetId)} variant="secondary" className="px-6 py-3 text-[16px]">
                           {w}
                        </MagneticButton>
                      )
                    }
                    return (
                      <span key={i} className="px-6 py-3 text-[16px] font-bold bg-transparent border border-[var(--border)] text-[var(--muted)] cursor-default">
                        {w}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Cards & Details */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Differences */}
            {entry.comparisons?.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex flex-col gap-4">
                <h2 className="text-[14px] font-bold text-[var(--muted)] mb-2 uppercase tracking-widest flex items-center gap-2 pl-2">
                  <Scale className="w-4 h-4" /> Differences
                </h2>
                {entry.comparisons.map((c: any, i: number) => {
                  const targetId = findId(c.target);
                  return (
                    <TiltCard
                      key={i}
                      onClick={() => targetId && onNavigate(targetId)}
                      interactive={!!targetId}
                      className={targetId ? 'group p-10 neo-card neo-card-interactive' : 'p-10 neo-card opacity-80'}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[20px] font-extrabold text-[var(--text)] tracking-tight">{c.target}</span>
                        {targetId && <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--text)] transition-colors" />}
                      </div>
                      <span className="text-[16px] font-medium text-[var(--muted)] leading-relaxed">{c.note}</span>
                    </TiltCard>
                  );
                })}
              </motion.div>
            )}

            {/* Misconceptions */}
            {entry.common_misconceptions?.length > 0 && (
              <div className="neo-card border-[var(--neo-pink)]/30 bg-[var(--neo-pink)]/5 p-10">
                <h2 className="text-[10px] font-black text-[var(--neo-pink)] mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
                  <AlertCircle className="w-4 h-4" /> Protocol Warnings
                </h2>
                <ul className="space-y-6">
                  {entry.common_misconceptions.map((m: string, i: number) => (
                    <li key={i} className="text-[14px] font-bold text-[var(--text)] opacity-90 flex items-start gap-4 leading-relaxed">
                      <span className="w-2 h-2 bg-[var(--neo-pink)] mt-2 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Code Block */}
          {entry.syntax_or_example && (
             <div className="neo-card p-10 mt-10 border-2 !border-[var(--text)] bg-[var(--pop-black)]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.4em] flex items-center gap-3">
                  <Terminal className="w-4 h-4" /> Logic Protocol
                </h2>
                <button
                  onClick={() => handleCopy(entry.syntax_or_example)}
                  className="neo-btn-secondary px-4 py-2 text-[9px] uppercase tracking-widest"
                >
                  {copied ? "IDENTIFIED" : "COPY CODE"}
                </button>
              </div>
              <pre className="text-[var(--text)] font-mono text-[13px] leading-relaxed overflow-x-auto pb-5 custom-scrollbar">
                <code>{entry.syntax_or_example}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Tags Mobile */}
      <div className="block lg:hidden pt-12 mt-12 border-t border-[var(--border)]">
        {entry.related_terms?.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold text-[var(--muted)] mb-5 uppercase tracking-widest flex items-center gap-2 pl-2">
              <Network className="w-4 h-4" /> Related Words
            </h2>
            <div className="flex flex-wrap gap-3">
              {entry.related_terms.map((w: string, i: number) => {
                const targetId = findId(w);
                if (targetId) {
                  return (
                    <MagneticButton key={i} onClick={() => onNavigate(targetId)} variant="secondary" className="px-6 py-3 text-[16px]">
                       {w}
                    </MagneticButton>
                  );
                }
                return (
                  <span key={i} className="px-5 py-2.5 text-[15px] font-bold bg-transparent border border-[var(--border)] text-[var(--muted)] cursor-default">
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
