import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Type, Volume2, ChevronLeft } from 'lucide-react';
import MagneticButton from './primitives/MagneticButton';

interface SettingsViewProps {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  fontSize: string;
  setFontSize: (v: string) => void;
  autoSpeak: boolean;
  setAutoSpeak: (v: boolean) => void;
  reduceMotion?: boolean;
  setReduceMotion?: (v: boolean) => void;
  onClearHistory?: () => void;
  onClearBookmarks?: () => void;
  bookmarks?: string[];
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
};

export default function SettingsView({
  isDark, setIsDark,
  fontSize, setFontSize,
  autoSpeak, setAutoSpeak,
}: SettingsViewProps) {

  return (
    <div className="w-full h-full animate-fade-in">
      <div className="max-w-2xl w-full mx-auto p-10 sm:p-20 text-[var(--text)] pb-32">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          <motion.header variants={fadeUp} className="mb-10">
            <h1 className="text-page-title mb-3">Settings</h1>
            <p className="text-muted text-sm font-medium">Configure your Lexicon experience.</p>
          </motion.header>

          {/* Appearance */}
          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Appearance</h2>
            <div className="neo-card p-0">
              <div className="flex items-center justify-between p-8 border-b border-[var(--border)]">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-[var(--text)] flex items-center justify-center">
                    <Moon className="w-5 h-5 text-[var(--bg)]" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Dark Mode</span>
                    <span className="text-[11px] text-muted">Switch between light and dark theme</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`w-14 h-8 border-2 border-[var(--text)] transition-colors relative ${isDark ? 'bg-[var(--text)]' : 'bg-transparent'}`}
                >
                  <div className={`w-5 h-5 absolute top-[3px] transition-all duration-200 ${isDark ? 'translate-x-[30px] bg-[var(--bg)]' : 'translate-x-[3px] bg-[var(--text)]'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-8">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-[var(--neo-purple)] flex items-center justify-center">
                    <Type className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Text Size</span>
                    <span className="text-[11px] text-muted">Adjust content reading density</span>
                  </div>
                </div>
                <div className="flex items-center border-2 border-[var(--border)]">
                  <button
                    onClick={() => setFontSize('standard')}
                    className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${fontSize === 'standard' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-muted hover:text-[var(--text)]'}`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${fontSize === 'large' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-muted hover:text-[var(--text)]'}`}
                  >
                    Large
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Audio */}
          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Audio</h2>
            <div className="neo-card p-0">
              <div className="flex items-center justify-between p-8">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-[var(--neo-green)] flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-[var(--bg)]" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Auto-Speak</span>
                    <span className="text-[11px] text-muted">Read definitions aloud automatically</span>
                  </div>
                </div>
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`w-14 h-8 border-2 border-[var(--text)] transition-colors relative ${autoSpeak ? 'bg-[var(--text)]' : 'bg-transparent'}`}
                >
                  <div className={`w-5 h-5 absolute top-[3px] transition-all duration-200 ${autoSpeak ? 'translate-x-[30px] bg-[var(--bg)]' : 'translate-x-[3px] bg-[var(--text)]'}`} />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="text-[11px] text-muted text-center">
              All data is stored locally on your device. Nothing leaves your browser.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
