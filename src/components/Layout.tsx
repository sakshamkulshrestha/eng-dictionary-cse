import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Markdown from 'react-markdown';
import {
  Search, BookOpen, Layers, X, Info, ArrowRight,
  Menu, Hash, Loader2, Bookmark, History,
  ChevronLeft, List, ArrowLeft, Copy, Check,
  Settings, ChevronDown, ChevronRight, Zap,
  Network, Brain, Book, Compass, GitBranch, Terminal,
  Send, Trash2, Save, MessageSquare, Map,
  Volume2, AlertCircle, Sparkles, LayoutGrid,
  BookMarked, Clock, Bot, Star
} from 'lucide-react';
import { Concept, Roadmap, RoadmapStep, UserSettings } from '../types';
import { getFullDomainName } from '../utils/domains';
import Fuse from 'fuse.js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useUserState } from '../hooks/useUserState';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: roadmapQuery, concepts })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
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

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, contextBlock })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
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
      try {
        const res = await fetch('/api/terms');
        const allData = await res.json();
        setConcepts(allData.sort((a: any, b: any) => a.term.localeCompare(b.term)));
      } catch (error) {
        console.error('Fetch failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConcepts();
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

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
    Array.from(new Set((concepts || []).map(c => c.domain))).sort()
    , [concepts]);

  return (
    <div className={cn("flex flex-col min-h-screen bg-bg relative overflow-x-hidden", settings.theme === 'light' && "light")}>
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
             <div className="w-9 h-9 bg-[var(--text)]" />
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

      <div className="flex-1 flex overflow-hidden">
        <main ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto px-12 py-16">
            <AnimatePresence mode="wait">
              {view === 'settings' ? (
                <SettingsView key="settings" isDark={settings.theme === 'dark'} setIsDark={(d) => updateSettings({ theme: d ? 'dark' : 'light' })} fontSize={settings.fontSize} setFontSize={(s: any) => updateSettings({ fontSize: s })} reduceMotion={settings.reduceMotion} setReduceMotion={(r) => updateSettings({ reduceMotion: r })} autoSpeak={settings.autoSpeak} setAutoSpeak={(a) => updateSettings({ autoSpeak: a })} onClearHistory={clearHistory} onClearBookmarks={clearSystem} bookmarks={bookmarks} />
              ) : view === 'bookmarks' ? (
                <BookmarksView key="bookmarks" bookmarks={bookmarks} roadmaps={roadmaps} concepts={concepts} onNavigate={(id) => navigate(`/concept/${id}`)} onClose={() => navigate(-1)} onRemoveBookmark={toggleBookmark} onDeleteRoadmap={deleteRoadmap} onOpenRoadmap={(r) => { setActiveRoadmap(r); setRightPanelMode('roadmap'); setIsRightPanelOpen(true); }} />
              ) : view === 'guide' ? (
                <GuideView key="guide" onClose={() => navigate(-1)} />
              ) : selectedConcept ? (
                <EntryDetail entry={selectedConcept} dictionaryData={concepts} onNavigate={(id: string) => navigate(`/concept/${id}`)} onToggleBookmark={toggleBookmark} isBookmarked={bookmarks.includes(selectedConcept.id)} autoSpeak={settings.autoSpeak} />
              ) : domainParam ? (
                <div key={domainParam} className="space-y-12">
                   <h1 className="text-6xl font-black uppercase tracking-tighter">{domainParam}</h1>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {concepts.filter(c => c.domain === domainParam).map(c => (
                       <TiltCard key={c.id} onClick={() => navigate(`/concept/${c.id}`)} className="p-8 sm:p-10 group neo-card-interactive hover:shadow-xl hover:scale-[1.02] flex flex-col bg-[var(--text)]/5 backdrop-blur-md border border-[var(--border)] transition-all overflow-hidden relative">
                         <div className="absolute top-0 left-0 w-full h-1 bg-[var(--text)] opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="flex items-center justify-between mb-3">
                           <h3 className="text-2xl font-black tracking-tight text-[var(--text)] group-hover:text-[var(--neo-green)] transition-colors">{c.term}</h3>
                           <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--text)] transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                         </div>
                         <p className="text-sm font-medium text-[var(--muted)] line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                           {c.one_line_definition}
                         </p>
                       </TiltCard>
                     ))}
                   </div>
                </div>
              ) : (
                <div key="home" className="space-y-24">
                  <motion.section style={{ scale: heroScale, opacity: heroOpacity }} className="py-32 text-center flex flex-col items-center">
                    <AnimatedText text="Lexicon" el="h1" className="text-[14vw] font-black uppercase tracking-tighter leading-[0.85] text-[var(--text)]" animationType="chars" />
                    <h2 className="text-3xl font-bold text-[var(--neo-green)] mt-8 uppercase tracking-widest">Protocol Intelligence</h2>
                    <MagneticButton onClick={() => setIsSearchOpen(true)} className="mt-12 px-12 py-6 text-xl uppercase tracking-widest">Initialize</MagneticButton>
                  </motion.section>
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {domains.map(d => (
                      <TiltCard key={d} onClick={() => navigate(`/domain/${d}`)} className="p-10 neo-card-interactive flex flex-col justify-between h-64">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">{d.replace(/-/g, ' ')}</h3>
                        <div className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">Explore <ArrowRight className="w-3 h-3" /></div>
                      </TiltCard>
                    ))}
                  </section>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.aside initial={{ width: 0 }} animate={{ width: 380 }} exit={{ width: 0 }} className="h-full bg-card border-l border-[var(--border)] flex flex-col">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-bold text-sm uppercase tracking-widest">Intelligence</span>
                <X className="w-4 h-4 cursor-pointer" onClick={() => setIsRightPanelOpen(false)} />
              </div>
              <div className="flex p-px bg-border">
                {(['ask', 'roadmap'] as const).map(t => (
                  <button key={t} onClick={() => setRightPanelMode(t)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${rightPanelMode === t ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-transparent text-muted'}`}>{t}</button>
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
