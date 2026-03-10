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
            About the App
          </span>
        </div>
        <h1 className="text-6xl sm:text-[84px] font-extrabold tracking-[-0.04em] mb-4 leading-none animate-slide-up bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400 pb-3">
          The Dictionary
        </h1>
        <p className="text-xl sm:text-[22px] text-[#8E8E93] font-medium leading-relaxed max-w-2xl animate-slide-up delay-100">
          A beautifully designed, easy-to-use dictionary for computing terms. Learn and discover new topics without the clutter of traditional textbooks.
        </p>
      </header>

      {/* What it is */}
      <div className="mb-16">
        <h2 className="text-[13px] font-bold text-gray-500 mb-6 uppercase tracking-widest pl-2">What It Is</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <BookOpen className="w-6 h-6 text-[var(--ios-blue)]"/>, bgColor: "bg-[var(--ios-blue)]/10", title: "Clear Definitions", desc: "Complex ideas explained simply. We focus on clarity so you can understand topics instantly." },
            { icon: <Layers className="w-6 h-6 text-orange-500"/>, bgColor: "bg-orange-500/10", title: "Rich Content", desc: "Explore thousands of terms across different categories like Networking, Web Development, and more." },
            { icon: <Sparkles className="w-6 h-6 text-purple-500"/>, bgColor: "bg-purple-500/10", title: "Beautiful Design", desc: "Designed with an elegant interface that feels native to your device, making learning a joy." }
          ].map((f, i) => {
            const delayClass = `delay-${((i % 3) * 50) + 150}`;
            return (
            <div key={i} className={`apple-card cursor-default group flex flex-col items-start min-h-[220px] animate-slide-up ${delayClass}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${f.bgColor} relative z-10`}>
                {f.icon}
              </div>
              <h3 className="text-[24px] font-bold tracking-tight mb-3 relative z-10 text-black dark:text-white leading-tight">{f.title}</h3>
              <p className="text-[16px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed relative z-10">{f.desc}</p>
            </div>
            );
          })}
        </div>
      </div>

      {/* How to Use */}
      <div className="mb-16">
        <h2 className="text-[13px] font-bold text-gray-500 mb-6 uppercase tracking-widest pl-2">How to Use</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { title: "Find a term", desc: "Tap the Search Bar at the top of the Home page to quickly find what you're looking for.", step: "1" },
            { title: "Learn & Compare", desc: "Read the simple explanation and see how it differs from similar topics right on the same page.", step: "2" },
            { title: "Save for later", desc: "Tap the Bookmark icon on any page to save it. You can view all your saved items in the Saved tab.", step: "3" },
            { title: "Explore Categories", desc: "Browse through different topics like Data Structures or Frontend directly from the Home page.", step: "4" }
          ].map((s, i) => {
            const delayClass = `delay-${((i % 4) * 50) + 100}`;
            return (
            <div key={i} className={`apple-card group flex flex-col cursor-default animate-slide-up ${delayClass}`}>
              <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[14px] font-bold text-gray-500">
                  {s.step}
                </div>
                <h3 className="text-[20px] font-bold tracking-tight relative z-10 text-black dark:text-white">{s.title}</h3>
              </div>
              <p className="text-[16px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed pl-13 relative z-10">{s.desc}</p>
            </div>
            );
          })}
        </div>
      </div>

      <div className="mt-24 pt-10 border-t border-black/5 dark:border-white/10 flex flex-col items-center">
        <h3 className="text-[14px] font-bold text-gray-500 mb-3 uppercase tracking-widest text-center">
          Who Made It
        </h3>
        <p className="text-[17px] font-bold text-black dark:text-white mb-6 text-center">
          Created with care by IMTech Students from the <span className="text-[var(--ios-blue)]">University of Hyderabad</span>.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl px-4">
          {developers.map(dev => (
            <div key={dev} className="px-5 py-2.5 bg-white dark:bg-[#2C2C2E] rounded-full text-[15px] font-medium text-black dark:text-white shadow-[0_4px_12px_rgb(0,0,0,0.04)] dark:shadow-none border border-black/5 dark:border-white/5 transition-transform hover:-translate-y-0.5">
              {dev}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}