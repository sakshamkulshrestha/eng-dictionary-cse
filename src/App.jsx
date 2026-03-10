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
  const [isDark, setIsDark] = useState(false);

  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history') || '[]'));

  useEffect(() => {
    const dataFiles = ['/data/dsa.json', '/data/os.json', '/data/networks.json', '/data/dbms.json', '/data/coa.json', '/data/ai.json', '/data/se.json', '/data/cyber.json', '/data/cloud.json', '/data/toc.json'];
    Promise.all(dataFiles.map(file => fetch(file).then(res => res.json())))
      .then(results => { setDictionaryData(results.flat()); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('history', JSON.stringify(history));
  }, [bookmarks, history]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const navigate = (page, id = null, filter = null) => {
    if (id) setHistory(prev => [id, ...prev.filter(i => i !== id)].slice(0, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(page);
    setActiveId(id);
    setActiveFilter(filter);
  };

  const domains = useMemo(() => {
    const counts = {};
    dictionaryData.forEach(d => counts[d.domain] = (counts[d.domain] || 0) + 1);
    return Object.keys(counts).map(name => ({ name, count: counts[name] }));
  }, [dictionaryData]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-bold text-[10px] tracking-[0.5em] uppercase opacity-20 dark:text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-black dark:text-white transition-colors duration-700">
      
      {/* --- Apple Navigation Bar --- */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-black/70 backdrop-blur-3xl border-b border-zinc-100 dark:border-zinc-900 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
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

          <div className="flex items-center gap-7">
            <button onClick={() => navigate('learn')} className={`transition-all active:scale-90 ${view === 'learn' ? 'opacity-100' : 'opacity-30'}`}>
              <Sparkles className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('saved')} className={`transition-all active:scale-90 ${view === 'saved' ? 'opacity-100' : 'opacity-30'}`}>
              <Bookmark className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('guide')} className={`transition-all active:scale-90 ${view === 'guide' ? 'opacity-100' : 'opacity-30'}`}>
              <Info className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('index', null, null)} className={`transition-all active:scale-90 ${view === 'index' ? 'opacity-100' : 'opacity-30'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="opacity-20 hover:opacity-100 transition-opacity">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {view === 'home' && (
          <div className="animate-fade-in px-8 py-40 flex flex-col items-center">
            {/* Minimalist Hero Section */}
            <div className="text-center mb-24 space-y-4">
              <h1 className="text-7xl md:text-8xl font-black tracking-tight leading-none">
                Engineered<span className="opacity-20">.</span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-400 font-medium tracking-tight">
                High-fidelity technical documentation.
              </p>
            </div>

            <div className="w-full max-w-2xl mb-48">
              <SearchBar dictionaryData={dictionaryData} onSelectTerm={(id) => navigate('entry', id)} history={history} />
            </div>

            {/* Categorical Grid */}
            <div className="w-full space-y-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 text-center">Catalog_Domains</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        )}

        {view === 'entry' && (
          <EntryDetail 
            entry={dictionaryData.find(i => i.id === activeId)} 
            dictionaryData={dictionaryData} 
            onNavigate={navigate} 
            onToggleBookmark={(e) => toggleBookmark(e)} 
            isBookmarked={bookmarks.some(b => b.id === activeId)} 
          />
        )}

        {view === 'index' && (
          <IndexView 
            dictionaryData={dictionaryData} 
            activeFilter={activeFilter} 
            navigate={navigate} 
            title={activeFilter || "Directory"} 
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
        {view === 'learn' && <PromptWindow dictionaryData={dictionaryData} onNavigate={navigate} />}
      </main>
    </div>
  );
}