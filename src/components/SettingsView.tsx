import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Moon, Type, Volume2, Eye, Palette, Keyboard, Database, Download, Upload, Trash2, Sun, RotateCcw } from 'lucide-react';
import MagneticButton from './primitives/MagneticButton';

interface SettingsViewProps {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
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
    <div className="flex items-center justify-between p-6 sm:p-7 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">{title}</span>
          <span className="text-[11px] text-muted">{description}</span>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function SettingsView({
  isDark, setIsDark,
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
            <p className="text-muted text-sm font-medium">Customize your Lexicon experience.</p>
          </motion.header>

          {/* Appearance */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1">Appearance</h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <SettingRow
                icon={isDark ? <Moon className="w-5 h-5 text-white" strokeWidth={2.5} /> : <Sun className="w-5 h-5 text-[var(--pop-black)]" strokeWidth={2.5} />}
                iconBg={isDark ? 'bg-[var(--text)]' : 'bg-[var(--neo-gold)]'}
                title="Dark Mode"
                description="Switch between light and dark theme"
                action={<ToggleSwitch checked={isDark} onChange={setIsDark} />}
              />
              <SettingRow
                icon={<Type className="w-5 h-5 text-white" strokeWidth={2.5} />}
                iconBg="bg-[var(--neo-purple)]"
                title="Text Size"
                description="Adjust content reading density"
                action={
                  <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
                    {['small', 'standard', 'large'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${fontSize === s ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-muted hover:text-[var(--text)]'}`}
                      >
                        {s}
                      </button>
                    ))}
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
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Default', value: 'default', preview: 'Inter' },
                  { label: 'System', value: 'system', preview: '-apple-system' },
                  { label: 'Mono', value: 'mono', preview: 'monospace' },
                  { label: 'Dyslexic', value: 'dyslexic', preview: 'Comic Sans MS' },
                ].map(font => (
                  <button
                    key={font.value}
                    onClick={() => setFontFamily?.(font.value)}
                    className={`px-5 py-3 rounded-xl border-2 transition-all ${(fontFamily || 'default') === font.value ? 'border-[var(--text)] bg-[var(--text)]/10 shadow-sm' : 'border-[var(--border)] hover:border-[var(--text)]/50'}`}
                  >
                    <span className="text-[12px] font-bold block" style={{ fontFamily: font.preview }}>{font.label}</span>
                  </button>
                ))}
              </div>
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
