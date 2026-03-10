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

  const toggleBookmark = (entry) => {
    setBookmarks(prev => {
      if (prev.find(b => b.id === entry.id)) {
        return prev.filter(b => b.id !== entry.id);
      }
      return [entry, ...prev];
    });
  };

  const domains = useMemo(() => {
    const counts = {};
    dictionaryData.forEach(d => counts[d.domain] = (counts[d.domain] || 0) + 1);
    return Object.keys(counts).map(name => ({ name, count: counts[name] }));
  }, [dictionaryData]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-bold text-[10px] tracking-[0.5em] uppercase opacity-20 dark:text-white">Loading...</div>;

  return (
    <div className="min-h-screen font-sans">
      
      {/* --- Apple Premium Navigation Bar --- */}
      <header className="sticky top-0 z-50 w-full apple-glass h-[64px] border-b border-black/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex justify-between items-center gap-4">
          <div className="flex-shrink-0">
            <Logo onClick={() => navigate('home')} />
          </div>
          
          <div className="hidden md:flex flex-1 justify-center max-w-xl px-4">
            {view !== 'home' && (
              <SearchBar 
                dictionaryData={dictionaryData} 
                onSelectTerm={(id) => navigate('entry', id)} 
                history={history} 
              />
            )}
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <button onClick={() => navigate('learn')} className={`transition-colors active:scale-95 ${view === 'learn' ? 'text-[var(--ios-blue)]' : 'text-[#8E8E93] hover:text-black dark:hover:text-white'}`}>
              <Sparkles className="w-[20px] h-[20px]" strokeWidth={2} />
            </button>
            <button onClick={() => navigate('saved')} className={`transition-colors active:scale-95 ${view === 'saved' ? 'text-[var(--ios-blue)]' : 'text-[#8E8E93] hover:text-black dark:hover:text-white'}`}>
              <Bookmark className="w-[20px] h-[20px]" strokeWidth={2} />
            </button>
            <button onClick={() => navigate('guide')} className={`transition-colors active:scale-95 ${view === 'guide' ? 'text-[var(--ios-blue)]' : 'text-[#8E8E93] hover:text-black dark:hover:text-white'}`}>
              <Info className="w-[20px] h-[20px]" strokeWidth={2} />
            </button>
            <button onClick={() => navigate('index', null, null)} className={`transition-colors active:scale-95 ${view === 'index' ? 'text-[var(--ios-blue)]' : 'text-[#8E8E93] hover:text-black dark:hover:text-white'}`}>
              <List className="w-[20px] h-[20px]" strokeWidth={2} />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors active:scale-95 ml-2">
              {isDark ? <Sun className="w-[20px] h-[20px]" strokeWidth={2} /> : <Moon className="w-[20px] h-[20px]" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pb-20">
        {view === 'home' && (
          <div className="animate-fade-in px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center">
            {/* Premium Home Intro */}
            <div className="mb-10 flex flex-col items-center w-full max-w-2xl">
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 leading-tight">
                Engineered
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-gray-500 dark:text-gray-400">
                High-fidelity technical documentation.
              </p>
            </div>

            <div className="w-full max-w-2xl mb-20 shadow-[0_12px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.3)] rounded-full">
              <SearchBar dictionaryData={dictionaryData} onSelectTerm={(id) => navigate('entry', id)} history={history} />
            </div>

            {/* Categorical Grid List */}
            <div className="w-full text-left">
              <h2 className="text-[13px] font-bold text-gray-500 mb-6 ml-2 uppercase tracking-widest">Catalog Domains</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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