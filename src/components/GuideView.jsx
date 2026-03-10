import React from 'react';
import { Info, Search, Bookmark, Sparkles, University, ArrowRight, Cpu, Terminal } from 'lucide-react';

export default function GuideView() {
  const developers = ["Saksham Kulshrestha", "Gotta Pranathi Yadav", "Molagara Dravinesh", "Kuntumala Muni Sai Charan"];

  return (
    <div className="max-w-5xl mx-auto px-8 py-24 animate-fade-in text-black dark:text-white">
      <header className="mb-32 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest opacity-60"><University className="w-3.5 h-3.5"/> UoH Research Project</div>
        <h1 className="text-8xl font-black tracking-tighter leading-none">The Mission<span className="opacity-20">.</span></h1>
        <p className="max-w-2xl text-2xl font-medium text-zinc-500 leading-tight italic">A clinical technical catalog designed to replace cluttered textbooks with architectural clarity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
        {[
          { icon: <Search/>, title: "Fuzzy Search", desc: "Optimized matching logic for high-speed indexing across 1000+ data nodes." },
          { icon: <Bookmark/>, title: "Private Vault", desc: "All user saves and history are persisted locally. Your data never leaves your device." },
          { icon: <Sparkles/>, title: "Synthesis", desc: "Intent-based roadmaps that bridge concepts across disparate computer science domains." }
        ].map((f, i) => (
          <div key={i} className="apple-card space-y-6">
            <div className="w-10 h-10 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center">{f.icon}</div>
            <h3 className="text-xl font-bold tracking-tight">{f.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="apple-card !bg-black !text-white !p-16 mb-32 relative overflow-hidden group">
        <Terminal className="absolute -right-16 -bottom-16 w-64 h-64 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-12">System Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {["React 18", "Tailwind", "Fuse.js", "Lucide"].map(t => (
            <div key={t} className="space-y-1">
              <div className="text-lg font-bold italic tracking-tight">{t}</div>
              <div className="text-[9px] uppercase tracking-widest opacity-40">Integrated Node</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="pt-10 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Authors: {developers.join(' • ')}</div>
        <a href="https://forms.gle/yFKUyDdgt8FL4y2M6" target="_blank" className="inline-flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Feedback <ArrowRight className="w-4 h-4"/></a>
      </footer>
    </div>
  );
}