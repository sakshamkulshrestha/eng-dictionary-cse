import React from 'react';
import { Search, Bookmark, Sparkles, University, ChevronRight, Fingerprint, BookOpen, Layers, Network } from 'lucide-react';

export default function GuideView() {
  const developers = ["Saksham Kulshrestha", "Gotta Pranathi Yadav", "Molagara Dravinesh", "Kuntumala Muni Sai Charan"];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in text-black dark:text-white pb-32">
      <header className="mb-20 pl-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-accent-10 flex items-center justify-center">
            <University className="w-5 h-5 text-accent" />
          </div>
          <span className="text-[13px] font-bold text-accent uppercase tracking-widest">
            Complete User Manual
          </span>
        </div>
        <h1 className="text-6xl sm:text-[84px] font-extrabold tracking-[-0.04em] mb-6 leading-none animate-slide-up bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400 pb-3">
          The Engineering Guide
        </h1>
        <p className="text-xl sm:text-[22px] text-[#8E8E93] font-medium leading-relaxed max-w-3xl animate-slide-up delay-100">
          This isn't just a dictionary; it's a curated semantic engine designed for students and professionals. Read this detailed manual to understand the philosophy, master the core mechanics, and optimize your learning workflow.
        </p>
      </header>

      {/* Structured Manual Content */}
      <div className="space-y-24">

        {/* Philosophy */}
        <section>
          <div className="flex items-center gap-3 mb-8 pl-2">
            <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md shadow-accent/30">1</span>
            <h2 className="text-[22px] font-bold text-black dark:text-white tracking-tight">Our Core Philosophy</h2>
          </div>
          <div className="apple-card flex flex-col items-start p-8 md:p-10 animate-slide-up delay-150 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
            <p className="text-[18px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-6 relative z-10">
              Traditional textbooks often bury core concepts under layers of irrelevant academic jargon. We built this platform on a simple premise: <strong className="text-black dark:text-white transition-colors">clarity accelerates intelligence.</strong> Every term is deconstructed into a concise summary, a detailed explanation, and precise technical boundaries.
            </p>
            <p className="text-[18px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium relative z-10">
              By isolating differences and debunking common misconceptions upfront, we prevent the "illusion of competence." You don't just memorize definitions; you understand how entities relate within complex architectural systems.
            </p>
          </div>
        </section>

        {/* Core Mechanics */}
        <section>
          <div className="flex items-center gap-3 mb-8 pl-2">
            <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md shadow-accent/30">2</span>
            <h2 className="text-[22px] font-bold text-black dark:text-white tracking-tight">System Navigation & Mechanics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Search className="w-6 h-6 text-accent"/>, title: "Fuzzy Spotlight Search", desc: "Our global search bar utilizes fuzzy matching algorithms. You don't need to spell perfectly. It searches not just titles, but explanations and technical definitions to find exactly what you mean." },
              { icon: <Bookmark className="w-6 h-6 text-accent"/>, title: "Persistent Bookmarks", desc: "Tap the bookmark icon to save complex terms into your local digest. Your bookmarks run entirely on local storage, guaranteeing total privacy and offline persistence." },
              { icon: <Network className="w-6 h-6 text-accent"/>, title: "Node Traversal", desc: "Every entry lists 'Related Nodes'. These aren't just similar words; they are architectural dependencies. Clicking them allows you to traverse the conceptual tree natively." },
              { icon: <Sparkles className="w-6 h-6 text-accent"/>, title: "Synthesis Prompt", desc: "Navigate to the Synthesis tab to dynamically query terms. Think of it as an interactive clinical roadmap generator for your current engineering objective." }
            ].map((mech, i) => (
              <div key={i} className={`apple-card p-8 group flex flex-col items-start animate-slide-up hover:bg-accent-10/20 hover:border-accent/30 transition-all duration-300`} style={{ animationDelay: `${(i * 50) + 150}ms` }}>
                <div className="w-12 h-12 rounded-full bg-accent-10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                  {mech.icon}
                </div>
                <h3 className="text-[20px] font-bold tracking-tight mb-3 text-black dark:text-white">{mech.title}</h3>
                <p className="text-[16px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{mech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Optimizing Workflow */}
        <section>
          <div className="flex items-center gap-3 mb-8 pl-2">
            <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md shadow-accent/30">3</span>
            <h2 className="text-[22px] font-bold text-black dark:text-white tracking-tight">Optimizing Your Output</h2>
          </div>
          <div className="apple-card !bg-[#1C1C1E] !border-none group p-8 md:p-10 animate-slide-up delay-300">
            <h3 className="text-[20px] font-bold text-white mb-6 tracking-tight flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Pro-Tips for Mastery
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5 shrink-0"><ChevronRight className="w-4 h-4 text-accent"/></div>
                <div>
                  <strong className="text-white block mb-1 text-[17px]">Leverage Settings:</strong>
                  <span className="text-gray-400 text-[16px] leading-relaxed block">Customize your environment. Switch to Dark Mode at night, enable 'Auto-Speak' for auditory learning, and select an Accent Color that fits your focus state.</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5 shrink-0"><ChevronRight className="w-4 h-4 text-accent"/></div>
                <div>
                  <strong className="text-white block mb-1 text-[17px]">Focus on Differences:</strong>
                  <span className="text-gray-400 text-[16px] leading-relaxed block">When studying a term, jump straight to the 'Differences' cards. Understanding what a concept is <em className="italic text-gray-300">not</em> is often faster than understanding what it <em className="italic text-gray-300">is</em>.</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5 shrink-0"><ChevronRight className="w-4 h-4 text-accent"/></div>
                <div>
                  <strong className="text-white block mb-1 text-[17px]">Backup Your Data:</strong>
                  <span className="text-gray-400 text-[16px] leading-relaxed block">Since your bookmarks are local, use the 'Export Bookmarks' feature in Settings before clearing your browser cache to avoid losing your curated collections.</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

      </div>

      {/* Suggestion Box */}
      <div className="mt-24 apple-card !bg-accent-10/50 p-8 md:p-12 flex flex-col items-center text-center animate-slide-up delay-300 border border-accent/20">
        <h3 className="text-[24px] font-extrabold text-black dark:text-white tracking-tight mb-4">Have an Idea or Correction?</h3>
        <p className="text-[17px] text-gray-600 dark:text-gray-300 font-medium mb-8 max-w-xl leading-relaxed">
          The engineering glossary is constantly evolving. If you spot a misconception, want detailed architectures added, or just want to suggest a micro-interaction, drop us a line.
        </p>
        <a 
          href="mailto:support@engineered.local" 
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-bold text-[16px] shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-all duration-300 group"
        >
          Submit a Suggestion
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Attribution */}
      <div className="mt-20 pt-10 border-t border-black/5 dark:border-white/10 flex flex-col items-center">
        <h3 className="text-[14px] font-bold text-gray-500 mb-3 uppercase tracking-widest text-center">
          Who Made It
        </h3>
        <p className="text-[17px] font-bold text-black dark:text-white mb-8 text-center max-w-md leading-relaxed">
          Crafted with obsessive attention to detail by IMTech Students from the <span className="text-accent underline decoration-accent/30 underline-offset-4">University of Hyderabad</span>.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl px-4">
          {developers.map(dev => (
            <div key={dev} className="px-6 py-3 bg-white dark:bg-[#2C2C2E] rounded-full text-[15px] font-bold text-gray-600 dark:text-gray-300 shadow-[0_4px_12px_rgb(0,0,0,0.04)] dark:shadow-none border border-black/5 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:bg-accent-10 hover:text-accent hover:border-accent hover:shadow-lg hover:shadow-accent/20 cursor-default">
              {dev}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}