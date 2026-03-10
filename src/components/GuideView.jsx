import React from 'react';
import { Search, Bookmark, Sparkles, University, ChevronRight, Fingerprint, BookOpen, Layers } from 'lucide-react';

export default function GuideView() {
  const developers = ["Saksham Kulshrestha", "Gotta Pranathi Yadav", "Molagara Dravinesh", "Kuntumala Muni Sai Charan"];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in text-black dark:text-white pb-32">
      <header className="mb-16 pl-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--ios-blue)]/10 flex items-center justify-center">
            <University className="w-5 h-5 text-[var(--ios-blue)]" />
          </div>
          <span className="text-[13px] font-bold text-[var(--ios-blue)] uppercase tracking-widest">
            UoH Project
          </span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 leading-tight">The Mission</h1>
        <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl">
          A clinical technical catalog designed to replace cluttered textbooks with architectural clarity. Built by IMTech students.
        </p>
      </header>

      {/* Core Features */}
      <div className="mb-16">
        <h2 className="text-[13px] font-bold text-gray-500 mb-6 uppercase tracking-widest pl-2">Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <Search className="w-6 h-6 text-[var(--ios-blue)]"/>, bgColor: "bg-[var(--ios-blue)]/10", title: "Fuzzy Search", desc: "Optimized matching logic for high-speed indexing across nodes." },
            { icon: <Bookmark className="w-6 h-6 text-orange-500"/>, bgColor: "bg-orange-500/10", title: "Private Vault", desc: "All user saves and history are persisted locally. Your data never leaves your device." },
            { icon: <Sparkles className="w-6 h-6 text-purple-500"/>, bgColor: "bg-purple-500/10", title: "Synthesis", desc: "Intent-based roadmaps that bridge concepts across disparate domains." }
          ].map((f, i) => (
            <div key={i} className="group relative bg-[#F9F9FB] dark:bg-[#1C1C1E] p-7 rounded-[2rem] shadow-sm hover:shadow-[0_24px_48px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_24px_48px_rgb(0,0,0,0.4)] border border-black/[0.03] dark:border-white/[0.05] hover:-translate-y-1 transition-all duration-400 flex flex-col items-start min-h-[200px]">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${f.bgColor}`}>
                {f.icon}
              </div>
              <h3 className="text-[22px] font-bold tracking-tight mb-3">{f.title}</h3>
              <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mb-16">
        <h2 className="text-[13px] font-bold text-gray-500 mb-6 uppercase tracking-widest pl-2">How to Use</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { title: "Universal Search", desc: "Tap the Search Bar or press Command+K. Type any conceptual computing term. The algorithm will display live predictions.", step: "1" },
            { title: "Read & Compare", desc: "In the Entry view, study the core concept. Tap related nodes to seamlessly traverse neighboring architecture.", step: "2" },
            { title: "Save to Vault", desc: "Tap the Bookmark icon. Navigate to the Library tab to review saved terms natively in offline mode.", step: "3" },
            { title: "AI Synthesis", desc: "Navigate to the Synthesis UI. Ask complex multi-domain questions to generate a custom roadmap.", step: "4" }
          ].map((s, i) => (
            <div key={i} className="group flex flex-col bg-[#F9F9FB] dark:bg-[#1C1C1E] p-7 rounded-[2rem] border border-black/[0.03] dark:border-white/[0.05] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[13px] font-bold text-gray-500">
                  {s.step}
                </div>
                <h3 className="text-[19px] font-bold tracking-tight">{s.title}</h3>
              </div>
              <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed pl-12">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Specs */}
      <div className="mb-16">
        <h2 className="text-[13px] font-bold text-gray-500 mb-6 uppercase tracking-widest pl-2">System Details</h2>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-sm dark:shadow-none border border-black/5 dark:border-white/10">
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {["React 18", "Tailwind CSS", "Fuse.js", "Lucide Icons"].map(t => (
              <li key={t} className="px-5 py-4 flex justify-between items-center text-[16px] font-medium">
                <span>{t}</span>
                <span className="text-gray-400">Integrated Standard</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-2 flex justify-between items-center text-[15px] font-medium mt-20 mb-8">
        <span className="text-gray-400 flex items-center gap-2"><Fingerprint className="w-4 h-4"/> No Auth Required</span>
        <a href="https://forms.gle/yFKUyDdgt8FL4y2M6" target="_blank" className="text-[var(--ios-blue)] flex items-center gap-1 active:opacity-60 transition-opacity">
          Submit Feedback <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      <div className="mt-20 pt-10 border-t border-black/5 dark:border-white/10 flex flex-col items-center">
        <h3 className="text-[14px] font-bold text-gray-500 mb-3 uppercase tracking-widest text-center">
          Engineered By
        </h3>
        <p className="text-[17px] font-bold text-black dark:text-white mb-6 text-center">
          IMTech Students, <span className="text-[var(--ios-blue)]">University of Hyderabad</span>
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
          {developers.map(dev => (
            <div key={dev} className="px-4 py-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-full text-[14px] font-semibold text-black dark:text-white shadow-sm border border-black/5 dark:border-white/5">
              {dev}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}