import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, Sparkles, Bookmark, Info, List, Settings as SettingsIcon } from 'lucide-react';
import Logo from './components/Logo.jsx';
import DomainCard from './components/DomainCard.jsx';
import SearchBar from './components/SearchBar.jsx';
import EntryDetail from './components/EntryDetail.jsx';
import IndexView from './components/IndexView.jsx';
import GuideView from './components/GuideView.jsx';
import PromptWindow from './components/PromptWindow.jsx';
import SettingsView from './components/SettingsView.jsx';

export default function App() {
  const [dictionaryData, setDictionaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => JSON.parse(localStorage.getItem('isDark') || 'false'));
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#FF2D55');
  const [reduceMotion, setReduceMotion] = useState(() => JSON.parse(localStorage.getItem('reduceMotion') || 'false'));
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'standard');
  const [autoSpeak, setAutoSpeak] = useState(() => JSON.parse(localStorage.getItem('autoSpeak') || 'false'));

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
    localStorage.setItem('isDark', JSON.stringify(isDark));
    localStorage.setItem('reduceMotion', JSON.stringify(reduceMotion));
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('autoSpeak', JSON.stringify(autoSpeak));
  }, [bookmarks, history, isDark, reduceMotion, accentColor, fontSize, autoSpeak]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    if (reduceMotion) document.body.classList.add('reduce-motion');
    else document.body.classList.remove('reduce-motion');

    document.documentElement.style.fontSize = fontSize === 'large' ? '18px' : '16px';

    const hexToRgb = (hex) => {
      const v = hex.replace('#', '');
      if (v.length === 6) {
        return `${parseInt(v.slice(0, 2), 16)} ${parseInt(v.slice(2, 4), 16)} ${parseInt(v.slice(4, 6), 16)}`;
      }
      return '0 122 255';
    };

    document.documentElement.style.setProperty('--ios-blue', accentColor);
    document.documentElement.style.setProperty('--ios-blue-rgb', hexToRgb(accentColor));
  }, [isDark, reduceMotion, accentColor, fontSize]);

  const handleNavigate = (page, id = null, filter = null) => {
    if (id) {
      setHistory(prev => [id, ...prev.filter(i => i !== id)].slice(0, 5));
      navigate(`/entry/${id}`);
    } else if (filter) {
      navigate(`/${page}?filter=${filter}`);
    } else {
      navigate(page === 'home' ? '/' : `/${page}`);
    }
    window.scrollTo(0, 0);
  };

  const toggleBookmark = (entry) => {
    setBookmarks(prev => {
      const isSaved = prev.some(b => b.id === entry.id);
      return isSaved ? prev.filter(b => b.id !== entry.id) : [...prev, entry];
    });
  };

  const domains = [...new Set(dictionaryData.map(d => d.domain))];
  const domainCounts = domains.map(domain => ({
    title: domain,
    count: dictionaryData.filter(d => d.domain === domain).length
  }));

  if (isLoading) return <div className="h-screen flex items-center justify-center font-bold text-[10px] tracking-[0.5em] uppercase opacity-20 dark:text-white">Loading...</div>;

  return (
    <div className="min-h-screen font-sans">
      
      {/* --- Apple Premium Navigation Bar --- */}
      <nav className="sticky top-0 z-50 apple-glass border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <Logo onClick={() => handleNavigate('home')} />
          
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <SearchBar dictionaryData={dictionaryData} onSelectTerm={(id) => handleNavigate('entry', id)} history={history} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => handleNavigate('learn')} className={`apple-press relative px-3 py-2 rounded-xl flex items-center justify-center transition-all duration-300 ${location.pathname === '/learn' ? 'text-accent bg-accent-10' : 'text-[#8E8E93] hover:text-accent dark:hover:text-accent hover:bg-accent-10/50'}`}>
              <Sparkles className="w-[22px] h-[22px]" strokeWidth={location.pathname === '/learn' ? 2.5 : 2} />
            </button>
            <button onClick={() => handleNavigate('saved')} className={`apple-press relative px-3 py-2 rounded-xl flex items-center justify-center transition-all duration-300 ${location.pathname === '/saved' ? 'text-accent bg-accent-10' : 'text-[#8E8E93] hover:text-accent dark:hover:text-accent hover:bg-accent-10/50'}`}>
              <Bookmark className="w-[22px] h-[22px]" strokeWidth={location.pathname === '/saved' ? 2.5 : 2} />
            </button>
            <button onClick={() => handleNavigate('guide')} className={`apple-press relative px-3 py-2 rounded-xl flex items-center justify-center transition-all duration-300 ${location.pathname === '/guide' ? 'text-accent bg-accent-10' : 'text-[#8E8E93] hover:text-accent dark:hover:text-accent hover:bg-accent-10/50'}`}>
              <Info className="w-[22px] h-[22px]" strokeWidth={location.pathname === '/guide' ? 2.5 : 2} />
            </button>
            <button onClick={() => handleNavigate('index')} className={`apple-press relative px-3 py-2 rounded-xl flex items-center justify-center transition-all duration-300 ${location.pathname === '/index' ? 'text-accent bg-accent-10' : 'text-[#8E8E93] hover:text-accent dark:hover:text-accent hover:bg-accent-10/50'}`}>
              <List className="w-[22px] h-[22px]" strokeWidth={location.pathname === '/index' ? 2.5 : 2} />
            </button>
            <button onClick={() => handleNavigate('settings')} className={`apple-press relative px-3 py-2 rounded-xl flex items-center justify-center transition-all duration-300 ml-2 ${location.pathname === '/settings' ? 'text-accent bg-accent-10' : 'text-[#8E8E93] hover:text-accent dark:hover:text-accent hover:bg-accent-10/50'}`}>
              <SettingsIcon className="w-[22px] h-[22px]" strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 animate-fade-in">
        <Routes>
          <Route path="/" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 pb-32">
              <header className="mb-20 text-center max-w-3xl mx-auto">
                <h1 className="text-7xl sm:text-[96px] font-black tracking-[-0.04em] mb-6 leading-none bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-500 dark:from-white dark:to-gray-400 pb-2 animate-slide-up">
                  Engineered
                </h1>
                <p className="text-xl sm:text-[22px] font-medium text-[#8E8E93] animate-slide-up delay-100">
                  Your elegant guide to computing and engineering.
                </p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {domainCounts.map((dc, i) => (
                  <DomainCard 
                    key={dc.title} 
                    title={dc.title} 
                    count={dc.count} 
                    onClick={() => handleNavigate('index', null, dc.title)}
                    style={{ animationDelay: `${150 + (i * 50)}ms` }}
                  />
                ))}
              </div>
            </div>
          } />

          <Route path="/index" element={
            <IndexView dictionaryData={dictionaryData} onNavigate={handleNavigate} />
          } />

          <Route path="/saved" element={
            <IndexView dictionaryData={dictionaryData} onNavigate={handleNavigate} initialFilter="saved" predefinedBookmarks={bookmarks} />
          } />

          <Route path="/entry/:id" element={
             <EntryDetailWrapper 
               dictionaryData={dictionaryData} 
               onNavigate={handleNavigate} 
               onToggleBookmark={toggleBookmark} 
               bookmarks={bookmarks} 
               autoSpeak={autoSpeak}
             />
          } />

          <Route path="/guide" element={<GuideView />} />
          <Route path="/learn" element={<PromptWindow dictionaryData={dictionaryData} onNavigate={handleNavigate} />} />
          
          <Route path="/settings" element={
            <SettingsView 
              isDark={isDark} 
              setIsDark={setIsDark} 
              accentColor={accentColor} 
              setAccentColor={setAccentColor}
              reduceMotion={reduceMotion}
              setReduceMotion={setReduceMotion}
              fontSize={fontSize}
              setFontSize={setFontSize}
              autoSpeak={autoSpeak}
              setAutoSpeak={setAutoSpeak}
              onClearHistory={() => setHistory([])}
              onClearBookmarks={() => setBookmarks([])}
              bookmarks={bookmarks}
              setBookmarks={setBookmarks}
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

// Wrapper component to extract ID from router params
import { useParams } from 'react-router-dom';
function EntryDetailWrapper({ dictionaryData, onNavigate, onToggleBookmark, bookmarks, autoSpeak }) {
  const { id } = useParams();
  const entry = dictionaryData.find(i => i.id === id);
  return (
    <EntryDetail 
      entry={entry} 
      dictionaryData={dictionaryData} 
      onNavigate={onNavigate} 
      onToggleBookmark={onToggleBookmark} 
      isBookmarked={bookmarks.some(b => b.id === id)} 
      autoSpeak={autoSpeak}
    />
  );
}