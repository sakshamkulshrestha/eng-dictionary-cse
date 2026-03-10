import React, { useState, useEffect, useMemo } from 'react';
import { List, Sun, Moon, Bookmark, Sparkles, Info } from 'lucide-react';
import Logo from './components/Logo.jsx';
import SearchBar from './components/SearchBar.jsx';
import DomainCard from './components/DomainCard.jsx';
import EntryDetail from './components/EntryDetail.jsx';
import IndexView from './components/IndexView.jsx';
import GuideView from './components/GuideView.jsx';
import PromptWindow from './components/PromptWindow.jsx';

export default function App() {
  const [dictionaryData, setDictionaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('home');
  const [activeId, setActiveId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  
  // High-End Monochrome Setup
  const [isDark, setIsDark] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => 
    JSON.parse(localStorage.getItem('bookmarks') || '[]')
  );
  const [history, setHistory] = useState(() => 
    JSON.parse(localStorage.getItem('history') || '[]')
  );

  useEffect(() => {
    const dataFiles = [
      '/data/dsa.json', '/data/os.json', '/data/networks.json',
      '/data/dbms.json', '/data/coa.json', '/data/ai.json',
      '/data/se.json', '/data/cyber.json', '/data/cloud.json', '/data/toc.json'
    ];

    Promise.all(dataFiles.map(file => fetch(file).then(res => res.json())))
      .then(results => {
        setDictionaryData(results.flat());
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Sync to Storage
  useEffect(() => localStorage.setItem('bookmarks', JSON.stringify(bookmarks)), [bookmarks]);
  useEffect(() => localStorage.setItem('history', JSON.stringify(history)), [history]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Logic: Max 5 items, move latest to top
  const addToHistory = (id) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item !== id);
      return [id, ...filtered].slice(0, 5);
    });
  };

  const navigate = (page, id = null, filter = null) => {
    if (id) addToHistory(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(page);
    setActiveId(id);
    setActiveFilter(filter);
  };

  const toggleBookmark = (entry) => {
    setBookmarks(prev => prev.some(b => b.id === entry.id) 
      ? prev.filter(b => b.id !== entry.id) 
      : [entry, ...prev]
    );
  };

  const domains = useMemo(() => {
    const counts = {};
    dictionaryData.forEach(d => counts[d.domain] = (counts[d.domain] || 0) + 1);
    return Object.keys(counts).map(name => ({ name, count: counts[name] }));
  }, [dictionaryData]);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center font-mono text-[10px] tracking-[0.5em] uppercase text-black dark:text-white">
      System_Initialize
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans transition-colors duration-500 text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center h-20">
          <Logo onClick={() => navigate('home')} />
          
          <div className="hidden md:flex flex-1 mx-12 justify-center max-w-xl">
            {view !== 'home' && (
              <SearchBar 
                dictionaryData={dictionaryData} 
                onSelectTerm={(id) => navigate('entry', id)} 
                history={history} 
              />
            )}
          </div>

          <div className="flex items-center gap-8">
            <button onClick={() => navigate('learn')} className={`transition-all hover:scale-110 ${view === 'learn' ? 'opacity-100' : 'opacity-30'}`}>
              <Sparkles className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('saved')} className={`transition-all hover:scale-110 ${view === 'saved' ? 'opacity-100' : 'opacity-30'}`}>
              <Bookmark className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('guide')} className={`transition-all hover:scale-110 ${view === 'guide' ? 'opacity-100' : 'opacity-30'}`}>
              <Info className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('index', null, null)} className={`transition-all hover:scale-110 ${view === 'index' && !activeFilter ? 'opacity-100' : 'opacity-30'}`}>
              <List className="w-5 h-5" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="opacity-20 hover:opacity-100 transition-opacity">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="pb-32">
        {view === 'home' && (
          <div className="animate-fade-in max-w-6xl mx-auto px-8 py-32 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-black/10 dark:border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-10 opacity-30">
              IMTech Research Platform
            </div>
            
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter mb-10 leading-none">
              Engineered<span className="text-gray-300">.</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-16 tracking-tight font-medium max-w-2xl mx-auto">
              Clinical clarity for the modern engineer. A curated technical reference.
            </p>

            <div className="max-w-2xl mx-auto mb-40">
              <SearchBar 
                dictionaryData={dictionaryData} 
                onSelectTerm={(id) => navigate('entry', id)} 
                history={history} 
              />
              <div className="mt-6 flex justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-gray-300">
                 <span className="flex items-center gap-2">↑↓ Navigate</span>
                 <span className="flex items-center gap-2">↵ Select</span>
                 <span className="flex items-center gap-2">ESC Close</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              {domains.map(d => (
                <DomainCard 
                  key={d.name} 
                  title={d.name} 
                  count={d.count} 
                  onClick={() => navigate('index', null, d.name)} 
                />
              ))}
            </div>
          </div>
        )}

        {view === 'entry' && (
          <EntryDetail 
            entry={dictionaryData.find(i => i.id === activeId)} 
            dictionaryData={dictionaryData} 
            onNavigate={navigate} 
            onToggleBookmark={toggleBookmark} 
            isBookmarked={bookmarks.some(b => b.id === activeId)} 
          />
        )}

        {view === 'index' && (
          <IndexView 
            dictionaryData={dictionaryData} 
            activeFilter={activeFilter} 
            navigate={navigate} 
            title={activeFilter || "Full Index"} 
          />
        )}

        {view === 'saved' && (
          <IndexView 
            dictionaryData={bookmarks} 
            title="Library" 
            navigate={navigate} 
          />
        )}

        {view === 'guide' && <GuideView />}
        
        {view === 'learn' && (
          <PromptWindow 
            dictionaryData={dictionaryData} 
            onNavigate={navigate} 
          />
        )}
      </main>
    </div>
  );
}