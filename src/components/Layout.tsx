import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import {
  Search, BookOpen, Layers, X, Info, ArrowRight,
  Menu, Hash, Loader2, Bookmark, History,
  ChevronLeft, List, ArrowLeft, Copy, Check,
  Settings, ChevronDown, ChevronRight, Zap,
  Network, Brain, Book, Compass, GitBranch, Terminal,
  Send, Trash2, Save, MessageSquare, Map,
  Volume2, AlertCircle, Sparkles, LayoutGrid,
  BookMarked, Clock, Bot, Star, Database
} from 'lucide-react';
import { Concept, Roadmap, RoadmapStep, UserSettings } from '../types';
import { getFullDomainName } from '../utils/domains';
import Fuse from 'fuse.js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useUserState } from '../hooks/useUserState';
import { DictionaryApi } from '../utils/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import GuideView from './GuideView';
import EntryDetail from './EntryDetail';
import SettingsView from './SettingsView';
import BookmarksView from './BookmarksView';
import SkeletonLoader from './primitives/SkeletonLoader';
import MagneticButton from './primitives/MagneticButton';
import TiltCard from './primitives/TiltCard';
import AnimatedText from './primitives/AnimatedText';
import * as d3 from 'd3';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- MOTION VARIANTS ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      ease: [0.16, 1, 0.3, 1] as any
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any
    }
  }
};

// --- HELPER COMPONENTS ---

function ConceptGraph({ concept, concepts, onSelect }: { concept: Concept, concepts: Concept[], onSelect: (id: string) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !concept) return;

    const width = 600;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = [
      { id: concept.id, term: concept.term, group: 'main' },
      ...(concept.prerequisites || []).map(p => {
        const c = concepts.find(x => x.term === p || x.id === p);
        return { id: c?.id || p, term: typeof p === 'string' ? p : (c?.term || 'Ref'), group: 'prereq' };
      }),
      ...(concept.suggested_related_terms || []).map(r => {
        const c = concepts.find(x => x.term === r || x.id === r);
        return { id: c?.id || r, term: typeof r === 'string' ? r : (c?.term || 'Ref'), group: 'related' };
      })
    ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const links = [
      ...(concept.prerequisites || []).map(p => ({
        source: concepts.find(x => x.term === p || x.id === p)?.id || p,
        target: concept.id,
        type: 'prereq'
      })),
      ...(concept.suggested_related_terms || []).map(r => ({
        source: concept.id,
        target: concepts.find(x => x.term === r || x.id === r)?.id || r,
        type: 'related'
      }))
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d: any) => d.type === 'prereq' ? "var(--color-accent)" : "var(--color-workspace-text-muted)")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");

    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "var(--color-workspace-text-muted)")
      .style("stroke", "none");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (e, d: any) => onSelect(d.id))
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", d => d.group === 'main' ? 12 : 8)
      .attr("fill", d => d.group === 'main' ? "var(--color-accent)" : "white")
      .attr("stroke", "var(--color-accent)")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dx", 15)
      .attr("dy", 4)
      .text(d => d.term)
      .attr("font-size", "10px")
      .attr("font-weight", d => d.group === 'main' ? "bold" : "normal")
      .attr("fill", "var(--color-workspace-text)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => { simulation.stop(); };
  }, [concept, concepts, onSelect]);

  return (
    <div className="neo-card bg-card/50 overflow-hidden h-[400px] relative">
      <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
        <Network className="w-3 h-3" />
        Relationship Graph
      </div>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
}

function SidebarNode({
  label,
  status,
  isActive,
  onClick,
  level = 0,
  hasChildren = false,
  isExpanded = false,
  onToggle
}: {
  label: string;
  status: 'locked' | 'unlocked' | 'mastered';
  isActive: boolean;
  onClick: () => void;
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={cn(
        "sidebar-node group",
        isActive && "sidebar-node-active",
        level > 0 && "ml-4 border-l border-border"
      )}
      style={{ paddingLeft: `${(level + 1) * 12}px` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={cn(
          "status-indicator",
          status === 'mastered' ? "bg-[var(--text)]" :
            status === 'unlocked' ? "bg-[var(--muted)]" : "bg-[var(--border)]"
        )} />
        <span className="truncate">{label}</span>
      </div>
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          className="p-1 hover:bg-[var(--hover)] rounded transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

export default function Layout({ view }: { view?: 'settings' | 'guide' | 'bookmarks' } = {}) {
  const navigate = useNavigate();
  const { domain: domainParam, id: idParam } = useParams();
  const location = useLocation();
  const {
    user, userProfile, isAuthReady,
    bookmarks, toggleBookmark, history, addToHistory, clearHistory, clearSystem,
    roadmaps, saveRoadmap, deleteRoadmap, settings, updateSettings,
    exportData, importData
  } = useUserState();

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(30);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [roadmapQuery, setRoadmapQuery] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'ask' | 'roadmap' | 'saved'>('ask');
  const [discussionQuery, setDiscussionQuery] = useState('');
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string, relatedTerms?: string[] }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isDiscussing]);

  const [aiSuggestions, setAiSuggestions] = useState<{ term: string, reason: string }[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedConcept = useMemo(() =>
    concepts.find(c => c.id === idParam) || null
    , [idParam, concepts]);

  useEffect(() => {
    setChatMessages([]);
  }, [location.pathname, selectedConcept?.id]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) { setIsSearchOpen(false); setSearchQuery(''); return; }
        if (isRightPanelOpen) { setIsRightPanelOpen(false); return; }
      }
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSearchOpen, isRightPanelOpen]);

  const generateRoadmap = async () => {
    if (!roadmapQuery.trim()) return;
    setIsGeneratingRoadmap(true);
    try {
      const data = await DictionaryApi.generateRoadmap(roadmapQuery, concepts);
      const steps: RoadmapStep[] = data.steps || [];
      const newRoadmap: Roadmap = {
        id: crypto.randomUUID(),
        query: roadmapQuery,
        steps: steps.sort((a, b) => a.order - b.order),
        createdAt: Date.now()
      };
      setActiveRoadmap(newRoadmap);
      setRoadmapQuery('');
    } catch (error: any) {
      alert('Failed to generate roadmap: ' + (error.message || 'Unknown error'));
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const discussFurther = async () => {
    if (!discussionQuery.trim()) return;
    setIsDiscussing(true);
    const userMsg = discussionQuery;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setDiscussionQuery('');
    try {
      let contextBlock = '';
      if (selectedConcept) {
        contextBlock = `Context: ${selectedConcept.term}. Definition: ${selectedConcept.explanation}. Related: ${selectedConcept.suggested_related_terms?.join(', ')}.`;
      } else if (location.pathname.startsWith('/domain/')) {
        contextBlock = `Context: Domain ${location.pathname.split('/domain/')[1]}.`;
      }

      const data = await DictionaryApi.chat(userMsg, contextBlock);
      const rawText = data.text || '';
      const conceptMatches = [...rawText.matchAll(/\[CONCEPT:\s*([^\]]+)\]/g)].map(m => m[1].trim());
      const relatedTerms = conceptMatches.filter(t => concepts.find(c => c.term.toLowerCase() === t.toLowerCase()));
      const cleanText = rawText.replace(/\[CONCEPT:\s*[^\]]+\]/g, (m) => {
        return `**${m.replace(/\[CONCEPT:\s*/, '').replace(/\]/, '').trim()}**`;
      });
      setChatMessages(prev => [...prev, { role: 'ai', text: cleanText, relatedTerms }]);
    } catch (error: any) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    } finally {
      setIsDiscussing(false);
    }
  };

  useEffect(() => {
    async function loadConcepts() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const allData = await DictionaryApi.getTerms();
        setConcepts(allData.sort((a: any, b: any) => a.term.localeCompare(b.term)));
      } catch (error: any) {
        console.error('Fetch failed:', error);
        setFetchError(error.message || 'Failed to sync with intelligence database.');
      } finally {
        setIsLoading(false);
      }
    }
    loadConcepts();
  }, []);



  const fuse = useMemo(() => new Fuse(concepts || [], {
    keys: ['term', 'domain', 'one_line_definition', 'explanation', 'technical_definition'],
    threshold: 0.3
  }), [concepts]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return { main: [], similar: [], contrast: [], prereq: [] };
    const results = fuse.search(searchQuery).map(r => r.item);
    return { main: results.slice(0, 5) };
  }, [searchQuery, fuse]);

  const domains = useMemo(() =>
    Array.from(new Set((concepts || []).map(c => c.domain).filter(Boolean))).sort()
    , [concepts]);

  return (
    <div className={cn("flex flex-col h-[100vh] w-full bg-[var(--bg)] overflow-hidden", settings.theme === 'light' && "light")}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--bg)]"
          >
            <Loader2 className="w-10 h-10 animate-spin text-[var(--text)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="neo-nav backdrop-blur-xl bg-[var(--bg)]/90 border-b border-[var(--border)]">
        <div className="flex items-center gap-6">
           <Link to="/" className="flex items-center gap-3">
             <motion.svg 
               viewBox="0 0 100 100" 
               className="w-10 h-10 text-[var(--text)] overflow-visible"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <rect x="0" y="0" width="100" height="100" rx="30" fill="currentColor" opacity="0.1" />
               <path d="M 30,50 Q 50,20 70,50 T 30,50" fill="currentColor" opacity="0.8" />
               <path d="M 35,50 Q 50,75 65,50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
             </motion.svg>
             <span className="font-black text-sm uppercase tracking-widest hidden sm:block text-[var(--text)]">The Lexicon</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => navigate('/')} className="px-5 py-2 text-[10px] font-black uppercase text-muted hover:text-[var(--text)]">Explore</button>
            <button onClick={() => navigate('/bookmarks')} className="px-5 py-2 text-[10px] font-black uppercase text-muted hover:text-[var(--text)]">Library</button>
            <button onClick={() => navigate('/guide')} className="px-5 py-2 text-[10px] font-black uppercase text-muted hover:text-[var(--text)]">Guide</button>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-auto px-6 relative">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
              placeholder="Search concepts..."
              className="w-full pl-14 pr-10 py-4 bg-[var(--hover)] border-2 border-[var(--border)] text-sm font-semibold focus:outline-none focus:border-[var(--text)]"
            />
          </div>
          <AnimatePresence>
            {isSearchOpen && searchQuery && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[calc(100%+8px)] left-6 right-6 z-[60] neo-card p-2 shadow-2xl overflow-y-auto max-h-[60vh]">
                {searchResults.main.map(c => (
                  <button key={c.id} onClick={() => { navigate(`/concept/${c.id}`); setIsSearchOpen(false); setSearchQuery(''); }} className="w-full p-4 hover:bg-[var(--text)] hover:text-[var(--bg)] text-left text-sm font-bold uppercase tracking-tight flex flex-col group transition-all border-b border-[var(--border)] last:border-0 last:rounded-b-lg first:rounded-t-lg">
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className="text-lg">{c.term}</span>
                      <span className="text-[10px] opacity-50 uppercase tracking-widest">{c.domain}</span>
                    </div>
                    {c.one_line_definition && <span className="text-xs font-medium opacity-70 normal-case tracking-normal line-clamp-1">{c.one_line_definition}</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <MagneticButton onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} variant="ghost" className="w-10 h-10 p-0"><Bot className="w-4 h-4" /></MagneticButton>
          <MagneticButton onClick={() => navigate('/settings')} variant="ghost" className="w-10 h-10 p-0"><Settings className="w-4 h-4" /></MagneticButton>
        </div>
      </nav>

      {/* ===== SPLIT PANES ===== */}
      <div className="flex-1 flex overflow-hidden w-full relative min-h-0">
        <main ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar pb-16 min-h-0">
          <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16">
            <AnimatePresence mode="wait">
              {fetchError ? (
                <div key="error" className="py-20 text-center flex flex-col items-center justify-center space-y-6">
                  <AlertCircle className="w-16 h-16 text-red-500 opacity-80" />
                  <h2 className="text-2xl font-black text-[var(--text)] tracking-tight uppercase">Connection Failed</h2>
                  <p className="text-[var(--muted)] font-medium max-w-md">{fetchError}</p>
                  <MagneticButton onClick={() => window.location.reload()} className="px-6 py-3 uppercase tracking-widest text-xs font-bold mt-4">
                    Re-establish Feed
                  </MagneticButton>
                </div>
              ) : view === 'settings' ? (
                <SettingsView key="settings" isDark={settings.theme === 'dark'} setIsDark={(d) => updateSettings({ theme: d ? 'dark' : 'light' })} fontSize={settings.fontSize} setFontSize={(s: any) => updateSettings({ fontSize: s })} reduceMotion={settings.reduceMotion} setReduceMotion={(r) => updateSettings({ reduceMotion: r })} autoSpeak={settings.autoSpeak} setAutoSpeak={(a) => updateSettings({ autoSpeak: a })} onClearHistory={clearHistory} onClearBookmarks={clearSystem} bookmarks={bookmarks} />
              ) : view === 'bookmarks' ? (
                <BookmarksView key="bookmarks" bookmarks={bookmarks} roadmaps={roadmaps} concepts={concepts} onNavigate={(id) => navigate(`/concept/${id}`)} onClose={() => navigate(-1)} onRemoveBookmark={toggleBookmark} onDeleteRoadmap={deleteRoadmap} onOpenRoadmap={(r) => { setActiveRoadmap(r); setRightPanelMode('roadmap'); setIsRightPanelOpen(true); }} />
              ) : view === 'guide' ? (
                <GuideView key="guide" onClose={() => navigate(-1)} />
              ) : selectedConcept ? (
                <EntryDetail entry={selectedConcept} dictionaryData={concepts} onNavigate={(id: string) => navigate(`/concept/${id}`)} onToggleBookmark={toggleBookmark} isBookmarked={bookmarks.includes(selectedConcept.id)} autoSpeak={settings.autoSpeak} />
              ) : domainParam ? (
                <motion.div key={domainParam} className="space-y-10">
                   <div>
                     <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-[var(--text)] transition-colors mb-6">
                       <ChevronLeft className="w-4 h-4" /> All Domains
                     </button>
                     <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter">{getFullDomainName(domainParam)}</h1>
                     <p className="text-muted text-sm font-medium mt-2">{concepts.filter(c => c.domain === domainParam).length} concept{concepts.filter(c => c.domain === domainParam).length !== 1 ? 's' : ''}</p>
                   </div>
                   
                   <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {concepts.filter(c => c.domain === domainParam).slice(0, displayCount).map(c => (
                       <TiltCard key={c.id} onClick={() => navigate(`/concept/${c.id}`)} className="p-8 group neo-card-interactive flex flex-col bg-[var(--card)] border border-[var(--border)] transition-all overflow-hidden relative rounded-3xl hover:border-[var(--neo-green)]/50 hover:shadow-xl shadow-sm">
                         <div className="flex items-start justify-between mb-3 group">
                           <h3 className="text-xl font-black tracking-tight text-[var(--text)] group-hover:text-[var(--neo-green)] transition-colors pr-2">{c.term}</h3>
                           <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--text)] transition-all shrink-0 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                         </div>
                         <p className="text-sm font-medium text-[var(--muted)] line-clamp-3 leading-relaxed transition-opacity">
                           {c.one_line_definition}
                         </p>
                       </TiltCard>
                     ))}
                   </motion.div>
                   {displayCount < concepts.filter(c => c.domain === domainParam).length && (
                      <div className="flex justify-center pt-8 pb-12">
                        <MagneticButton 
                          onClick={() => setDisplayCount(prev => prev + 30)}
                          className="px-8 py-3 text-sm font-black uppercase tracking-widest rounded-full shadow-lg border border-[var(--border)]"
                        >
                          Load More Concepts ({concepts.filter(c => c.domain === domainParam).length - displayCount} remaining)
                        </MagneticButton>
                      </div>
                   )}
                </motion.div>
              ) : (
                <div key="home" className="space-y-16">
                  <section className="pt-20 pb-12 text-center flex flex-col items-center relative">
                    <AnimatedText text="Lexicon" el="h1" className="text-[14vw] sm:text-[11vw] font-black uppercase tracking-tighter leading-[0.85] text-[var(--text)] drop-shadow-sm" animationType="chars" />
                    
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--neo-green)] mt-8 uppercase tracking-widest flex items-center gap-3">
                       <Network className="w-5 h-5 sm:w-6 sm:h-6" /> Computing Dictionary
                    </h2>
                    
                    {/* Creative Stats UI */}
                    <div className="flex flex-wrap justify-center gap-4 mt-12 mb-10 w-full px-6">
                       <div className="flex items-center gap-5 px-6 sm:px-8 py-5 bg-[var(--text)]/5 border border-[var(--border)] rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-105">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--neo-green)]/20 flex items-center justify-center shrink-0">
                             <Database className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--neo-green)]" />
                          </div>
                          <div className="text-left">
                             <div className="text-2xl sm:text-3xl font-black text-[var(--text)] leading-none mb-1">{concepts.length}</div>
                             <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Total Words</div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-5 px-6 sm:px-8 py-5 bg-[var(--text)]/5 border border-[var(--border)] rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-105">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--neo-purple)]/20 flex items-center justify-center shrink-0">
                             <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--neo-purple)]" />
                          </div>
                          <div className="text-left">
                             <div className="text-2xl sm:text-3xl font-black text-[var(--text)] leading-none mb-1">{domains.length}</div>
                             <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Root Domains</div>
                          </div>
                       </div>
                    </div>
                    
                    <MagneticButton onClick={() => setIsSearchOpen(true)} className="px-12 py-5 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl mt-4 border border-[var(--border)]">
                      Search Dictionary
                    </MagneticButton>
                  </section>
                  <section className="px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {domains.map(d => (
                      <TiltCard key={d} onClick={() => navigate(`/domain/${d}`)} className="p-10 neo-card-interactive flex flex-col justify-between h-64">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">{d.replace(/-/g, ' ')}</h3>
                        <div className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">Explore <ArrowRight className="w-3 h-3" /></div>
                      </TiltCard>
                    ))}
                    </div>
                  </section>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {isRightPanelOpen && (
             <motion.aside initial={{ width: 0 }} animate={{ width: 380 }} exit={{ width: 0 }} className="w-[380px] h-full bg-card border-l border-[var(--border)] flex flex-col shrink-0">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-bold text-sm uppercase tracking-widest">Intelligence</span>
                <X className="w-4 h-4 cursor-pointer" onClick={() => setIsRightPanelOpen(false)} />
              </div>
              <div className="flex mx-6 mt-6 mb-4 p-1 bg-[var(--hover)] rounded-2xl border border-[var(--border)]">
                {(['ask', 'roadmap'] as const).map(t => (
                  <button key={t} onClick={() => setRightPanelMode(t)} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${rightPanelMode === t ? 'bg-[var(--text)] text-[var(--bg)] shadow-md' : 'bg-transparent text-[var(--muted)] hover:text-[var(--text)]'}`}>{t}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {rightPanelMode === 'ask' ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-6 mb-6">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`p-6 neo-card ${m.role === 'user' ? 'bg-[var(--text)] text-[var(--bg)]' : 'border-border'}`}>
                          <Markdown>{m.text}</Markdown>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <textarea value={discussionQuery} onChange={e => setDiscussionQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); discussFurther(); } }} placeholder="CMD..." className="w-full p-4 bg-[var(--hover)] border border-border text-xs focus:outline-none" />
                      <button onClick={discussFurther} className="absolute right-4 bottom-4 p-2 bg-[var(--text)] text-[var(--bg)]"><Send className="w-3 h-3" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <textarea value={roadmapQuery} onChange={(e) => setRoadmapQuery(e.target.value)} placeholder="PATHWAY..." className="w-full h-32 p-4 bg-[var(--hover)] border border-border text-xs focus:outline-none" />
                     <button onClick={generateRoadmap} className="w-full py-4 bg-[var(--text)] text-[var(--bg)] font-black uppercase text-[10px]">Generate Path</button>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
