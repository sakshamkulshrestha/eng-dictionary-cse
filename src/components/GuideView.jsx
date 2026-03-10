import React from 'react';
import { User, MessageSquare, Search, Bookmark, Sparkles, University, Heart, Terminal, Laptop, ArrowRight, Info } from 'lucide-react';

export default function GuideView() {
  const team = [
    { name: "Saksham Kulshrestha", role: "Architecture", desc: "Core Engine & Data Routing" },
    { name: "Gotta Pranathi Yadav", role: "Interface", desc: "Monochrome Visual Language" },
    { name: "Molagara Dravinesh", role: "Database", desc: "Dictionary Classification" },
    { name: "Kuntumala Muni Sai Charan", role: "Logic", desc: "Interaction & State Persistence" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-24 transition-all duration-700 bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* --- SECTION 1: SYSTEM OVERVIEW --- */}
      <header className="mb-40">
        <div className="inline-flex items-center gap-2 px-4 py-1 border border-black/10 dark:border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-10 opacity-50">
          <University className="w-3 h-3"/> IMTech Research Project
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-12">Engineered<span className="opacity-20">.</span></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-end">
          <p className="text-2xl md:text-3xl font-medium leading-tight tracking-tight italic opacity-60">
            A high-fidelity technical catalog designed to provide clinical clarity for the next generation of software engineers.
          </p>
          <div className="text-xs space-y-4 opacity-40 font-bold uppercase tracking-widest">
            <div className="flex justify-between border-b pb-2"><span>Build Version</span><span>1.0.4-Stable</span></div>
            <div className="flex justify-between border-b pb-2"><span>Data Nodes</span><span>1000+ Distributed</span></div>
            <div className="flex justify-between border-b pb-2"><span>Origin</span><span>UoH, Hyderabad</span></div>
          </div>
        </div>
      </header>

      {/* --- SECTION 2: OPERATIONAL LOGIC --- */}
      <section className="mb-48">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-20">Operational_Manual</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="p-4 border border-black dark:border-white inline-block rounded-2xl"><Search className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold italic">Command Search</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Our search engine utilizes fuzzy matching. It prioritizes term titles but scans deep-dive explanations. Use <span className="underline italic">Arrow Keys</span> and <span className="underline italic">Enter</span> for keyboard-only navigation.</p>
          </div>
          <div className="space-y-6">
            <div className="p-4 border border-black dark:border-white inline-block rounded-2xl"><Bookmark className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold italic">Local Vault</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Bookmarks and Search History are persisted via <span className="underline italic">LocalStorage</span>. Your library is private, stored entirely on your device, and accessible offline.</p>
          </div>
          <div className="space-y-6">
            <div className="p-4 border border-black dark:border-white inline-block rounded-2xl"><Sparkles className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold italic">Intent Synthesis</h3>
            <p className="text-sm text-gray-500 leading-relaxed">The 'Learning Path' engine analyzes natural language goals to synthesize a logical 6-step roadmap, connecting concepts across disparate domains.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: TECHNICAL BLUEPRINT --- */}
      <section className="mb-48 p-16 bg-black text-white dark:bg-white dark:text-black rounded-[4rem] shadow-2xl relative overflow-hidden">
        <Terminal className="absolute -right-20 -bottom-20 w-80 h-80 opacity-5 pointer-events-none" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-12">The Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-1"><div className="font-bold text-lg italic">React 18</div><div className="text-[9px] uppercase tracking-widest opacity-40">Dynamic UI Framework</div></div>
          <div className="space-y-1"><div className="font-bold text-lg italic">Tailwind</div><div className="text-[9px] uppercase tracking-widest opacity-40">Atomic Styling System</div></div>
          <div className="space-y-1"><div className="font-bold text-lg italic">Fuse.js</div><div className="text-[9px] uppercase tracking-widest opacity-40">Fuzzy Search Logic</div></div>
          <div className="space-y-1"><div className="font-bold text-lg italic">Lucide</div><div className="text-[9px] uppercase tracking-widest opacity-40">Iconography Layer</div></div>
        </div>
      </section>

      {/* --- SECTION 4: AUTHORS --- */}
      <section className="mb-48">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-20 text-center">Technical Authors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map(m => (
            <div key={m.name} className="p-8 border border-black/5 dark:border-white/5 rounded-[2.5rem] text-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 group">
               <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20"><User className="w-6 h-6" /></div>
               <div className="font-black text-lg mb-1 tracking-tight italic">{m.name}</div>
               <div className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-4">{m.role}</div>
               <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">"{m.desc}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION 5: FEEDBACK --- */}
      <div className="py-24 border-y border-black/5 dark:border-white/5 text-center">
         <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">Report an issue<span className="opacity-20">?</span></h2>
         <a 
           href="https://forms.gle/yFKUyDdgt8FL4y2M6" 
           target="_blank" 
           className="inline-flex items-center gap-4 bg-black dark:bg-white text-white dark:text-black px-16 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
         >
           Access Form <ArrowRight className="w-4 h-4"/>
         </a>
      </div>
    </div>
  );
}