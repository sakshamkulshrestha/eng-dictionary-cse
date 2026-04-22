import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Info, Code, Bookmark, BookmarkCheck, AlertCircle, Terminal, ChevronRight, ChevronLeft, Network, Scale, FileText, Volume2, Search, ArrowRight, Lightbulb, Zap, CheckCircle, Navigation, Link2 } from 'lucide-react';
import { getFullDomainName } from '../utils/domains';
import MagneticButton from './primitives/MagneticButton';
import TiltCard from './primitives/TiltCard';
import AnimatedText from './primitives/AnimatedText';

export default function EntryDetail({ entry, dictionaryData, onNavigate, onNavigateDomain, onToggleBookmark, isBookmarked, autoSpeak }: any) {
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
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${entry.term}. ${entry.one_line_definition || ''}`);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try to find a good American English voice
    const loadVoicesAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleNames = ['Samantha', 'Victoria', 'Karen', 'Tessa', 'Moira', 'Google UK English Female', 'Google US English Female'];
      const preferred = voices.find(v => femaleNames.some(name => v.name.includes(name)));
      const usEnglish = voices.find(v => v.lang === 'en-US' && v.localService);
      const anyEnglish = voices.find(v => v.lang.startsWith('en'));
      utterance.voice = preferred || usEnglish || anyEnglish || null;
      window.speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoicesAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Section animation config
  const sectionAnim = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }
  };

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full relative"
    >
      {/* Back button */}
      <MagneticButton
        onClick={() => { window.history.length > 2 ? window.history.back() : onNavigate('home') }}
        variant="ghost"
        className="flex items-center gap-4 font-black mb-8 -ml-2 text-[13px] uppercase tracking-[0.2em] rounded-xl"
      >
        <ChevronLeft className="w-5 h-5 -ml-1" strokeWidth={3} /> Return
      </MagneticButton>

      {/* Header Section */}
      <header className="mb-14 relative">
        <div className="flex items-center justify-between mb-8">
          {/* Clickable domain badge */}
          <motion.button
            onClick={() => onNavigateDomain?.(entry.domain)}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--text)]/5 backdrop-blur-md border border-[var(--border)] rounded-full text-[12px] font-bold text-[var(--muted)] uppercase tracking-widest shadow-sm hover:bg-[var(--text)]/10 hover:border-[var(--text)]/30 hover:text-[var(--text)] transition-all cursor-pointer group"
          >
            {getFullDomainName(entry.domain)}
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </motion.button>

          {/* Action buttons */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2">
            {/* Read aloud */}
            <MagneticButton
              onClick={speakDefinition}
              variant="ghost"
              className="w-11 h-11 rounded-full backdrop-blur-sm border border-[var(--border)]/50 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-all"
              title="Read aloud"
            >
              <Volume2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </MagneticButton>

            {/* Bookmark — very clear visual difference */}
            <MagneticButton
              onClick={() => onToggleBookmark(entry.id)}
              variant="ghost"
              className={`w-11 h-11 rounded-full backdrop-blur-sm border transition-all ${
                isBookmarked
                  ? 'bg-[var(--neo-green)] border-[var(--neo-green)] text-[var(--pop-black)] shadow-[0_0_16px_rgba(229,254,64,0.3)]'
                  : 'border-[var(--border)]/50 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]'
              }`}
            >
              {isBookmarked
                ? <BookmarkCheck className="w-[18px] h-[18px]" strokeWidth={2.5} />
                : <Bookmark className="w-[18px] h-[18px]" strokeWidth={2.5} />
              }
            </MagneticButton>
          </motion.div>
        </div>
        
        {/* Term & One-line definition */}
        <div className="relative mb-8">
           <motion.div 
            style={{ scale: bgScale }}
            className="absolute -left-10 top-0 w-[400px] h-[400px] bg-[var(--neo-green)] opacity-[0.04] blur-[150px] pointer-events-none rounded-full"
          />
          <AnimatedText 
            key={entry.id}
            text={entry.term} 
            el="h1" 
            className="text-[10vw] sm:text-[7vw] font-black leading-[0.9] tracking-tight text-[var(--text)] relative z-10 mb-6 drop-shadow-sm" 
            animationType="words" 
            delayOffset={0.1} 
          />
          {entry.one_line_definition && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-3xl text-[var(--text)] font-semibold leading-snug tracking-tight relative z-10 max-w-4xl italic opacity-90 border-l-4 border-[var(--neo-green)]/30 pl-6 py-2"
            >
              {entry.one_line_definition}
            </motion.p>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-col gap-10 sm:gap-14 relative z-10 w-full mb-24">
        
        {/* Top Info Grid: Primary definitions and metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] flex-col gap-8">
          
          {/* Top Left: Core & Technical */}
          <div className="space-y-8">
            {/* 1. Core Explanation */}
            {entry.explanation && (
              <motion.div 
                {...sectionAnim}
                className="p-8 sm:p-10 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-sm"
              >
                <h2 className="text-sm font-bold text-[var(--muted)] mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4" /> Core Explanation
                </h2>
                <p className="text-[17px] sm:text-[20px] leading-[1.9] text-[var(--text)] font-medium tracking-tight" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '0.01em' }}>
                  {entry.explanation}
                </p>
              </motion.div>
            )}

            {/* 2. Technical Definition */}
            {entry.technical_definition && (
              <motion.div 
                {...sectionAnim}
                className="p-8 sm:p-10 bg-[var(--text)]/5 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-sm"
              >
                <h2 className="text-sm font-bold text-[var(--muted)] mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Code className="w-4 h-4" /> Technical Definition
                </h2>
                <p className="text-[15px] sm:text-[17px] leading-[1.9] text-[var(--text)] font-medium font-mono opacity-90">
                  {entry.technical_definition}
                </p>
              </motion.div>
            )}
          </div>

          {/* Top Right: Misconceptions & Prerequisites */}
          <div className="space-y-6">
            {/* Misconceptions */}
            {entry.common_misconception?.length > 0 && (
              <motion.div 
                {...sectionAnim}
                className="p-8 bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl"
              >
                <h2 className="text-[12px] font-black text-red-500 mb-5 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Misconceptions
                </h2>
                <ul className="space-y-4">
                  {entry.common_misconception.map((misc: string, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-3 text-[14px] font-medium text-[var(--text)] opacity-90 leading-relaxed"
                    >
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                      <span>{misc}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Prerequisites */}
            {entry.prerequisites?.length > 0 && (
              <motion.div 
                {...sectionAnim}
                className="p-8 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-2xl"
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
          </div>
        </div>

        {/* 3. Analogies Grid - Full width split */}
        {(entry.real_world_analogy || entry.computer_analogy) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {entry.real_world_analogy && (
              <motion.div 
                {...sectionAnim}
                className="p-8 rounded-2xl bg-[var(--text)] text-[var(--bg)] shadow-lg relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Lightbulb className="w-28 h-28" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Real World Analogy
                </h2>
                <p className="text-[17px] sm:text-[19px] leading-relaxed font-bold italic relative z-10">
                  "{entry.real_world_analogy}"
                </p>
              </motion.div>
            )}

            {entry.computer_analogy && (
              <motion.div 
                {...sectionAnim}
                className="p-8 rounded-2xl bg-[var(--hover)]/80 backdrop-blur-xl border border-[var(--border)] shadow-lg relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 opacity-[0.04] text-[var(--text)]">
                  <Zap className="w-28 h-28" />
                </div>
                <h2 className="text-[11px] font-black text-[var(--text)] uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
                  <Code className="w-3 h-3" /> System Analogy
                </h2>
                <p className="text-[17px] sm:text-[19px] text-[var(--text)] leading-relaxed font-bold italic relative z-10">
                  "{entry.computer_analogy}"
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* 4. Usage Example - Full Width */}
        {entry.syntax_or_example && (
           <motion.div 
            {...sectionAnim}
            className="p-8 sm:p-10 rounded-2xl shadow-lg bg-[var(--text)]/8 backdrop-blur-2xl border border-[var(--border)] relative overflow-hidden group w-full"
          >
            <div className="absolute top-4 right-4 transition-opacity opacity-0 group-hover:opacity-100">
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
            <pre className="text-[var(--text)] font-mono text-[14px] sm:text-[15px] leading-[1.9] overflow-x-auto whitespace-pre-wrap">
              <code>{entry.syntax_or_example}</code>
            </pre>
          </motion.div>
        )}

        {/* 5. Comparisons - Full width */}
        {entry.comparisons?.length > 0 && (
          <motion.div {...sectionAnim} className="space-y-4 w-full">
            <h2 className="text-[13px] font-bold text-[var(--muted)] mb-5 uppercase tracking-widest flex items-center gap-2">
              <Scale className="w-4 h-4" /> Comparisons
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {entry.comparisons.map((c: any, i: number) => {
                const targetId = findId(c.target);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }}
                    className="group p-6 sm:p-8 bg-[var(--hover)]/30 backdrop-blur-md border border-[var(--border)] rounded-2xl hover:border-[var(--text)]/20 transition-all flex flex-col justify-between"
                  >
                     <div>
                       <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                           <span className="text-[18px] font-bold text-[var(--text)]">{c.target}</span>
                           {targetId && (
                             <button onClick={() => onNavigate(targetId)} className="p-1.5 rounded-lg bg-[var(--text)]/10 text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
                               <ArrowRight className="w-3.5 h-3.5" />
                             </button>
                           )}
                         </div>
                       </div>
                       <p className="text-[15px] text-[var(--text)] opacity-85 leading-relaxed mb-4">
                         {c.note}
                       </p>
                     </div>
                     {c.winner_scenario && (
                       <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg text-sm font-medium">
                         <CheckCircle className="w-3.5 h-3.5 shrink-0" /> <span className="line-clamp-2">Use when: {c.winner_scenario}</span>
                       </div>
                     )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 6. Bottom Meta: Related terms & Next steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Related Terms */}
          {entry.suggested_related_terms?.length > 0 && (
            <motion.div 
              {...sectionAnim}
              className="p-8 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-2xl"
            >
              <h2 className="text-[12px] font-bold text-[var(--muted)] mb-5 uppercase tracking-widest flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Related Terms
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.suggested_related_terms.map((w: string, i: number) => {
                  const targetId = findId(w);
                  return (
                    <motion.button 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }} 
                      onClick={() => targetId && onNavigate(targetId)} 
                      className={`px-4 py-2 text-[13px] font-medium rounded-xl border border-[var(--border)] transition-all ${targetId ? 'bg-[var(--text)]/5 hover:bg-[var(--text)] hover:text-[var(--bg)] cursor-pointer hover:shadow-md' : 'bg-transparent opacity-50 cursor-default'}`}
                    >
                       {w}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          {entry.next_steps?.length > 0 && (
             <motion.div 
              {...sectionAnim}
              className="p-8 bg-[var(--hover)]/30 backdrop-blur-xl border border-[var(--border)] rounded-2xl"
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
