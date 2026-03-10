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
            User Guide
          </span>
        </div>
        <h1 className="text-6xl sm:text-[84px] font-extrabold tracking-[-0.04em] mb-6 leading-none animate-slide-up bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400 pb-3">
          How to Use This App
        </h1>
        <p className="text-xl sm:text-[22px] text-[#8E8E93] font-medium leading-relaxed max-w-3xl animate-slide-up delay-100">
          This app helps you learn technical words easily. Read this guide to see how it works and how to get the most out of it.
        </p>
      </header>

      {/* Structured Manual Content */}
      <div className="space-y-24">

        {/* Philosophy */}
        <section>
          <div className="flex items-center gap-3 mb-8 pl-2">
            <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md shadow-accent/30">1</span>
            <h2 className="text-[22px] font-bold text-black dark:text-white tracking-tight">Our Goal</h2>
          </div>
          <div className="apple-card flex flex-col items-start p-8 md:p-10 animate-slide-up delay-150 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
            <p className="text-[18px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-6 relative z-10">
              Traditional textbooks are often confusing. We built this app to explain complex computer words simply. Every word has a short summary, a simple explanation, and clear details.
            </p>
            <p className="text-[18px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium relative z-10">
              By showing differences and clearing up common mistakes right away, we help you truly understand the topic instead of just memorizing it.
            </p>
          </div>
        </section>

        {/* Core Mechanics */}
        <section>
          <div className="flex items-center gap-3 mb-8 pl-2">
            <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md shadow-accent/30">2</span>
            <h2 className="text-[22px] font-bold text-black dark:text-white tracking-tight">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Search className="w-6 h-6 text-accent"/>, title: "Smart Search", desc: "Our search bar is smart. You don't need to spell perfectly. It searches titles and explanations to find exactly what you mean." },
              { icon: <Bookmark className="w-6 h-6 text-accent"/>, title: "Saved Words", desc: "Click the bookmark icon to save words. Your saved words stay on your device for privacy." },
              { icon: <Network className="w-6 h-6 text-accent"/>, title: "Related Words", desc: "Every word has a list of 'Related Words'. Clicking them helps you learn about connected topics easily." },
              { icon: <Sparkles className="w-6 h-6 text-accent"/>, title: "AI Assistant", desc: "Go to the AI tab and type what you want to learn. We will find the best words to help you understand it." }
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
            <h2 className="text-[22px] font-bold text-black dark:text-white tracking-tight">Tips for Best Use</h2>
          </div>
          <div className="apple-card !bg-[#1C1C1E] !border-none group p-8 md:p-10 animate-slide-up delay-300">
            <h3 className="text-[20px] font-bold text-white mb-6 tracking-tight flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Helpful Tips
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5 shrink-0"><ChevronRight className="w-4 h-4 text-accent"/></div>
                <div>
                  <strong className="text-white block mb-1 text-[17px]">Use Settings:</strong>
                  <span className="text-gray-400 text-[16px] leading-relaxed block">Change the app to fit your style. Turn on Dark Mode at night, use 'Auto-Speak' to listen to words, and pick your favorite color.</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5 shrink-0"><ChevronRight className="w-4 h-4 text-accent"/></div>
                <div>
                  <strong className="text-white block mb-1 text-[17px]">Look at Differences:</strong>
                  <span className="text-gray-400 text-[16px] leading-relaxed block">When learning a word, read the 'Differences' section. Knowing what a topic is <em className="italic text-gray-300">not</em> helps you understand what it <em className="italic text-gray-300">is</em>.</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5 shrink-0"><ChevronRight className="w-4 h-4 text-accent"/></div>
                <div>
                  <strong className="text-white block mb-1 text-[17px]">Save Your Data:</strong>
                  <span className="text-gray-400 text-[16px] leading-relaxed block">Use the 'Export Bookmarks' tool in Settings to save a copy of your saved words to your computer.</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

      </div>

      <div className="mt-24 apple-card !bg-accent-10/50 p-8 md:p-12 flex flex-col items-center text-center animate-slide-up delay-300 border border-accent/20">
        <h3 className="text-[24px] font-extrabold text-black dark:text-white tracking-tight mb-4">Have an Idea or Correction?</h3>
        <p className="text-[17px] text-gray-600 dark:text-gray-300 font-medium mb-8 max-w-xl leading-relaxed">
          The dictionary is always growing. If you spot a mistake, want new words added, or have a suggestion, please let us know!
        </p>
        <a 
          href="https://forms.gle/Nt3kfwaFDtDi3Q6z5"
          target="_blank" rel="noopener noreferrer"
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