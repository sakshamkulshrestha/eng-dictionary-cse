import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronUp, Star } from 'lucide-react';

export default function GamifiedReward() {
  const [expanded, setExpanded] = useState(false);
  const [xp, setXp] = useState(120);

  // Simulating passive xp gain for exploration
  useEffect(() => {
    const interval = setInterval(() => {
      setXp(prev => prev + 1);
    }, 60000); // 1 XP every minute of engagement
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ y: 150 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100, delay: 2 }}
      className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none"
    >
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto mb-4 p-6 bg-[var(--pop-white)] text-[var(--pop-black)] border border-[var(--pop-white)] shadow-[8px_8px_0px_0px_var(--neo-green)] w-64 origin-bottom-right"
          >
            <div className="flex items-start justify-between mb-4 flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Current Status</span>
              <span className="text-3xl font-black tracking-tighter flex items-center gap-2">
                {xp} <span className="text-xl text-[var(--neo-purple)]">XP</span>
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="h-1.5 w-full bg-black/10 overflow-hidden relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-[var(--neo-purple)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(xp % 1000) / 10}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold uppercase text-black/40">
                <span>Novice</span>
                <span>Master (1k)</span>
              </div>
            </div>

            <button
              className="mt-6 w-full py-3 bg-[var(--pop-black)] text-[var(--pop-white)] font-bold uppercase tracking-widest text-[11px] hover:bg-[var(--neo-purple)] transition-colors"
            >
              Claim Rewards
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="pointer-events-auto group flex items-center gap-3 bg-[var(--pop-black)] text-[var(--pop-white)] border-2 border-[var(--pop-white)] px-4 py-3 shadow-[4px_4px_0px_0px_var(--neo-green)] hover:shadow-[6px_6px_0px_0px_var(--neo-purple)] hover:-translate-y-1 hover:-translate-x-1 transition-all"
      >
        <div className="flex items-center gap-2 font-bold font-serif text-lg tracking-tight">
          <Zap className="w-5 h-5 text-[var(--neo-green)] group-hover:text-[var(--neo-gold)] transition-colors fill-[var(--neo-green)] group-hover:fill-[var(--neo-gold)]" />
          <span>{xp}</span>
        </div>
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] group-hover:text-[var(--pop-white)] transition-colors">
          Status
        </span>
      </button>
    </motion.div>
  );
}
