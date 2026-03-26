import React, { useMemo } from 'react';
import { Bookmark, Map, X, Clock, Network, Search, Trash2, ArrowRight } from 'lucide-react';
import { Concept, Roadmap } from '../types';
import { getFullDomainName } from '../utils/domains';

interface BookmarksViewProps {
  bookmarks: string[];
  roadmaps: Roadmap[];
  concepts: Concept[];
  onNavigate: (conceptId: string) => void;
  onClose: () => void;
  onRemoveBookmark: (id: string) => void;
  onDeleteRoadmap: (id: string) => void;
  onOpenRoadmap: (r: Roadmap) => void;
}

export default function BookmarksView({
  bookmarks,
  roadmaps,
  concepts,
  onNavigate,
  onClose,
  onRemoveBookmark,
  onDeleteRoadmap,
  onOpenRoadmap
}: BookmarksViewProps) {
  const [activeTab, setActiveTab] = React.useState<'words' | 'roadmaps'>('words');

  const groupedBookmarks = useMemo(() => {
    const bookmarkedConcepts = bookmarks.map(id => concepts.find(c => c.id === id)).filter(Boolean) as Concept[];
    const grouped = bookmarkedConcepts.reduce((acc, c) => {
      if (!acc[c.domain]) acc[c.domain] = [];
      acc[c.domain].push(c);
      return acc;
    }, {} as Record<string, Concept[]>);

    const sortedDomains = Object.keys(grouped).sort((a, b) => getFullDomainName(a).localeCompare(getFullDomainName(b)));

    sortedDomains.forEach(domain => {
      grouped[domain].sort((a, b) => a.term.localeCompare(b.term));
    });

    return { grouped, sortedDomains };
  }, [bookmarks, concepts]);

  const sortedRoadmaps = useMemo(() => {
    return [...roadmaps].sort((a, b) => b.createdAt - a.createdAt);
  }, [roadmaps]);

  return (
    <div className="fixed inset-0 z-[100] bg-bg overflow-y-auto w-full h-full animate-fade-in perspective-1000">
      <button
        onClick={onClose}
        className="fixed top-6 right-6 lg:right-10 p-3 bg-[var(--hover)] dark:bg-[var(--active)] hover:bg-[var(--active)] dark:hover:bg-card/20 rounded-full transition-colors z-[110]"
      >
        <X className="w-6 h-6 text-[var(--text)]" />
      </button>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-16 text-[var(--text)] pb-32">
        <header className="mb-12">
          <h1 className="text-page-title bg-[var(--text)]-gradient bg-clip-text text-transparent mb-4 pb-2">
            Library
          </h1>
          <p className="text-xl text-[#8E8E93] font-medium mb-8">
            Your saved knowledge components.
          </p>

          <div className="flex bg-[var(--hover)] dark:bg-[var(--hover)] p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('words')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'words' ? 'bg-card  text-[var(--text)] shadow-sm' : 'text-[#8E8E93] hover:text-black dark:hover:text-white'}`}
            >
              Saved Words
            </button>
            <button
              onClick={() => setActiveTab('roadmaps')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'roadmaps' ? 'bg-card  text-[var(--text)] shadow-sm' : 'text-[#8E8E93] hover:text-black dark:hover:text-white'}`}
            >
              Saved Roadmaps
            </button>
          </div>
        </header>

        <div className="animate-fade-in block">

          {/* Saved Words - Domain Wise A-Z */}
          {activeTab === 'words' && (
            <section>
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--border)] dark:border-[var(--border)]">
                <Bookmark className="w-6 h-6 text-[var(--text)]" strokeWidth={2.5} />
                <h2 className="text-card-title text-[var(--text)]">Saved Words</h2>
              </div>

              {groupedBookmarks.sortedDomains.length === 0 ? (
                <div className="py-12 bg-[var(--hover)] dark:bg-[var(--hover)] rounded-3xl text-center border border-[var(--border)] dark:border-[var(--border)]">
                  <p className="text-[#8E8E93] font-medium">No saved words found.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {groupedBookmarks.sortedDomains.map(domain => (
                    <div key={domain} className="animate-slide-up">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#8E8E93] mb-4 pl-2">
                        {getFullDomainName(domain)}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedBookmarks.grouped[domain].map(c => (
                          <div
                            key={c.id}
                            className="group relative flex flex-col p-5 bg-card  rounded-3xl border border-[var(--border)] dark:border-[var(--border)] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(var(--ios-blue-rgb),0.1)] hover:-translate-y-1 hover:border-[var(--text)]/30 cursor-pointer"
                            onClick={() => { onClose(); onNavigate(c.id); }}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); onRemoveBookmark(c.id); }}
                              className="absolute top-3 right-3 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-bold truncate pr-8 mb-1">{c.term}</span>
                            <span className="text-sm text-[#8E8E93] line-clamp-2">{c.definition_short}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Saved Roadmaps - By Time */}
          {activeTab === 'roadmaps' && (
            <section>
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--border)] dark:border-[var(--border)]">
                <Map className="w-6 h-6 text-[var(--text)]" strokeWidth={2.5} />
                <h2 className="text-card-title text-[var(--text)]">Saved Roadmaps</h2>
              </div>

              {sortedRoadmaps.length === 0 ? (
                <div className="py-12 bg-[var(--hover)] dark:bg-[var(--hover)] rounded-3xl text-center border border-[var(--border)] dark:border-[var(--border)]">
                  <p className="text-[#8E8E93] font-medium">No saved roadmaps yet. Generate one to save it.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedRoadmaps.map((r, i) => (
                    <div
                      key={r.id}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card  rounded-3xl border border-[var(--border)] dark:border-[var(--border)] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(var(--ios-blue-rgb),0.1)] hover:-translate-y-1 hover:border-[var(--text)]/30 cursor-pointer"
                      onClick={() => { onClose(); onOpenRoadmap(r); }}
                    >
                      <div className="flex-1 min-w-0 pr-12 sm:pr-4 mb-3 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-[var(--text)] truncate">{r.query}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-[#8E8E93]">
                          <span className="flex items-center gap-1"><Network className="w-3.5 h-3.5" /> {r.steps.length} steps</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteRoadmap(r.id); }}
                        className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full opacity-0 sm:group-hover:opacity-100 transition-all scale-95 group-hover:scale-100"
                        title="Delete roadmap"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>

                      <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-[var(--hover)] dark:bg-[var(--hover)] items-center justify-center text-[var(--text)] group-hover:bg-[var(--active)] dark:group-hover:bg-[var(--active)] group-hover:text-[var(--text)] transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
