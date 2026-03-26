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
  BookMarked, Clock, Bot
} from 'lucide-react';
import { Concept, Roadmap, RoadmapStep, UserSettings } from '../types';
import Fuse from 'fuse.js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useUserState } from '../hooks/useUserState';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { LoginModal } from './LoginModal';
import GuideView from './GuideView';
import EntryDetail from './EntryDetail';
import SettingsView from './SettingsView';
import BookmarksView from './BookmarksView';
import * as d3 from 'd3';
import {
  db, auth, signOut,
  collection, onSnapshot, query, orderBy, doc, setDoc,
  handleFirestoreError, OperationType
} from '../firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
        return { id: c?.id || p, term: p, group: 'prereq' };
      }),
      ...(concept.related_terms || []).map(r => {
        const c = concepts.find(x => x.term === r || x.id === r);
        return { id: c?.id || r, term: r, group: 'related' };
      })
    ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const links = [
      ...(concept.prerequisites || []).map(p => ({
        source: concepts.find(x => x.term === p || x.id === p)?.id || p,
        target: concept.id,
        type: 'prereq'
      })),
      ...(concept.related_terms || []).map(r => ({
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
    <div className="apple-card bg-card/50 rounded-sm overflow-hidden h-[400px] relative">
      <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
        <Network className="w-3 h-3" />
        Relationship Graph
      </div>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
}

function CodeWorkspace({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-workspace relative group">
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-[var(--hover)] rounded transition-colors text-muted"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-[var(--text)]" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">
        <Terminal className="w-3 h-3" />
        Implementation Workspace
      </div>
      <SyntaxHighlighter
        language="typescript"
        style={vscDarkPlus}
        customStyle={{
          background: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: '0.875rem',
          lineHeight: '1.7',
          fontFamily: 'var(--font-mono)'
        }}
      >
        {code}
      </SyntaxHighlighter>
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

export default function Layout({ view }: { view?: 'settings' | 'guide' } = {}) {
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [roadmapQuery, setRoadmapQuery] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'ask' | 'roadmap' | 'saved'>('ask');
  const [savedSubTab, setSavedSubTab] = useState<'bookmarks' | 'history' | 'roadmaps'>('bookmarks');
  const [discussionQuery, setDiscussionQuery] = useState('');
  const [discussionResponse, setDiscussionResponse] = useState<string | null>(null);
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

  console.log("Total Concepts Data Count:", concepts.length);

  useEffect(() => {
    setChatMessages([]);
  }, [location.pathname, selectedConcept?.id]);

  const speakDefinition = (term: string, definition: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${term}. ${definition}`);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (selectedConcept && autoSpeak) {
      speakDefinition(selectedConcept.term, selectedConcept.definition_short);
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [selectedConcept?.id, autoSpeak]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Escape: close any open modal/overlay
      if (e.key === 'Escape') {
        if (isSearchOpen) { setIsSearchOpen(false); setSearchQuery(''); return; }
        if (isGuideOpen) { setIsGuideOpen(false); return; }
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isBookmarksOpen) { setIsBookmarksOpen(false); return; }
        if (isRightPanelOpen) { setIsRightPanelOpen(false); return; }
      }
      // Slash or Cmd+K: focus search
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSearchOpen, isGuideOpen, isSettingsOpen, isBookmarksOpen, isRightPanelOpen]);

  // Popstate — browser back closes overlays (swipe-back on trackpad)
  useEffect(() => {
    const onBack = () => {
      if (isGuideOpen) { setIsGuideOpen(false); return; }
      if (isSettingsOpen) { setIsSettingsOpen(false); return; }
      if (isBookmarksOpen) { setIsBookmarksOpen(false); return; }
    };
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, [isGuideOpen, isSettingsOpen, isBookmarksOpen]);

  // Push a dummy history entry when guide/settings opens so swipe-back works
  useEffect(() => { if (isGuideOpen) window.history.pushState({}, ''); }, [isGuideOpen]);
  useEffect(() => { if (isSettingsOpen) window.history.pushState({}, ''); }, [isSettingsOpen]);

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
      console.error('Roadmap generation failed:', error);
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
        contextBlock = `You are an AI assistant embedded in The Lexicon, a CS knowledge dictionary. The user is currently viewing the concept "${selectedConcept.term}". Definition: ${selectedConcept.definition_detailed}. Related terms available in the database: ${selectedConcept.related_terms?.join(', ')}. When relevant, suggest related concepts from this list.`;
      } else if (location.pathname.startsWith('/domain/')) {
        const domain = location.pathname.split('/domain/')[1];
        contextBlock = `You are an AI assistant in The Lexicon CS knowledge dictionary. The user is browsing the domain "${domain}". Help them understand what concepts they can explore here.`;
      } else {
        contextBlock = `You are an AI assistant in The Lexicon, a CS/engineering knowledge base with ${concepts.length} terms across domains like AI, Cloud, Networking, OS, DSA, DBMS, and more. Help the user understand what this site offers and how to use it.`;
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
        const name = m.replace(/\[CONCEPT:\s*/, '').replace(/\]/, '').trim();
        return `**${name}**`;
      });
      setChatMessages(prev => [...prev, { role: 'ai', text: cleanText, relatedTerms }]);
    } catch (error: any) {
      const raw = error?.message || '';
      let msg: string;
      if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
        const retryMatch = raw.match(/retry in ([\d.]+)s/i);
        const waitSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;
        msg = `⏳ **Rate limit reached** — you've hit the free-tier quota for Groq Cloud.\n\n${waitSec ? `Retry in ~${waitSec} seconds, or` : 'You can'} [check your limits at console.groq.com](https://console.groq.com/).`;
      } else if (raw.includes('API_KEY_INVALID') || raw.includes('API key')) {
        msg = '⚠️ **Invalid API key.** Check `VITE_NVIDIA_API_KEY` in `.env.local` and restart the dev server.';
      } else {
        msg = `Something went wrong: ${raw || 'Unknown error'}. Please try again.`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: msg }]);
    } finally {
      setIsDiscussing(false);
    }
  };

  const generateSuggestions = useCallback(async () => {
    if (concepts.length === 0) return;
    try {
      const apiKey = (import.meta as any).env?.VITE_NVIDIA_API_KEY || (import.meta as any).env?.VITE_GROQ_API_KEY || '';
      const recentHistory = history.slice(0, 5).join(', ');
      const bookmarkedTerms = concepts.filter(c => bookmarks.includes(c.id)).map(c => c.term).join(', ');

      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-nano-30b-a3b",
          messages: [{
            role: 'user',
            content: `Based on my recent search history: [${recentHistory}] and bookmarked concepts: [${bookmarkedTerms}], 
            suggest 3 other concepts from this list: [${concepts.map(c => c.term).join(', ')}] that I should learn next. 
            Provide a brief reason for each.
            Output ONLY a JSON object with a single key "suggestions" containing an array of objects. Each object must have "term" (string) and "reason" (string).`
          }],
          temperature: 1,
          top_p: 1,
          max_tokens: 16384,
          reasoning_budget: 16384,
          chat_template_kwargs: { enable_thinking: true },
          stream: false,
          response_format: { type: "json_object" }
        })
      });
      const data = await res.json();
      const parsedData = JSON.parse(data.choices[0].message.content);
      setAiSuggestions(parsedData.suggestions || []);
    } catch (error) {
      console.error('Suggestions failed:', error);
    }
  }, [concepts, history, bookmarks]);

  useEffect(() => {
    if (concepts.length > 0 && (history.length > 0 || bookmarks.length > 0)) {
      generateSuggestions();
    }
  }, [concepts, history, bookmarks, generateSuggestions]);

  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'concepts'), orderBy('term', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const files = [
            'ai.json', 'cloud.json', 'coa.json', 'cyber.json', 'dbms.json',
            'dsa.json', 'networks.json', 'os.json', 'se.json', 'toc.json'
          ];
          const allData = await Promise.all(
            files.map(async (file) => {
              const res = await fetch(`/data/${file}`);
              if (!res.ok) return [];
              const json = await res.json();
              return json.map((item: any) => ({
                ...item,
                logic_deep: item.logic_deep || item.explanation || '',
                advanced_topics: item.advanced_topics || item.related_terms || [],
                examples: item.examples || [],
                related_terms: item.related_terms || [],
                prerequisites: item.prerequisites || []
              }));
            })
          );
          setConcepts(allData.flat().sort((a, b) => a.term.localeCompare(b.term)));
        } catch (error) {
          console.error('Fallback fetch failed:', error);
        }
      } else {
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            examples: d.examples || [],
            related_terms: d.related_terms || [],
            prerequisites: d.prerequisites || [],
            advanced_topics: d.advanced_topics || d.related_terms || []
          };
        }) as Concept[];
        setConcepts(data);
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'concepts');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const fuse = useMemo(() => new Fuse(concepts || [], {
    keys: ['term', 'domain', 'definition_short', 'definition_detailed'],
    threshold: 0.3
  }), [concepts]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return { main: [], similar: [], contrast: [], prereq: [] };
    const results = fuse.search(searchQuery).map(r => r.item);
    if (results.length === 0) return { main: [], similar: [], contrast: [], prereq: [] };

    const main = results[0];
    const similar = results.slice(1, 4);
    const contrast = concepts.filter(c =>
      c.domain === main.domain &&
      c.id !== main.id &&
      !similar.find(s => s.id === c.id)
    ).slice(0, 2);
    const prereq = concepts.filter(c =>
      main.prerequisites?.includes(c.term) || main.prerequisites?.includes(c.id)
    );

    return { main: [main], similar, contrast, prereq };
  }, [searchQuery, fuse, concepts]);

  const domains = useMemo(() =>
    Array.from(new Set((concepts || []).map(c => c.domain))).sort()
    , [concepts]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--text)]/10 flex items-center justify-center animate-pulse-glow">
            <BookOpen className="w-7 h-7 text-[var(--text)]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>Loading Lexicon...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* TOP NAVBAR */}
      <nav className="h-14 border-b flex items-center justify-between z-50 shrink-0 px-5" style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-[var(--text)]/10 border border-[var(--text)]/20">
              <BookOpen className="w-4.5 h-4.5 text-[var(--text)]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-sm tracking-wide text-[var(--text)]">THE LEXICON</span>
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[var(--text)] opacity-80">lexicon</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-auto relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-[var(--text)] transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.main.length > 0) {
                  navigate(`/concept/${searchResults.main[0].id}`);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }
                if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  (document.querySelector('[data-search-result]') as HTMLElement)?.focus();
                }
              }}
              placeholder="Search"
              className="h-[44px] rounded-full focus:ring-4 focus:ring-[var(--accent-20)] focus:border-[var(--text)] outline-none transition-all text-[15px] bg-[var(--search)] text-[var(--text)] placeholder:text-[var(--muted)] border border-transparent focus:bg-[var(--card)] pl-12 py-3 bg-bg/50 border-border focus:bg-card dark:focus:bg-sidebar"
            />
          </div>

          {/* SEARCH RESULTS OVERLAY — fixed modal */}
          <AnimatePresence>
            {isSearchOpen && searchQuery && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="fixed top-14 left-0 right-0 bottom-0 z-[55]"
                  style={{ background: 'rgba(0,0,0,0.35)' }}
                />
                {/* Results panel */}
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  className="absolute top-[calc(100%+8px)] left-0 right-0 z-[60] max-h-[70vh] overflow-y-auto custom-scrollbar rounded-3xl bg-card  border border-[var(--border)] dark:border-[var(--border)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                  {searchResults.main.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {searchResults.main.map(c => (
                        <div
                          key={c.id}
                          data-search-result
                          tabIndex={0}
                          onClick={() => { navigate(`/concept/${c.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                          onKeyDown={e => { if (e.key === 'Enter') { navigate(`/concept/${c.id}`); setIsSearchOpen(false); setSearchQuery(''); } }}
                          className="group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-[var(--hover)] dark:hover:bg-[var(--hover)] active:scale-[0.98]"
                        >
                          <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center mt-1 bg-[var(--hover)] dark:bg-[var(--active)] group-hover:bg-[var(--text)] group-hover:text-white transition-colors">
                            <Search className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Best Match</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--hover)', color: 'var(--text)' }}>{c.domain}</span>
                              {c.difficulty && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{c.difficulty}</span>}
                            </div>
                            <div className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>{c.term}</div>
                            <div className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{c.definition_short}</div>
                          </div>
                          <ArrowRight className="w-4 h-4 shrink-0 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text)' }} />
                        </div>
                      ))}

                      {(searchResults.similar.length > 0 || searchResults.contrast.length > 0 || searchResults.prereq.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Similar</div>
                            <div className="space-y-1">
                              {searchResults.similar.map(c => (
                                <button key={c.id} onClick={() => { navigate(`/concept/${c.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition-all"
                                  style={{ color: 'var(--text)', background: 'var(--panel-bg)', border: '1px solid var(--border)' }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text)'; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                                >{c.term}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Contrast</div>
                            <div className="space-y-1">
                              {searchResults.contrast.length > 0 ? searchResults.contrast.map(c => (
                                <button key={c.id} onClick={() => { navigate(`/concept/${c.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition-all"
                                  style={{ color: 'var(--text)', background: 'var(--panel-bg)', border: '1px solid var(--border)' }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text)'; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                                >{c.term}</button>
                              )) : <span className="text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>—</span>}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Prerequisites</div>
                            <div className="space-y-1">
                              {searchResults.prereq.length > 0 ? searchResults.prereq.map(c => (
                                <button key={c.id} onClick={() => { navigate(`/concept/${c.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition-all"
                                  style={{ color: 'var(--text)', background: 'var(--panel-bg)', border: '1px solid var(--border)' }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text)'; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                                >{c.term}</button>
                              )) : <span className="text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>—</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-[9px] pt-1 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: 0.45 }}>↵ open · Esc close · ⌘K focus</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Search className="w-8 h-8" style={{ color: 'var(--text-muted)', opacity: 0.25 }} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No results for "<span className="font-bold">{searchQuery}</span>"</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>

        <div className="flex items-center gap-2">
          <button
            title="About & Guide"
            onClick={() => navigate('/guide')}
            className={cn("apple-icon-btn")}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            title="Bookmarks"
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
            className={cn("apple-icon-btn", isBookmarksOpen && "active")}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            title="AI Assistant"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={cn("apple-icon-btn", isRightPanelOpen && "active")}
          >
            <Bot className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/settings')} className="apple-icon-btn" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <div className="h-5 w-px mx-1" style={{ background: 'var(--border)' }} />
          {user ? (
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 px-2.5 py-1 rounded-full transition-all" style={{ border: '1px solid var(--border)', background: 'var(--panel-bg)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[var(--bg)] bg-[var(--text)]">
                {user.displayName?.[0] || 'U'}
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{user.displayName?.split(' ')[0]}</span>
            </button>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="apple-pill">Sign In</button>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* MAIN CONTENT CANVAS */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg)' }}>
          <div className="max-w-5xl mx-auto px-12 py-16">
            <AnimatePresence mode="wait">
              {view === 'settings' ? (
                <div className="animate-fade-in w-full">
                  <SettingsView
                    isDark={settings.theme === 'dark'}
                    setIsDark={(val: boolean) => updateSettings({ theme: val ? 'dark' : 'light' })}
                    reduceMotion={settings.reduceMotion || false}
                    setReduceMotion={(val: boolean) => updateSettings({ reduceMotion: val })}
                    fontSize={settings.fontSize || 'standard'}
                    setFontSize={(val: 'standard' | 'large') => updateSettings({ fontSize: val })}
                    autoSpeak={settings.autoSpeak || false}
                    setAutoSpeak={(val: boolean) => updateSettings({ autoSpeak: val })}
                    onClearHistory={clearHistory}
                    onClearBookmarks={() => { if (clearSystem) clearSystem(); }}
                    bookmarks={bookmarks}
                    setBookmarks={() => { }}
                  />
                </div>
              ) : view === 'guide' ? (
                <div className="animate-fade-in w-full">
                  <GuideView onClose={() => navigate('/')} />
                </div>
              ) : selectedConcept ? (
                <EntryDetail
                  entry={selectedConcept}
                  dictionaryData={concepts}
                  onNavigate={(id) => navigate(`/concept/${id}`)}
                  onToggleBookmark={toggleBookmark}
                  isBookmarked={bookmarks.includes(selectedConcept.id)}
                  autoSpeak={false}
                />
              ) : domainParam ? (
                <motion.div
                  key={`domain-${domainParam}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-12"
                >
                  <header className="space-y-4">
                    <div className="flex items-center gap-4">
                      <button onClick={() => navigate('/')} className="p-2 hover:bg-[var(--hover)] rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h1 className="text-page-title text-[var(--text)] capitalize">{domainParam.replace('-', ' ')}</h1>
                    </div>
                    <p className="text-muted max-w-2xl">
                      Exploring the core concepts within the {domainParam} domain. Select a topic to deepen your understanding.
                    </p>
                  </header>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                    {concepts.filter(c => c.domain === domainParam).map(c => (
                      <div
                        key={c.id}
                        onClick={() => navigate(`/concept/${c.id}`)}
                        className="apple-card p-8 cursor-pointer group hover:border-[var(--text)]/50 hover:shadow-xl hover:shadow-accent/5 transition-all transform-gpu"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-2 h-2 rounded-full bg-[var(--text)]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{c.category}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--text)] transition-colors">{c.term}</h3>
                        <p className="text-xs text-muted line-clamp-3 leading-relaxed">{c.definition_short}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-24"
                >
                  <section className="text-center space-y-8 py-12">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto bg-[var(--text)]/10 border border-[var(--text)]/20 shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                      <BookOpen className="w-10 h-10 text-[var(--text)]" />
                    </div>
                    <div className="space-y-5">
                      <h1 className="text-hero text-[var(--text)]">The Lexicon</h1>
                      <p className="text-xl max-w-2xl mx-auto leading-relaxed text-[#8E8E93]">
                        A structured CS &amp; engineering knowledge base. Explore concepts, generate learning roadmaps, and dive deep into any topic.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-12">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted">Knowledge Domains</h2>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--text)] animate-pulse" />
                        SYSTEM READY
                      </div>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                      {domains.map(domain => {
                        const domainConcepts = concepts.filter(c => c.domain === domain);
                        return (
                          <motion.div
                            key={domain}
                            onClick={() => navigate(`/domain/${domain}`)}
                            className="group cursor-pointer rounded-3xl p-7 relative overflow-hidden bg-card  border border-[var(--border)] dark:border-[var(--border)] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)] hover:-translate-y-1 hover:border-[var(--text)]/30 transform-gpu"
                          >
                            <div className="flex items-center justify-between mb-5">
                              <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-[var(--hover)] dark:bg-[var(--active)] text-[var(--text)] group-hover:bg-[var(--active)] dark:group-hover:bg-card/20 group-hover:text-[var(--text)]">
                                <Layers className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--hover)] dark:bg-[var(--active)] text-[#8E8E93] group-hover:bg-[var(--active)] dark:group-hover:bg-card/20 transition-colors">
                                {domainConcepts.length} terms
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 capitalize tracking-tight text-[var(--text)]">{domain.replace(/-/g, ' ')}</h3>
                            {/* Removed excessive concepts pills list which balloon layout height */}
                            <div className="flex items-center gap-1.5 text-xs font-bold transition-transform group-hover:translate-x-1 text-[var(--text)]">
                              Explore <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* RIGHT PANEL: INTELLIGENCE LAYER */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="flex flex-col shrink-0 overflow-hidden bg-card  border-l border-[var(--border)] dark:border-[var(--border)] shadow-[-8px_0_32px_rgba(0,0,0,0.02)]"
            >
              {/* Panel Header */}
              <div className="px-5 pt-6 pb-2 shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--hover)] dark:bg-[var(--active)]">
                      <Bot className="w-4 h-4 text-[var(--text)]" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-[var(--text)]">
                      {selectedConcept ? `Lexicon AI · ${selectedConcept.term}` : 'Lexicon AI'}
                    </span>
                  </div>
                  <button className="p-2 rounded-full hover:bg-[var(--hover)] dark:hover:bg-[var(--active)] transition-colors" onClick={() => setIsRightPanelOpen(false)} title="Close">
                    <X className="w-4 h-4 text-muted" strokeWidth={2.5} />
                  </button>
                </div>
                {/* Tabs */}
                <div className="flex rounded-xl p-1 gap-1 bg-[var(--hover)] dark:bg-[var(--hover)] mb-4">
                  {(['ask', 'roadmap'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setRightPanelMode(tab)}
                      className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all capitalize ${rightPanelMode === tab ? 'bg-[var(--hover)] dark:bg-[var(--active)] border-l-[3px] border-[var(--text)] text-[var(--text)]' : 'text-[#8E8E93] hover:text-black dark:hover:text-white'}`}
                    >
                      {tab === 'ask' ? 'Ask Lexicon' : 'Pathways'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <AnimatePresence mode="wait">

                  {/* ── ASK TAB (context-aware chat) ── */}
                  {rightPanelMode === 'ask' && (
                    <motion.div
                      key="ask-mode"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col h-full"
                      style={{ minHeight: '0' }}
                    >
                      {/* Context hint */}
                      <div className="mb-4 px-4 py-3 rounded-2xl text-[12px] bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)] text-[#8E8E93]">
                        {selectedConcept
                          ? <>Chatting in context of <span className="font-bold text-[var(--text)]">{selectedConcept.term}</span>. Ask about related terms, comparisons, examples, or deep concepts.</>
                          : location.pathname.startsWith('/domain/')
                            ? <>Exploring the <span className="font-bold text-[var(--text)]">{location.pathname.split('/domain/')[1]}</span> domain. Ask me what to learn here.</>
                            : <>Ask me anything about The Lexicon — how to use it, what topics are available, or recommend a starting point.</>}
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4" style={{ minHeight: '160px' }}>
                        {chatMessages.length === 0 && (
                          <div className="py-10 flex flex-col items-center gap-3 text-center">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--hover)] dark:bg-[var(--hover)]">
                              <MessageSquare className="w-6 h-6 text-[#8E8E93] opacity-50" />
                            </div>
                            <p className="text-xs text-[#8E8E93]">Start a conversation. I adapt based on where you are.</p>
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                            <div
                              className={cn('max-w-[85%] px-4 py-3 text-[13px] leading-relaxed markdown-body', msg.role === 'user' ? 'bg-card dark:bg-card text-white dark:text-black shadow-md' : 'bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--text)]')}
                              style={{ borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem' }}
                            >
                              <Markdown>{msg.text}</Markdown>
                              {msg.relatedTerms && msg.relatedTerms.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {msg.relatedTerms.map(term => {
                                    const c = concepts.find(x => x.term.toLowerCase() === term.toLowerCase());
                                    return c ? (
                                      <button
                                        key={term}
                                        onClick={() => navigate(`/concept/${c.id}`)}
                                        className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all bg-card  border border-[var(--border)] dark:border-[var(--border)] text-[var(--text)] hover:border-[var(--text)] hover:text-[var(--text)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                      >
                                        {term} →
                                      </button>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                        {isDiscussing && (
                          <div className="flex justify-start">
                            <div className="px-5 py-3.5 rounded-2xl flex items-center gap-2 bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)]" style={{ borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem' }}>
                              <Loader2 className="w-4 h-4 animate-spin text-[var(--text)]" />
                              <span className="text-[12px] font-medium text-[#8E8E93]">Thinking...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input */}
                      <div className="relative shrink-0">
                        <textarea
                          value={discussionQuery}
                          onChange={e => setDiscussionQuery(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); discussFurther(); } }}
                          placeholder="Ask anything… (Enter to send)"
                          rows={2}
                          className="w-full p-4 pr-14 text-sm rounded-2xl resize-none custom-scrollbar bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--text)]/50 focus:bg-transparent transition-all"
                        />
                        <button
                          onClick={discussFurther}
                          disabled={isDiscussing || !discussionQuery.trim()}
                          className="absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all bg-[var(--text)] hover:opacity-85 active:opacity-100 shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95"
                          style={{ color: 'var(--color-accent-fg)' }}
                        >
                          {isDiscussing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {rightPanelMode === 'roadmap' && (
                    <motion.div
                      key="roadmap-mode"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Generate Learning Path</h3>
                        <div className="relative">
                          <textarea
                            value={roadmapQuery}
                            onChange={(e) => setRoadmapQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateRoadmap(); } }}
                            placeholder="What do you want to learn? (e.g., 'Mastering Distributed Systems')"
                            className="w-full h-32 p-4 text-sm bg-bg/50 border border-border rounded-lg focus:outline-none focus:border-[var(--text)]/50 resize-none custom-scrollbar"
                          />
                          <button
                            onClick={generateRoadmap}
                            disabled={isGeneratingRoadmap || !roadmapQuery.trim()}
                            className="absolute bottom-3 right-3 p-2 bg-[var(--text)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-85 active:opacity-100 shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                            style={{ color: 'var(--color-accent-fg)' }}
                          >
                            {isGeneratingRoadmap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {activeRoadmap && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Active Roadmap</h3>
                            <button
                              onClick={() => {
                                saveRoadmap(activeRoadmap);
                                setRightPanelMode('saved');
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold text-[var(--text)] hover:underline"
                            >
                              <Save className="w-3 h-3" />
                              Save Roadmap
                            </button>
                          </div>
                          <div className="space-y-4">
                            {activeRoadmap.steps.map((step, idx) => {
                              const c = concepts.find(x => x.term === step.term);
                              return (
                                <div key={idx} className="relative pl-6 border-l border-border pb-6 last:pb-0">
                                  <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-[var(--text)]" />
                                  <div
                                    onClick={() => c && navigate(`/concept/${c.id}`)}
                                    className={cn(
                                      "p-4 apple-card rounded-lg transition-all",
                                      c ? "cursor-pointer hover:border-[var(--text)]/30" : "opacity-50"
                                    )}
                                  >
                                    <div className="text-xs font-bold mb-1">{step.term}</div>
                                    <div className="text-[10px] text-muted leading-relaxed">{step.reason}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {aiSuggestions.length > 0 && (
                        <div className="space-y-6 pt-8 border-t border-border">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-[var(--text)]" />
                            Recommended for You
                          </h3>
                          <div className="space-y-3">
                            {aiSuggestions.map((s, i) => {
                              const c = concepts.find(x => x.term === s.term);
                              return (
                                <div
                                  key={i}
                                  onClick={() => c && navigate(`/concept/${c.id}`)}
                                  className="p-4 bg-[var(--text)]/5 border border-[var(--text)]/10 rounded-lg cursor-pointer hover:bg-[var(--text)]/10 transition-all"
                                >
                                  <div className="text-xs font-bold text-[var(--text)] mb-1">{s.term}</div>
                                  <div className="text-[10px] text-muted leading-relaxed">{s.reason}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}





                  {/* Saved removed by user request */}
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* BOOKMARKS FULL VIEW */}
      <AnimatePresence>
        {isBookmarksOpen && (
          <BookmarksView
            bookmarks={bookmarks}
            roadmaps={roadmaps}
            concepts={concepts}
            onNavigate={(id) => navigate(`/concept/${id}`)}
            onClose={() => setIsBookmarksOpen(false)}
            onRemoveBookmark={toggleBookmark}
            onDeleteRoadmap={deleteRoadmap}
            onOpenRoadmap={(r) => { setActiveRoadmap(r); setRightPanelMode('roadmap'); setIsRightPanelOpen(true); }}
          />
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {isLoginOpen && <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
