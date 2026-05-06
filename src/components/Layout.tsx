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
import { Concept, Roadmap, RoadmapStep, UserSettings, ChatMessage } from '../types';
import { getFullDomainName } from '../utils/domains';
import Fuse from 'fuse.js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate, useParams, useLocation, Link, useNavigationType } from 'react-router-dom';
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
import { BrandMark } from './primitives/BrandMark';
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
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as any
    }
  }
};

type AiSuggestion = {
  term: string;
  reason: string;
  matched?: boolean;
  dbTerm?: string | null;
  id?: string | null;
  score?: number;
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
    resolvedTheme, exportData, importData,
    chatConversations, saveChatConversation, deleteChatConversation,
    roadmapHistory, saveRoadmapToHistory, clearRoadmapHistory
  } = useUserState();

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(30);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [roadmapQuery, setRoadmapQuery] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'ask' | 'roadmap' | 'saved'>('ask');
  const [discussionQuery, setDiscussionQuery] = useState('');
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showRecentChats, setShowRecentChats] = useState(false);
  const [showRecentRoadmaps, setShowRecentRoadmaps] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.innerWidth < 1024);
  const [roadmapLoadingPhase, setRoadmapLoadingPhase] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isDiscussing]);

  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isAnalyzingHistory, setIsAnalyzingHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  const navType = useNavigationType();

  useEffect(() => {
    const onResize = () => setIsCompactLayout(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const mainEl = scrollRef.current;
    if (!mainEl) return;

    // If it's a PUSH navigation (new link clicked), always scroll to top
    // If it's a POP navigation (back/forward), attempt restoration
    if (navType === 'PUSH') {
      mainEl.scrollTop = 0;
      scrollPositions.current[location.key] = 0;
      return;
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollPositions.current[location.key] || 0;
        }
      }, 10);
    });
  }, [location.key, navType, concepts, domainParam]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    scrollPositions.current[location.key] = e.currentTarget.scrollTop;
  };

  // Background AI analysis — runs whenever history changes, regardless of current view
  useEffect(() => {
    if (history.length < 2) {
      setAiSuggestions([]);
      return;
    }

    const recentHistory = history.slice(0, 15);
    const cacheKey = `ai_sugg_${recentHistory.join(',')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AiSuggestion[];
        setAiSuggestions(parsed.filter((s) => s.matched && s.id).slice(0, 6));
      } catch { /* ignore parse errors */ }
      return;
    }

    let cancelled = false;
    const fetchSuggestions = async () => {
      setIsAnalyzingHistory(true);
      try {
        const data = await DictionaryApi.analyzeHistory(recentHistory);
        if (!cancelled) {
          const cleanedSuggestions = (data.suggestions || [])
            .filter((s) => s.matched && s.id)
            .slice(0, 6);
          setAiSuggestions(cleanedSuggestions);
          localStorage.setItem(cacheKey, JSON.stringify(cleanedSuggestions));
        }
      } catch (error) {
        console.error("AI History Analysis failed:", error);
      } finally {
        if (!cancelled) setIsAnalyzingHistory(false);
      }
    };

    fetchSuggestions();
    return () => { cancelled = true; };
  }, [history]);

  const selectedConcept = useMemo(() =>
    concepts.find(c => c.id === idParam) || null
    , [idParam, concepts]);

  useEffect(() => {
    setChatMessages([]);
    setDomainSearchQuery('');
  }, [location.pathname, selectedConcept?.id]);

  useEffect(() => {
    if (selectedConcept) {
      addToHistory(selectedConcept.term);
    }
  }, [selectedConcept?.id]);

  const generateRoadmap = async () => {
    if (!roadmapQuery.trim()) return;
    setIsGeneratingRoadmap(true);
    setRoadmapLoadingPhase(0);

    // Progress through loading phases while waiting
    const phaseTimer = setInterval(() => {
      setRoadmapLoadingPhase(prev => Math.min(prev + 1, 3));
    }, 4000);

    try {
      const data = await DictionaryApi.generateRoadmap(roadmapQuery);
      const steps: RoadmapStep[] = data.steps || [];

      // Keep roadmap steps strictly limited to dictionary-backed terms.
      const mappedSteps = steps
        .filter((step) => step.matched && step.id)
        .map(step => ({
          ...step,
          term: step.dbTerm || step.term
        }));

      const dedupedSteps: RoadmapStep[] = [];
      const seenStepIds = new Set<string>();
      for (const step of mappedSteps) {
        const key = step.id || step.term.toLowerCase();
        if (!seenStepIds.has(key)) {
          seenStepIds.add(key);
          dedupedSteps.push(step);
        }
      }

      const newRoadmap: Roadmap = {
        id: crypto.randomUUID(),
        query: data.title || roadmapQuery,
        steps: dedupedSteps
          .sort((a, b) => a.order - b.order)
          .map((step, index) => ({ ...step, order: index + 1 })),
        createdAt: Date.now()
      };
      setActiveRoadmap(newRoadmap);
      saveRoadmapToHistory(newRoadmap);
      setRoadmapQuery('');
    } catch (error: any) {
      alert('Failed to generate roadmap: ' + (error.message || 'Unknown error'));
    } finally {
      clearInterval(phaseTimer);
      setIsGeneratingRoadmap(false);
    }
  };

  const discussFurther = async (directQuery?: string | React.MouseEvent) => {
    const queryText = typeof directQuery === 'string' ? directQuery : discussionQuery;
    if (!queryText.trim()) return;
    setIsDiscussing(true);
    const userMsg = queryText;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    if (typeof directQuery !== 'string') {
      setDiscussionQuery('');
    }
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
      const relatedTerms = conceptMatches.filter(t => concepts.find(c => c.term?.toLowerCase() === t.toLowerCase()));
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
        setConcepts(allData.sort((a: any, b: any) => (a.term || '').localeCompare(b.term || '')));
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

  const { uniqueSearchResults, hasExactMatch } = useMemo(() => {
    if (!searchQuery) return { uniqueSearchResults: [], hasExactMatch: false };
    const results = fuse.search(searchQuery).map(r => r.item);
    const unique = [];
    const seen = new Set();
    let exactMatch = false;
    for (const item of results) {
      const lower = (item.term || '').toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(item);
        if (lower === searchQuery.toLowerCase()) exactMatch = true;
      }
    }
    return { uniqueSearchResults: unique.slice(0, 5), hasExactMatch: exactMatch };
  }, [searchQuery, fuse]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery, isSearchOpen]);

  const domainSearchFuse = useMemo(() => {
    // Only compile the fuse object for the domain if we are in domain mode
    const domainConcepts = concepts.filter(c => c.domain === domainParam);
    return new Fuse(domainConcepts, {
      keys: ['term', 'one_line_definition', 'explanation', 'technical_definition'],
      threshold: 0.3
    });
  }, [concepts, domainParam]);

  const domains = useMemo(() =>
    Array.from(new Set((concepts || []).map(c => c.domain).filter(Boolean))).sort()
    , [concepts]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) { setIsSearchOpen(false); setSearchQuery(''); return; }
        if (isRightPanelOpen) { setIsRightPanelOpen(false); return; }
      }

      if (isSearchOpen) {
        const searchItems = searchQuery ? uniqueSearchResults : history.slice(0, 8);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < searchItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          if (searchQuery) {
            const c = uniqueSearchResults[selectedIndex];
            if (c) {
              addToHistory(c.term);
              navigate(`/concept/${c.id}`);
              setIsSearchOpen(false);
              setSearchQuery('');
            }
          } else {
            const h = history.slice(0, 8)[selectedIndex];
            if (h) {
              const matchedConcept = concepts.find(c => c.term?.toLowerCase() === h.toLowerCase());
              if (matchedConcept) {
                navigate(`/concept/${matchedConcept.id}`);
              } else {
                setSearchQuery(h);
              }
              setIsSearchOpen(false);
            }
          }
        }
      }

      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSearchOpen, isRightPanelOpen, searchQuery, uniqueSearchResults, history, concepts, selectedIndex, navigate, addToHistory]);

  return (
    <div className={cn("flex flex-col h-[100vh] w-full bg-[var(--bg)] overflow-hidden", resolvedTheme === 'light' && "light")}>
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
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 lg:gap-6 min-w-0">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <BrandMark className="w-10 h-10" />
              </motion.div>
              <div className="min-w-0">
                <p className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--text)] leading-none truncate">
                  Lexicon
                </p>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--muted)] mt-1 hidden sm:block">
                  For CSE
                </p>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-colors",
                  !view && !domainParam && !idParam
                    ? "bg-[var(--text)] text-[var(--bg)]"
                    : "text-muted hover:text-[var(--text)]"
                )}
              >
                Explore
              </button>
              <button
                onClick={() => navigate('/bookmarks')}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-colors",
                  view === 'bookmarks'
                    ? "bg-[var(--text)] text-[var(--bg)]"
                    : "text-muted hover:text-[var(--text)]"
                )}
              >
                Library
              </button>
              <button
                onClick={() => navigate('/guide')}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-colors",
                  view === 'guide'
                    ? "bg-[var(--text)] text-[var(--bg)]"
                    : "text-muted hover:text-[var(--text)]"
                )}
              >
                Guide
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <MagneticButton onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} variant="ghost" className="w-10 h-10 p-0 rounded-full"><Bot className="w-4 h-4" /></MagneticButton>
            <MagneticButton onClick={() => navigate('/settings')} variant="ghost" className="w-10 h-10 p-0 rounded-full"><Settings className="w-4 h-4" /></MagneticButton>
          </div>
        </div>

        <div ref={searchContainerRef} className="w-full relative mt-3 lg:max-w-2xl lg:mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search engineering terms..."
              className="h-11 sm:h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)]/85 pl-11 sm:pl-12 pr-9 text-[13px] font-semibold text-[var(--text)] shadow-sm transition-colors placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--neo-green)] focus:bg-[var(--hover)]"
            />
          </div>
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-[calc(100%+8px)] left-0 right-0 z-[60] neo-card p-2 shadow-2xl overflow-y-auto max-h-[60vh]">
                {searchQuery ? (
                  /* Search results */
                  uniqueSearchResults.length > 0 ? (
                    <>
                      {uniqueSearchResults.map((c, i) => (
                        <button key={c.id} onMouseEnter={() => setSelectedIndex(i)} onClick={() => {
                          addToHistory(c.term);
                          navigate(`/concept/${c.id}`);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }} className={cn("w-full p-4 hover:bg-[var(--text)] hover:text-[var(--bg)] text-left text-sm font-bold uppercase tracking-tight flex flex-col group transition-all border-b border-[var(--border)] last:border-0 last:rounded-b-lg first:rounded-t-lg", i === selectedIndex ? "bg-[var(--text)] text-[var(--bg)]" : "")}>
                          <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-lg">{c.term}</span>
                            <span className={cn("text-[10px] uppercase tracking-widest", i === selectedIndex ? "opacity-70" : "opacity-50")}>{c.domain}</span>
                          </div>
                          {c.one_line_definition && <span className={cn("text-xs font-medium normal-case tracking-normal line-clamp-1", i === selectedIndex ? "opacity-90" : "opacity-70")}>{c.one_line_definition}</span>}
                        </button>
                      ))}
                      {!hasExactMatch && searchQuery.length > 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                          className="px-4 py-3 border-t border-dashed border-[var(--border)] flex flex-col gap-2"
                        >
                          <button
                            onClick={() => {
                              const query = searchQuery;
                              setIsSearchOpen(false);
                              setSearchQuery('');
                              setRightPanelMode('ask');
                              setIsRightPanelOpen(true);
                              setTimeout(() => discussFurther(query), 100);
                            }}
                            className="flex items-center gap-2.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--neo-purple)] transition-colors group text-left"
                          >
                            <span className="w-5 h-5 rounded-full bg-[var(--neo-purple)]/15 flex items-center justify-center shrink-0 group-hover:bg-[var(--neo-purple)]/25 transition-colors">
                              <Bot className="w-2.5 h-2.5 text-[var(--neo-purple)]" />
                            </span>
                            <span>Not finding what you need? <strong className="text-[var(--text)] font-bold group-hover:text-[var(--neo-purple)] transition-colors">Ask AI directly →</strong></span>
                          </button>
                          
                          <a
                            href="https://forms.gle/yFKUyDdgt8FL4y2M6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--neo-green)] transition-colors group"
                          >
                            <span className="w-5 h-5 rounded-full bg-[var(--neo-green)]/15 flex items-center justify-center shrink-0 group-hover:bg-[var(--neo-green)]/25 transition-colors">
                              <Send className="w-2.5 h-2.5 text-[var(--neo-green)]" />
                            </span>
                            <span>Want us to add <strong className="text-[var(--text)] font-bold group-hover:text-[var(--neo-green)] transition-colors">"{searchQuery}"</strong>? Request it here →</span>
                          </a>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="p-8 text-center flex flex-col items-center justify-center gap-4"
                    >
                      <motion.div
                        initial={{ rotate: -8, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Search className="w-10 h-10 text-[var(--muted)] opacity-40" />
                      </motion.div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text)]">No results for "{searchQuery}"</p>
                        <p className="text-xs text-[var(--muted)] mt-1">This term isn't in our dictionary yet</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                        <motion.button
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          onClick={() => {
                            const query = searchQuery;
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            setRightPanelMode('ask');
                            setIsRightPanelOpen(true);
                            // Slight delay to allow animation to start
                            setTimeout(() => discussFurther(query), 100);
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--neo-purple)]/10 hover:bg-[var(--neo-purple)]/20 text-[var(--neo-purple)] text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          Ask AI directly
                        </motion.button>
                        <motion.a
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          href="https://forms.gle/yFKUyDdgt8FL4y2M6"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--neo-green)]/10 hover:bg-[var(--neo-green)]/20 text-[var(--neo-green)] text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        >
                          <Send className="w-3 h-3" />
                          Request this term
                        </motion.a>
                      </div>
                    </motion.div>
                  )
                ) : (
                  /* Recent history when search is empty */
                  history.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <History className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Recent Searches</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); clearHistory(); }} className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-red-500 transition-colors">
                          Clear All
                        </button>
                      </div>
                      {history.slice(0, 8).map((h, i) => {
                        const matchedConcept = concepts.find(c => c.term?.toLowerCase() === h.toLowerCase());
                        return (
                          <button
                            key={i}
                            onMouseEnter={() => setSelectedIndex(i)}
                            onClick={() => {
                              if (matchedConcept) {
                                navigate(`/concept/${matchedConcept.id}`);
                              } else {
                                setSearchQuery(h);
                              }
                              setIsSearchOpen(false);
                            }}
                            className={cn("w-full px-4 py-3 hover:bg-[var(--text)] hover:text-[var(--bg)] text-left text-sm font-semibold flex items-center gap-3 transition-all border-b border-[var(--border)] last:border-0", i === selectedIndex ? "bg-[var(--text)] text-[var(--bg)]" : "")}
                          >
                            <Clock className={cn("w-3.5 h-3.5 shrink-0", i === selectedIndex ? "opacity-70" : "opacity-40")} />
                            <span className="truncate">{h}</span>
                            {matchedConcept && <span className={cn("ml-auto text-[9px] uppercase tracking-widest shrink-0", i === selectedIndex ? "opacity-70" : "opacity-40")}>{matchedConcept.domain}</span>}
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <div className="p-6 text-center text-[var(--muted)] text-sm">Start searching to build your history</div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 lg:hidden">
          <button
            onClick={() => navigate('/')}
            className={cn(
              "px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.14em] border transition-colors",
              !view && !domainParam && !idParam
                ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            Explore
          </button>
          <button
            onClick={() => navigate('/bookmarks')}
            className={cn(
              "px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.14em] border transition-colors",
              view === 'bookmarks'
                ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            Library
          </button>
          <button
            onClick={() => navigate('/guide')}
            className={cn(
              "px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.14em] border transition-colors",
              view === 'guide'
                ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            Guide
          </button>
        </div>
      </nav>

      {/* ===== SPLIT PANES ===== */}
      <div className="flex-1 flex overflow-hidden w-full relative min-h-0">
        <main onScroll={handleScroll} ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar pb-16 min-h-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
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
                <SettingsView key="settings" theme={settings.theme} setTheme={(t) => updateSettings({ theme: t })} resolvedTheme={resolvedTheme} fontSize={settings.fontSize} setFontSize={(s: any) => updateSettings({ fontSize: s })} reduceMotion={settings.reduceMotion} setReduceMotion={(r) => updateSettings({ reduceMotion: r })} autoSpeak={settings.autoSpeak} setAutoSpeak={(a) => updateSettings({ autoSpeak: a })} fontFamily={settings.fontFamily} setFontFamily={(f: any) => updateSettings({ fontFamily: f })} onClearHistory={clearHistory} onClearBookmarks={clearSystem} bookmarks={bookmarks} />
              ) : view === 'bookmarks' ? (
                <BookmarksView key="bookmarks" bookmarks={bookmarks} roadmaps={roadmaps} concepts={concepts} onNavigate={(id) => navigate(`/concept/${id}`)} onClose={() => navigate(-1)} onRemoveBookmark={toggleBookmark} onDeleteRoadmap={deleteRoadmap} onOpenRoadmap={(r) => { setActiveRoadmap(r); setRightPanelMode('roadmap'); setIsRightPanelOpen(true); }} />
              ) : view === 'guide' ? (
                <GuideView key="guide" onClose={() => navigate(-1)} />
              ) : selectedConcept ? (
                <EntryDetail entry={selectedConcept} dictionaryData={concepts} onNavigate={(id: string) => navigate(`/concept/${id}`)} onToggleBookmark={toggleBookmark} isBookmarked={bookmarks.includes(selectedConcept.id)} autoSpeak={settings.autoSpeak} />
              ) : domainParam ? (
                <motion.div key={domainParam} className="space-y-10">
                  {(() => {
                    const domainConcepts = concepts.filter(c => c.domain === domainParam);
                    const filteredDomainConcepts = domainSearchQuery.trim()
                      ? domainSearchFuse.search(domainSearchQuery).map(r => r.item)
                      : domainConcepts;

                    return (
                      <>
                        <div>
                          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-[var(--text)] transition-colors mb-6">
                            <ChevronLeft className="w-4 h-4" /> All Domains
                          </button>
                          <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter">{getFullDomainName(domainParam)}</h1>
                          <p className="text-muted text-sm font-medium mt-2">{concepts.filter(c => c.domain === domainParam).length} concept{concepts.filter(c => c.domain === domainParam).length !== 1 ? 's' : ''}</p>
                          <div className="relative mt-8 mb-4 max-w-xl">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                            <input
                              type="text"
                              value={domainSearchQuery}
                              onChange={(e) => setDomainSearchQuery(e.target.value)}
                              placeholder={`Search within ${getFullDomainName(domainParam)}...`}
                              className="w-full pl-14 pr-12 py-4 bg-[var(--hover)] border-2 border-[var(--border)] text-sm font-semibold focus:outline-none focus:border-[var(--text)] transition-colors rounded-2xl"
                            />
                            {domainSearchQuery && (
                              <button
                                onClick={() => setDomainSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {filteredDomainConcepts.length === 0 ? (
                          <div className="py-12 text-center flex flex-col items-center justify-center opacity-70">
                            <Search className="w-12 h-12 mb-4 text-[var(--muted)]" />
                            <p className="text-lg font-bold text-[var(--text)]">No concepts found</p>
                            <p className="text-sm font-medium text-[var(--muted)]">Try adjusting your search query</p>
                          </div>
                        ) : (
                          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDomainConcepts.slice(0, displayCount).map(c => (
                              <TiltCard key={c.id} onClick={() => { addToHistory(c.term); navigate(`/concept/${c.id}`); }} className="p-8 group neo-card-interactive flex flex-col bg-[var(--card)] border border-[var(--border)] transition-all overflow-hidden relative rounded-3xl hover:border-[var(--neo-green)]/50 hover:shadow-xl shadow-sm">
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
                        )}
                        {displayCount < filteredDomainConcepts.length && (
                          <div className="flex justify-center pt-8 pb-12">
                            <MagneticButton
                              onClick={() => setDisplayCount(prev => prev + 30)}
                              className="px-8 py-3 text-sm font-black uppercase tracking-widest rounded-full shadow-lg border border-[var(--border)]"
                            >
                              Load More Concepts ({filteredDomainConcepts.length - displayCount} remaining)
                            </MagneticButton>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <div key="home" className="space-y-16">
                  <section className="pt-8 sm:pt-14 pb-8 sm:pb-12 text-center flex flex-col items-center relative">
                    <AnimatedText text="Lexicon" el="h1" className="text-[17vw] sm:text-[11vw] font-black uppercase tracking-tighter leading-[0.85] text-[var(--text)] drop-shadow-sm" animationType="chars" />

                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--neo-green)] mt-8 uppercase tracking-widest flex items-center gap-3">
                      <Network className="w-5 h-5 sm:w-6 sm:h-6" /> For CSE Students
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

                    <MagneticButton onClick={() => { searchInputRef.current?.focus(); setIsSearchOpen(true); }} className="w-full max-w-xs sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl mt-4 border border-[var(--border)]">
                      Search Dictionary
                    </MagneticButton>
                  </section>

                  {/* AI Suggestions — "Based on your searches" */}
                  {(aiSuggestions.length > 0 || isAnalyzingHistory) && (
                    <motion.section
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="px-0"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--neo-green)]/20 to-[var(--neo-purple)]/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-[var(--text)]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">Based on Your Search History</h3>
                          <p className="text-[11px] text-[var(--muted)] font-medium mt-0.5">AI analyzed your recent {history.length} topic{history.length !== 1 ? 's' : ''} and suggests</p>
                        </div>
                      </div>

                      {isAnalyzingHistory ? (
                        <div className="flex items-center gap-3 py-10 justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
                          <span className="text-sm font-medium text-[var(--muted)]">Analyzing your learning path...</span>
                        </div>
                      ) : (
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
                        >
                          {aiSuggestions.map((sugg: AiSuggestion, i: number) => {
                            const displayTerm = sugg.dbTerm || sugg.term;
                            return (
                              <motion.div
                                key={i}
                                variants={staggerItem}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                onClick={() => sugg.id ? navigate(`/concept/${sugg.id}`) : undefined}
                                className="group p-6 rounded-2xl border backdrop-blur-xl transition-all relative overflow-hidden border-[var(--border)] bg-[var(--hover)]/30 cursor-pointer hover:border-[var(--neo-green)]/40 hover:shadow-lg"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--neo-green)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-[var(--neo-green)] opacity-60" />
                                    <h4 className="font-bold text-[var(--text)] tracking-tight text-base">{displayTerm}</h4>
                                  </div>
                                  <p className="text-[13px] text-[var(--muted)] leading-relaxed">{sugg.reason}</p>
                                  <div className="flex items-center gap-1 mt-4 text-xs font-bold text-[var(--neo-green)] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    Explore <ArrowRight className="w-3 h-3" />
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </motion.div>
                      )}
                    </motion.section>
                  )}
                  <section className="px-0">
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {domains.map(d => (
                        <motion.div key={d} variants={staggerItem}>
                          <TiltCard
                            onClick={() => navigate(`/domain/${d}`)}
                            className="p-10 neo-card-interactive flex flex-col justify-between h-64 bg-[var(--card)] border border-[var(--border)] rounded-3xl"
                          >
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--text)]">{d.replace(/-/g, ' ')}</h3>
                            <div className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--neo-green)]">
                              Explore <ArrowRight className="w-3 h-3" />
                            </div>
                          </TiltCard>
                        </motion.div>
                      ))}
                    </motion.div>
                  </section>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {isRightPanelOpen && (
            <>
              {isCompactLayout && (
                <motion.button
                  key="panel-backdrop"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsRightPanelOpen(false)}
                  className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                  aria-label="Close AI panel backdrop"
                />
              )}
              <motion.aside
                initial={isCompactLayout ? { x: '100%' } : { width: 0 }}
                animate={isCompactLayout ? { x: 0 } : { width: 390 }}
                exit={isCompactLayout ? { x: '100%' } : { width: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "h-full bg-[var(--bg)] border-l border-[var(--border)] flex flex-col shrink-0 shadow-2xl z-50",
                  isCompactLayout ? "absolute inset-y-0 right-0 w-full sm:w-[430px] max-w-full" : "w-[390px]"
                )}
              >
                <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)]/60 bg-[var(--card)]/65 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--border)]/60 bg-[var(--hover)]/70 px-3 py-2">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--neo-green)]/90 to-[var(--neo-purple)]/70 text-[var(--pop-black)] flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div className="leading-tight">
                        <p className="font-bold text-sm uppercase tracking-[0.2em]">Intelligence</p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mt-1">AI Assistant</p>
                      </div>
                    </div>
                    <button onClick={() => { if (chatMessages.length > 0) { saveChatConversation(chatMessages, activeChatId || undefined); } setIsRightPanelOpen(false); }} className="p-2 hover:bg-[var(--hover)] rounded-full transition-colors text-muted hover:text-[var(--text)]"><X className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="flex mx-4 sm:mx-6 mt-4 mb-4 p-1 bg-[var(--hover)] rounded-[20px] border border-[var(--border)]/60 shadow-inner overflow-hidden">
                  {(['ask', 'roadmap'] as const).map(t => (
                    <button key={t} onClick={() => setRightPanelMode(t)} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 ${rightPanelMode === t ? 'bg-[var(--text)] text-[var(--bg)] shadow-md' : 'bg-transparent text-[var(--muted)] hover:text-[var(--text)]'}`}>{t}</button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto space-y-5">
                  {rightPanelMode === 'ask' ? (
                    <div className="flex flex-col h-full overflow-hidden">
                      {chatMessages.length > 0 && (
                        <div className="px-4 sm:px-6 pt-1 pb-1 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              if (chatMessages.length > 0) {
                                saveChatConversation(chatMessages, activeChatId || undefined);
                              }
                              setChatMessages([]);
                              setActiveChatId(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] border border-transparent hover:border-[var(--border)] transition-all"
                          >
                            <Sparkles className="w-3 h-3" />
                            New Chat
                          </button>
                        </div>
                      )}
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar px-4 sm:px-6 py-2">
                        {chatMessages.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-center py-6 opacity-65">
                            <MessageSquare className="w-8 h-8 text-[var(--muted)] mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">New Chat</p>
                            <p className="text-[11px] text-[var(--muted)] mt-1 max-w-[240px] mb-6">Ask about computer science concepts, algorithms, and architectures.</p>
                            
                            {chatConversations.length > 0 && (
                              <button
                                onClick={() => setShowRecentChats(!showRecentChats)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)]/50 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-all"
                              >
                                <History className="w-3.5 h-3.5" />
                                Recent Chats
                                {showRecentChats ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
                              </button>
                            )}
                          </div>
                        )}
                        {chatMessages.length === 0 && chatConversations.length > 0 && showRecentChats && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] px-1 mb-3">Previous Chats</p>
                            {chatConversations.slice(0, 20).map((convo) => (
                              <div
                                key={convo.id}
                                className="group flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--hover)] cursor-pointer transition-all"
                                onClick={() => {
                                  setChatMessages(convo.messages);
                                  setActiveChatId(convo.id);
                                }}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold truncate">{convo.title}</p>
                                  <p className="text-[10px] text-[var(--muted)] mt-0.5">{convo.messages.length} messages · {new Date(convo.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteChatConversation(convo.id); }}
                                  className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all text-[var(--muted)]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {chatMessages.map((m, i) => (
                          <div key={i} className={cn(
                            "p-4 shadow-sm border border-[var(--border)]",
                            m.role === 'user'
                              ? 'bg-[var(--text)] text-[var(--bg)] rounded-[20px] rounded-br-[4px] ml-6'
                              : 'bg-[var(--card)] rounded-[20px] rounded-bl-[4px] mr-4'
                          )}>
                            <div className="prose prose-sm dark:prose-invert max-w-none chat-markdown">
                              <Markdown components={{
                                code({ className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const codeStr = String(children).replace(/\n$/, '');
                                  if (match) {
                                    return (
                                      <div className="relative group/code my-3 rounded-xl overflow-hidden border border-[var(--border)]">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#888]">{match[1]}</span>
                                          <button
                                            onClick={() => { navigator.clipboard.writeText(codeStr); }}
                                            className="text-[10px] font-bold uppercase tracking-wider text-[#888] hover:text-white transition-colors flex items-center gap-1"
                                          >
                                            <Copy className="w-3 h-3" /> Copy
                                          </button>
                                        </div>
                                        <SyntaxHighlighter language={match[1]} style={vscDarkPlus} customStyle={{ margin: 0, padding: '16px', fontSize: '13px', background: '#1e1e1e' }}>
                                          {codeStr}
                                        </SyntaxHighlighter>
                                      </div>
                                    );
                                  }
                                  return <code className="px-1.5 py-0.5 rounded-md bg-[var(--hover)] text-[var(--neo-green)] text-[13px] font-mono" {...props}>{children}</code>;
                                }
                              }}>{m.text}</Markdown>
                            </div>
                          </div>
                        ))}
                        {isDiscussing && (
                          <div className="p-4 rounded-[20px] rounded-bl-[4px] border border-[var(--border)] bg-[var(--card)] mr-4 flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-muted" />
                            <span className="text-xs text-[var(--muted)] font-medium">Thinking...</span>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="mt-auto relative px-4 sm:px-6 pb-5 sm:pb-6 space-y-2.5">
                        <div className="relative group">
                          <textarea
                            value={discussionQuery}
                            onChange={e => setDiscussionQuery(e.target.value)}
                            placeholder="Ask the assistant..."
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[22px] p-4 pr-14 min-h-[52px] max-h-[120px] resize-none text-sm font-medium outline-none focus:border-[var(--neo-green)] focus:ring-4 focus:ring-[var(--border)]/25 shadow-sm transition-all custom-scrollbar"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); discussFurther(); } }}
                          />
                          <button onClick={discussFurther} disabled={isDiscussing} className="absolute bottom-3 right-3 w-9 h-9 bg-[var(--text)] text-[var(--bg)] rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all outline-none">
                            {isDiscussing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                          AI-generated response. For reference and learning support only.
                        </p>
                      </div>
                    </div>
                  ) : rightPanelMode === 'roadmap' ? (
                    <div className="flex flex-col h-full overflow-hidden px-4 sm:px-6">
                      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar pt-2">
                        <div className="relative group mb-4">
                          <textarea
                            value={roadmapQuery}
                            onChange={(e) => setRoadmapQuery(e.target.value)}
                            placeholder="e.g., Guide me through backend development..."
                            className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-[24px] p-5 min-h-[112px] text-sm font-medium resize-none focus:border-[var(--neo-green)] focus:ring-4 focus:ring-[var(--border)]/25 shadow-sm transition-all custom-scrollbar outline-none"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateRoadmap(); } }}
                          />
                        </div>
                        <MagneticButton disabled={isGeneratingRoadmap || !roadmapQuery.trim()} onClick={() => { setRoadmapLoadingPhase(0); generateRoadmap(); }} className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] rounded-[24px] shadow-lg border border-[var(--border)]">
                          {isGeneratingRoadmap ? (
                            <span className="flex items-center justify-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-[var(--neo-green)] animate-pulse" />
                              {['Analyzing query...', 'Searching 9,800+ terms...', 'Building learning pathway...', 'Almost there...'][roadmapLoadingPhase]}
                            </span>
                          ) : 'Generate Pathway'}
                        </MagneticButton>
                        <p className="text-[10px] text-[var(--muted)] leading-relaxed mt-2 mb-2">
                          AI-generated roadmap. For reference and planning only.
                        </p>

                        {!activeRoadmap && roadmapHistory.length > 0 && (
                          <div className="mt-6">
                            <div className="flex justify-center mb-4">
                              <button
                                onClick={() => setShowRecentRoadmaps(!showRecentRoadmaps)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)]/50 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-all"
                              >
                                <History className="w-3.5 h-3.5" />
                                Recent Roadmaps
                                {showRecentRoadmaps ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
                              </button>
                            </div>
                            
                            {showRecentRoadmaps && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                {roadmapHistory.slice(0, 10).map((r) => (
                                  <div
                                    key={r.id}
                                    className="group flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--hover)] cursor-pointer transition-all"
                                    onClick={() => setActiveRoadmap(r)}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold truncate text-[var(--neo-green)]">{r.query}</p>
                                      <p className="text-[10px] text-[var(--muted)] mt-0.5">{r.steps.length} steps · {new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-all" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {activeRoadmap && (
                          <AnimatePresence>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-5">
                              <h4 className="font-bold text-[13px] uppercase tracking-widest text-[var(--neo-green)]">{activeRoadmap.query}</h4>
                              {activeRoadmap.steps.length === 0 ? (
                                <div className="p-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50">
                                  <p className="text-xs text-[var(--muted)]">No database-matched steps were found. Try a narrower topic or include one exact concept.</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {activeRoadmap.steps.map((step, i) => (
                                    <div
                                      key={i}
                                      className="p-5 bg-[var(--card)] rounded-[24px] border border-[var(--border)] shadow-sm transition-all group cursor-pointer hover:border-[var(--neo-green)]/50 hover:shadow-md"
                                      onClick={() => step.id && navigate(`/concept/${step.id}`)}
                                    >
                                      <div className="flex items-center justify-between mb-2.5">
                                        <span className="font-bold text-[15px] transition-colors group-hover:text-[var(--neo-green)]">
                                          <span className="opacity-50 text-xs mr-2">{step.order}</span>
                                          {step.term}
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-[var(--text)] transition-colors" />
                                      </div>
                                      <p className="text-[13px] text-muted leading-relaxed opacity-90">{step.reason}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {activeRoadmap.steps.length > 0 && (
                                <MagneticButton onClick={() => saveRoadmap(activeRoadmap)} className="w-full py-4 mt-6 text-xs font-black uppercase tracking-widest rounded-[32px] border border-[var(--border)] flex items-center justify-center gap-3">
                                  <Save className="w-4 h-4" /> Save Timeline
                                </MagneticButton>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
