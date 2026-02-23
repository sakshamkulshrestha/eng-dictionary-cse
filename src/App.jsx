import React, { useState, useEffect, useMemo } from 'react';
import { List, ArrowRight, Sun, Moon } from 'lucide-react';
import { getDomainIcon } from './utils/helpers.jsx';
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
  const [isDark, setIsDark] = useState(false);

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
    window.scrollTo(0, 0);
    setView(page);
    setActiveId(id);
    setActiveFilter(filter);
  };

  const domains = useMemo(() => {
    const counts = {};
    dictionaryData.forEach(d => counts[d.domain] = (counts[d.domain] || 0) + 1);
    return Object.keys(counts).map(name => ({ name, count: counts[name] }));
  }, [dictionaryData]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900">
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Logo onClick={() => navigate('home')} />
          <div className="hidden md:flex flex-1 mx-8 justify-center">
            {view !== 'home' && <div className="w-full max-w-md"><SearchBar dictionaryData={dictionaryData} onSelectTerm={(id) => navigate('entry', id)} /></div>}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={() => navigate('index')} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400"><List className="w-5 h-5" /></button>
            <button onClick={() => setIsDark(!isDark)} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400">{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-160px)]">
        {view === 'home' && (
          <div className="animate-fade-in">
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 pt-16 pb-12">
              <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-5xl font-extrabold tracking-tight dark:text-white">The <span className="text-indigo-600">Engineering</span> Dictionary</h1>
                <div className="mt-10 flex justify-center"><div className="w-full max-w-lg"><SearchBar dictionaryData={dictionaryData} onSelectTerm={(id) => navigate('entry', id)} /></div></div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold dark:text-white">Explore Domains</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((d) => <DomainCard key={d.name} title={d.name} icon={getDomainIcon(d.name)} count={d.count} onClick={() => navigate('index', null, d.name)} />)}
              </div>
            </div>
          </div>
        )}
        {view === 'entry' && <EntryDetail entry={dictionaryData.find(i => i.id === activeId)} dictionaryData={dictionaryData} onNavigate={navigate} />}
        {view === 'index' && <IndexView dictionaryData={dictionaryData} activeFilter={activeFilter} navigate={navigate} />}
      </main>
    </div>
  );
}