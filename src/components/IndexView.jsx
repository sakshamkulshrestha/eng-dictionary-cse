import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Hash, Map, Clock, Network, AlertCircle, Bookmark, Code, ChevronRight, Tag } from 'lucide-react';
import { getFullDomainName } from '../utils/domains';
import { useLocation } from 'react-router-dom';

export default function IndexView({ dictionaryData, onNavigate, initialFilter = null, predefinedBookmarks = [], title }) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    } else if (location.pathname === '/saved') {
      setActiveFilter('saved');
    } else {
      setActiveFilter(null);
    }
  }, [location]);

  // Logic: Filters by activeFilter or shows everything if null
  const filteredData = activeFilter === 'saved'
    ? predefinedBookmarks
    : activeFilter 
      ? dictionaryData.filter(item => item.domain === activeFilter)
      : dictionaryData;

  const displayTitle = activeFilter === 'saved' ? 'Saved Bookmarks' : (activeFilter ? getFullDomainName(title) : title);
  const sortedData = [...filteredData].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-black dark:text-white pb-32 perspective-1000">
      
      {/* Premium iOS Large Title Header */}
      <header className="mb-14 pl-2 h-auto">
        <div className="flex items-center gap-3 mb-4 animate-slide-up">
          <div className="w-11 h-11 rounded-full bg-accent-10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-accent" />
          </div>
          <span className="text-[14px] font-bold text-accent uppercase tracking-widest">
            {activeFilter ? 'Collection View' : 'Directory Index'}
          </span>
        </div>
        <h1 className="text-6xl sm:text-[80px] font-extrabold tracking-tight mb-4 animate-slide-up delay-100 leading-none pb-2">
          {displayTitle}
        </h1>
        <p className="text-xl sm:text-[22px] text-[#8E8E93] max-w-2xl font-medium animate-slide-up delay-150">
          {activeFilter ? `Explore terms related to ${getFullDomainName(activeFilter)}.` : 'Browse through the complete technical index.'}
        </p>
      </header>

      {/* Premium Apple Card Grid */}
      {sortedData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedData.map((item, idx) => {
            const delayValue = ((idx % 4) * 50) + 100;
            const delayClass = delayValue > 0 ? `delay-${delayValue}` : '';
            return (
            <div 
              key={item.id} 
              onClick={() => onNavigate('entry', item.id)}
              className={`apple-card cursor-pointer group flex flex-col justify-between min-h-[190px] animate-slide-up hover:bg-accent-10/30 hover:border-accent/40 transition-all duration-300 ${delayClass}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0 z-10">
                <div className="w-9 h-9 rounded-full bg-accent shadow-lg shadow-accent/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <ChevronRight className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
              
              <div className="relative z-10">
                {!activeFilter && (
                  <span className="inline-block px-3 py-1.5 rounded-full bg-accent-10 text-[11px] font-bold text-accent uppercase tracking-widest mb-4 transition-transform group-hover:scale-105 origin-left">
                    {item.domain}
                  </span>
                )}
                <h3 className={`text-[24px] font-bold tracking-tight text-black dark:text-white group-hover:text-accent transition-colors ${!activeFilter ? 'mb-3' : 'mb-4'} leading-tight pr-6 relative z-10 inline-block`}>
                  <span className="bg-left-bottom bg-gradient-to-r from-accent/30 to-accent/30 bg-[length:0%_40%] bg-no-repeat group-hover:bg-[length:100%_40%] transition-all duration-500 ease-out pb-1">
                    {item.term}
                  </span>
                </h3>
              </div>
              
              <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed relative z-10">
                {item.definition_short}
              </p>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1C1C1E] flex items-center justify-center mb-6">
            <Bookmark className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">No Results Found</h3>
          <p className="text-[17px] text-gray-500 font-medium">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}