import React, { useState, useEffect, useMemo } from 'react';
import { List, Sun, Moon } from 'lucide-react';
import Logo from './components/Logo.jsx';
import SearchBar from './components/SearchBar.jsx';
import DomainCard from './components/DomainCard.jsx';
import EntryDetail from './components/EntryDetail.jsx';
import IndexView from './components/IndexView.jsx';

export default function App() {
  const [dictionaryData, setDictionaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('home');
  const [activeId, setActiveId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isDark, setIsDark] = useState(true); // Default to Dark/AMOLED

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => { setDictionaryData(data); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); });
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const navigate = (page, id = null, filter = null) => {
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

  if (isLoading) return <div className="flex h-screen items-center justify-center font-mono text-sm tracking-widest uppercase text-gray-500">Initializing...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#27272A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <Logo onClick={() => navigate('home')} />
          <div className="hidden md:flex flex-1 mx-8 justify-center">
            {view !== 'home' && <div className="w-full max-w-md"><SearchBar dictionaryData={dictionaryData} onSelectTerm={(id) => navigate('entry', id)} /></div>}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('index')} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"><List className="w-5 h-5" /></button>
            <button onClick={() => setIsDark(!isDark)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>
        </div>
      </header>
      
      <main className="min-h-[calc(100vh-64px)] pb-20">
        {view === 'home' && (
          <div className="animate-fade-in">
            <div className="pt-24 pb-20 px-4 text-center border-b border-gray-100 dark:border-[#111]">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black dark:text-white mb-6">
                Engineered.
              </h1>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light mb-12 tracking-wide">
                The minimalist computer science dictionary.
              </p>
              <div className="flex justify-center w-full max-w-2xl mx-auto">
                <SearchBar dictionaryData={dictionaryData} onSelectTerm={(id) => navigate('entry', id)} />
              </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 mt-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-8">Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {domains.map((d) => (
                  <DomainCard key={d.name} title={d.name} count={d.count} onClick={() => navigate('index', null, d.name)} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Pass dictionaryData to EntryDetail for cross-linking */}
        {view === 'entry' && <EntryDetail entry={dictionaryData.find(i => i.id === activeId)} dictionaryData={dictionaryData} onNavigate={navigate} />}
        {view === 'index' && <IndexView dictionaryData={dictionaryData} activeFilter={activeFilter} navigate={navigate} />}
      </main>
    </div>
  );
}