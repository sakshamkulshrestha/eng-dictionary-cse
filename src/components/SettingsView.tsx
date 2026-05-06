import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Moon, Type, Volume2, Eye, Palette, Keyboard, Database, Download, Upload, Trash2, Sun, RotateCcw } from 'lucide-react';
import MagneticButton from './primitives/MagneticButton';

interface SettingsViewProps {
  theme: 'system' | 'light' | 'dark';
  setTheme: (v: 'system' | 'light' | 'dark') => void;
  resolvedTheme: 'light' | 'dark';
  fontSize: string;
  setFontSize: (v: string) => void;
  autoSpeak?: boolean;
  setAutoSpeak?: (v: boolean) => void;
  reduceMotion?: boolean;
  setReduceMotion?: (v: boolean) => void;
  fontFamily?: string;
  setFontFamily?: (v: string) => void;
  onClearHistory?: () => void;
  onClearBookmarks?: () => void;
  onExportData?: () => void;
  onImportData?: (data: string) => boolean;
  bookmarks?: string[];
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
};

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-14 h-8 border-2 border-[var(--border)] rounded-full transition-all relative ${checked ? 'bg-[var(--neo-green)] border-[var(--neo-green)]' : 'bg-[var(--hover)]'}`}
    >
      <div className={`w-5 h-5 rounded-full absolute top-[3px] transition-all duration-200 ${checked ? 'translate-x-[27px] bg-[var(--pop-black)]' : 'translate-x-[4px] bg-[var(--muted)]'}`} />
    </button>
  );
}

function SettingRow({ icon, iconBg, title, description, action }: { icon: React.ReactNode; iconBg: string; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold truncate">{title}</span>
          <span className="text-[11px] text-muted whitespace-normal break-words">{description}</span>
        </div>
      </div>
      <div className="flex-shrink-0 self-start sm:self-auto">
        {action}
      </div>
    </div>
  );
}

export default function SettingsView({
  theme, setTheme, resolvedTheme,
  fontSize, setFontSize,
  autoSpeak, setAutoSpeak,
  reduceMotion, setReduceMotion,
  fontFamily, setFontFamily,
  onClearHistory,
  onClearBookmarks,
  onExportData,
  onImportData,
}: SettingsViewProps) {
  const importRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = onImportData?.(ev.target?.result as string);
      if (result) alert('Data imported successfully!');
      else alert('Import failed. Invalid file format.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full animate-fade-in">
      <div className="max-w-2xl w-full mx-auto p-8 sm:p-16 text-[var(--text)] pb-32">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <motion.header variants={fadeUp} className="mb-8">
            <h1 className="text-page-title mb-3">Settings</h1>
            <p className="text-muted text-sm font-medium">Customize your Lexicon for CSE experience.</p>
          </motion.header>

          {/* Appearance */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Appearance</h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <SettingRow
                icon={resolvedTheme === 'dark' ? <Moon className="w-5 h-5 text-[var(--pop-black)]" strokeWidth={2.5} /> : <Sun className="w-5 h-5 text-[var(--pop-black)]" strokeWidth={2.5} />}
                iconBg="bg-[var(--manna-gold)]"
                title="Theme"
                description="Choose system, light, or dark mode"
                action={
                  <div className="relative">
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                      className="appearance-none bg-[var(--hover)] border border-[var(--border)] text-[var(--text)] text-[12px] font-bold uppercase tracking-widest px-4 py-2 pr-8 rounded-xl outline-none focus:border-[var(--neo-green)] transition-all cursor-pointer"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--muted)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                }
              />
              <SettingRow
                icon={<Type className="w-5 h-5 text-white" strokeWidth={2.5} />}
                iconBg="bg-[var(--neo-purple)]"
                title="Text Size"
                description="Adjust content reading density"
                action={
                  <div className="relative">
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="appearance-none bg-[var(--hover)] border border-[var(--border)] text-[var(--text)] text-[12px] font-bold uppercase tracking-widest px-4 py-2 pr-8 rounded-xl outline-none focus:border-[var(--neo-purple)] transition-all cursor-pointer"
                    >
                      <option value="small">Small</option>
                      <option value="standard">Standard</option>
                      <option value="large">Large</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--muted)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                }
              />
              <SettingRow
                icon={<Eye className="w-5 h-5 text-white" strokeWidth={2.5} />}
                iconBg="bg-[var(--neo-orange)]"
                title="Reduce Motion"
                description="Minimize animations for accessibility"
                action={<ToggleSwitch checked={reduceMotion || false} onChange={(v) => setReduceMotion?.(v)} />}
              />
            </div>
          </motion.div>

          {/* Font Family */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Font</h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <SettingRow
                icon={<Type className="w-5 h-5 text-white" strokeWidth={2.5} />}
                iconBg="bg-[#3b82f6]"
                title="Font Family"
                description="Choose the typeface used throughout the app"
                action={
                  <div className="relative">
                    <select
                      value={fontFamily || 'default'}
                      onChange={(e) => setFontFamily?.(e.target.value)}
                      className="appearance-none bg-[var(--hover)] border border-[var(--border)] text-[var(--text)] text-[12px] font-bold uppercase tracking-widest px-4 py-2 pr-8 rounded-xl outline-none focus:border-[#3b82f6] transition-all cursor-pointer"
                    >
                      <option value="default">Default</option>
                      <option value="system">System</option>
                      <option value="mono">Mono</option>
                      <option value="dyslexic">Dyslexic</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--muted)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                }
              />
            </div>
          </motion.div>

          {/* Audio */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Audio</h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <SettingRow
                icon={<Volume2 className="w-5 h-5 text-[var(--pop-black)]" strokeWidth={2.5} />}
                iconBg="bg-[var(--neo-green)]"
                title="Auto-Speak"
                description="Read definitions aloud when opening a concept"
                action={<ToggleSwitch checked={autoSpeak || false} onChange={(v) => setAutoSpeak?.(v)} />}
              />
            </div>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Keyboard Shortcuts</h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-3">
              {[
                { keys: '/', desc: 'Open search' },
                { keys: '⌘ K', desc: 'Open search' },
                { keys: 'Esc', desc: 'Close panel / search' },
              ].map(shortcut => (
                <div key={shortcut.keys} className="flex items-center justify-between">
                  <span className="text-sm text-muted font-medium">{shortcut.desc}</span>
                  <kbd className="px-3 py-1.5 bg-[var(--hover)] border border-[var(--border)] rounded-lg text-[11px] font-mono font-bold">{shortcut.keys}</kbd>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Data Management</h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onExportData}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] text-sm font-bold hover:bg-[var(--hover)] transition-colors"
                >
                  <Upload className="w-4 h-4" /> Export Data
                </button>
                <button
                  onClick={() => importRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] text-sm font-bold hover:bg-[var(--hover)] transition-colors"
                >
                  <Download className="w-4 h-4" /> Import Data
                </button>
                <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              </div>
              <div className="pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => { if (confirm('This will clear all your bookmarks, history, and settings. Are you sure?')) onClearBookmarks?.(); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-500/20 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Clear All Data
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
