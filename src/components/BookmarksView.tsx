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
    <div className="w-full h-full animate-fade-in perspective-1000">

      <div className="max-w-[1400px] w-full mx-auto p-20 text-[var(--text)] pb-32">
        <header className="mb-20">
          <h1 className="text-page-title mb-5">
            Library
          </h1>
          <p className="text-lg text-muted font-bold uppercase tracking-widest">
            Your saved knowledge components.
          </p>

          <div className="flex bg-[var(--card)] p-1.5 rounded-2xl w-fit border border-[var(--border)] shadow-sm">
            <button
              onClick={() => setActiveTab('words')}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${activeTab === 'words' ? 'bg-[var(--text)] text-[var(--bg)] shadow-md' : 'text-muted hover:text-[var(--text)] hover:bg-[var(--hover)]'}`}
            >
              Saved Words
            </button>
            <button
              onClick={() => setActiveTab('roadmaps')}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${activeTab === 'roadmaps' ? 'bg-[var(--text)] text-[var(--bg)] shadow-md' : 'text-muted hover:text-[var(--text)] hover:bg-[var(--hover)]'}`}
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
                <div className="py-20 bg-[var(--hover)] text-center border-2 border-dashed border-[var(--border)]">
                  <p className="text-muted font-black uppercase tracking-widest">Protocol: No intelligence saved.</p>
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
                            className="group relative flex flex-col p-8 sm:p-10 bg-[var(--card)] border border-[var(--border)] shadow-sm rounded-3xl cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-[var(--neo-green)] transition-all overflow-hidden"
                            onClick={() => onNavigate(c.id)}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); onRemoveBookmark(c.id); }}
                              className="absolute top-3 right-3 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all opacity-0 group-hover:opacity-100 rounded-full z-10"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-xl sm:text-2xl font-black tracking-tight mb-3 text-[var(--text)] group-hover:text-[var(--neo-green)] transition-colors pr-6">{c.term}</span>
                            <span className="text-sm text-[var(--muted)] font-medium leading-relaxed line-clamp-2 opacity-90 transition-opacity">{c.one_line_definition}</span>
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
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-8 sm:p-10 bg-[var(--card)] border border-[var(--border)] rounded-[32px] cursor-pointer hover:border-[var(--neo-green)]/50 hover:shadow-xl transition-all shadow-sm overflow-hidden"
                      onClick={() => onOpenRoadmap(r)}
                    >
                      <div className="flex-1 min-w-0 pr-12 sm:pr-8 mb-4 sm:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight group-hover:text-[var(--neo-green)] transition-colors line-clamp-1">{r.query}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-[#8E8E93]">
                          <span className="flex items-center gap-1.5"><Network className="w-4 h-4" /> {r.steps.length} steps</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteRoadmap(r.id); }}
                        className="absolute top-6 right-6 p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 border border-red-500/20"
                        title="Delete roadmap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="hidden sm:flex shrink-0 w-14 h-14 bg-[var(--text)]/5 rounded-full items-center justify-center text-[var(--text)] group-hover:bg-[var(--text)] group-hover:text-[var(--bg)] transition-colors border border-[var(--border)] mr-10 relative z-0">
                        <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 absolute transition-all" />
                        <Map className="w-5 h-5 group-hover:opacity-0 transition-all absolute" />
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
