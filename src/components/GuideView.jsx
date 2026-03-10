import React from 'react';
import { User, MessageSquare, Terminal, Search, Bookmark, Lightbulb } from 'lucide-react';

export default function GuideView() {
  const team = [
    { name: "Saksham Kulshrestha", role: "Project Coordinator" },
    { name: "Gotta Pranathi Yadav", role: "Interface Designer" },
    { name: "Molagara Dravinesh", role: "Data Specialist" },
    { name: "Kuntumala Muni Sai Charan", role: "Software Engineer" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-fade-in">
      <div className="mb-20 text-center">
         <h1 className="text-5xl font-black tracking-tight mb-4">Engineering Dictionary</h1>
         <p className="text-gray-500">Version 1.0.0 | A student-led research project developed and managed by IMTech students, University of Hyderabad</p>
      </div>

      <section className="mb-24">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mb-10">Developed By</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {team.map(m => (
            <div key={m.name} className="flex items-center p-6 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 transition-all hover:border-indigo-500">
               <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <User className="w-6 h-6 text-white dark:text-black" />
               </div>
               <div>
                  <div className="font-bold text-lg dark:text-white">{m.name}</div>
                  <div className="text-xs text-gray-400 uppercase font-semibold">{m.role}</div>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-16">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Platform Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-4">
              <Search className="w-8 h-8 text-blue-500" />
              <h3 className="font-bold">Neural Search</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Search 1000+ terms instantly. Your 10 most recent searches are saved for quick re-entry.</p>
           </div>
           <div className="space-y-4">
              <Bookmark className="w-8 h-8 text-yellow-500" />
              <h3 className="font-bold">Offline Library</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Save complex terms using bookmarks. They are stored locally on your device for fast access.</p>
           </div>
           <div className="space-y-4">
              <Lightbulb className="w-8 h-8 text-indigo-500" />
              <h3 className="font-bold">Learning Path</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Use the Sparkles icon to tell the system what you want to learn. It generates a roadmap for you.</p>
           </div>
        </div>
      </section>

      <div className="mt-32 p-10 bg-black dark:bg-zinc-900 rounded-3xl text-center text-white">
         <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2"><MessageSquare/> Have a suggestion?</h2>
         <p className="text-zinc-400 mb-8 max-w-md mx-auto text-sm">Help us improve the dictionary. Suggest new terms or report errors via our Google Form.</p>
         <a href="https://forms.gle/yFKUyDdgt8FL4y2M6" target="_blank" className="inline-block bg-white text-black px-8 py-3 rounded-full font-black text-sm hover:scale-105 transition-transform">Support & Suggestions</a>
      </div>
    </div>
  );
}