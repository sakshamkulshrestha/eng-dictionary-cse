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
import SkeletonLoader from './primitives/SkeletonLoader';
import GamifiedReward from './primitives/GamifiedReward';
import MagneticButton from './primitives/MagneticButton';
import TiltCard from './primitives/TiltCard';
import AnimatedText from './primitives/AnimatedText';
import * as d3 from 'd3';
import {
  db, auth, signOut,
  collection, onSnapshot, query, orderBy, doc, setDoc,
  handleFirestoreError, OperationType
} from '../firebase';

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
    <div className="neo-card bg-card/50 overflow-hidden h-[400px] relative">
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
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
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

  const activeView = useMemo(() => {
    if (view) return view;
    return 'home';
  }, [view]);

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
    const apiKey = (import.meta as any).env?.VITE_NVIDIA_API_KEY || (import.meta as any).env?.VITE_GROQ_API_KEY || '';
    if (!apiKey) {
      console.warn('AI suggestions disabled: Missing API key (VITE_NVIDIA_API_KEY or VITE_GROQ_API_KEY).');
      return;
    }
    try {
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
              if (!res.ok) {
                console.warn(`Failed to fetch data from /data/${file}: ${res.status}`);
                return [];
              }
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

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

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

  return (
    <div className={cn("flex flex-col min-h-screen bg-bg relative overflow-x-hidden", settings.theme === 'light' && "light")}>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--bg)]"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 bg-[var(--text)]/5 border border-[var(--text)]/10 flex items-center justify-center neo-shadow"
              >
                <BookOpen className="w-7 h-7 text-[var(--text)]" />
              </motion.div>
              <AnimatedText text="Preparing Context..." el="span" className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--text)] opacity-40" animationType="chars" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAVBAR */}
      <nav className="neo-nav">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center bg-[var(--pop-white)] text-[var(--pop-black)] transition-transform group-hover:scale-95 group-active:scale-90">
              <BookOpen className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-sm tracking-wide text-[var(--text)]">THE LEXICON</span>
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[var(--text)] opacity-80">lexicon</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-auto relative px-10">
          <div className="relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-[var(--neo-green)] transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isSearchOpen) setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.main.length > 0) {
                  navigate(`/concept/${searchResults.main[0].id}`);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  (document.querySelector('[data-search-result]') as HTMLElement)?.focus();
                }
              }}
              placeholder="SEARCH PROTOCOLS..."
              className="w-full pl-16 pr-8 py-5 bg-[var(--hover)] border border-border text-xs font-mono uppercase tracking-[0.2em] transition-all focus:outline-none focus:border-[var(--neo-green)] placeholder:opacity-20 translate-z-0"
            />
          </div>

          <AnimatePresence>
            {isSearchOpen && searchQuery && (
              <>
                <div
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="fixed top-14 left-0 right-0 bottom-0 z-[55]"
                  style={{ background: 'rgba(0,0,0,0.35)' }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-[calc(100%+10px)] left-10 right-10 z-[60] max-h-[70vh] overflow-y-auto custom-scrollbar neo-card p-0"
                >
                  <div className="p-2">
                    {searchResults.main.length > 0 ? (
                      searchResults.main.map((c, i) => (
                        <button
                          key={c.id}
                          data-search-result
                          onClick={() => {
                            navigate(`/concept/${c.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between p-8 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all text-left border-b border-border last:border-none group/item"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 border-2 border-border flex items-center justify-center text-[var(--text)] group-hover/item:border-[var(--bg)] transition-all">
                              <Hash className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-black uppercase tracking-tight">{c.term}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 group-hover/item:opacity-100">{c.category || c.domain}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                        </button>
                      ))
                    ) : (
                      <div className="p-12 text-center text-muted">
                        No protocols found matching your query
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <MagneticButton title="About & Guide" onClick={() => navigate('/guide')} variant="ghost" className="w-10 h-10 p-0">
            <Info className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton
            title="Bookmarks"
            onClick={() => navigate('/bookmarks')}
            variant="ghost"
            className={cn("w-10 h-10 p-0", view === 'bookmarks' && "bg-[var(--hover)]")}
          >
            <Bookmark className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton
            title="AI Assistant"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            variant="ghost"
            className={cn("w-10 h-10 p-0", isRightPanelOpen && "bg-[var(--hover)]")}
          >
            <Bot className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton onClick={() => navigate('/settings')} variant="ghost" className="w-10 h-10 p-0" title="Settings">
            <Settings className="w-4 h-4" />
          </MagneticButton>
          <div className="h-5 w-px mx-1 bg-border" />
          {user ? (
            <button onClick={() => signOut(auth)} className="flex items-center gap-2.5 px-6 py-2 bg-[var(--hover)] transition-all hover:bg-[var(--border)]">
              <div className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-[var(--bg)] bg-[var(--text)]">
                {user.displayName?.[0] || 'U'}
              </div>
              <span className="text-xs font-semibold text-[var(--text)]">{user.displayName?.split(' ')[0]}</span>
            </button>
          ) : (
            <MagneticButton onClick={() => setIsLoginOpen(true)}>Sign In</MagneticButton>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* MAIN CONTENT CANVAS */}
        <main ref={scrollRef} className="flex-1 w-full overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg)' }}>
          <div className="max-w-5xl mx-auto px-12 py-16">
            <AnimatePresence mode="wait">
              {view === 'settings' ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SettingsView
                    isDark={settings.theme === 'dark'}
                    setIsDark={(dark: boolean) => updateSettings({ theme: dark ? 'dark' : 'light' })}
                    fontSize={settings.fontSize}
                    setFontSize={(s: any) => updateSettings({ fontSize: s })}
                    reduceMotion={settings.reduceMotion}
                    setReduceMotion={(r: boolean) => updateSettings({ reduceMotion: r })}
                    autoSpeak={settings.autoSpeak}
                    setAutoSpeak={(a: boolean) => updateSettings({ autoSpeak: a })}
                    onClearHistory={clearHistory}
                    onClearBookmarks={() => { /* clearBookmarks setter */ }}
                    bookmarks={bookmarks}
                  />
                </motion.div>
              ) : view === 'bookmarks' ? (
                <motion.div
                   key="bookmarks"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <BookmarksView
                    bookmarks={bookmarks}
                    roadmaps={roadmaps}
                    concepts={concepts}
                    onNavigate={(id) => navigate(`/concept/${id}`)}
                    onClose={() => navigate(-1)}
                    onRemoveBookmark={toggleBookmark}
                    onDeleteRoadmap={deleteRoadmap}
                    onOpenRoadmap={(r) => { setActiveRoadmap(r); setRightPanelMode('roadmap'); setIsRightPanelOpen(true); }}
                  />
                </motion.div>
              ) : view === 'guide' ? (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <GuideView onClose={() => navigate(-1)} />
                </motion.div>
              ) : selectedConcept ? (
                <EntryDetail
                  entry={selectedConcept}
                  dictionaryData={concepts}
                  onNavigate={(id: string) => navigate(`/concept/${id}`)}
                  onToggleBookmark={toggleBookmark}
                  isBookmarked={bookmarks.includes(selectedConcept.id)}
                  autoSpeak={settings.autoSpeak}
                />
              ) : domainParam ? (
                <motion.div
                  key={`domain-${domainParam}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-12"
                >
                  <header className="space-y-4">
                    <motion.div variants={staggerItem} className="flex items-center gap-4">
                      <button onClick={() => navigate('/')} className="p-3 hover:bg-[var(--hover)] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h1 className="text-page-title text-[var(--text)] capitalize">{domainParam.replace('-', ' ')}</h1>
                    </motion.div>
                    <motion.p variants={staggerItem} className="text-muted max-w-2xl">
                      Exploring the core concepts within the {domainParam} domain. Select a topic to deepen your understanding.
                    </motion.p>
                  </header>

                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6"
                  >
                    {concepts.filter(c => c.domain === domainParam).map(c => (
                        <motion.div
                          key={c.id}
                          variants={staggerItem}
                          onClick={() => navigate(`/concept/${c.id}`)}
                          className="neo-card neo-card-interactive p-10 transform-gpu"
                        >
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-2 h-2 bg-[var(--text)]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{c.category}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--text)] transition-colors">{c.term}</h3>
                        <p className="text-xs text-muted line-clamp-3 leading-relaxed">{c.definition_short}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-24"
                >
                  <motion.section 
                    style={{ scale: heroScale, opacity: heroOpacity }}
                    className="relative text-center space-y-12 py-32 mb-16"
                  >
                    <div className="space-y-8 relative z-10 flex flex-col items-center">
                      <div className="flex items-center gap-3 mb-4 px-4 py-2 border border-[var(--neo-green)]/30 bg-[var(--neo-green)]/5 text-[var(--neo-green)] text-[10px] font-bold uppercase tracking-[0.3em]">
                        <Star className="w-3 h-3 fill-[var(--neo-green)]" />
                        Exclusive Protocol Access
                      </div>
                      <AnimatedText 
                        text="Lexicon" 
                        el="h1" 
                        className="text-[16vw] sm:text-[12vw] leading-[0.85] font-black tracking-tighter uppercase text-[var(--pop-white)] text-center w-full" 
                        animationType="chars" 
                        delayOffset={0.1}
                      />
                      <motion.h2 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-2xl sm:text-4xl font-bold max-w-3xl mx-auto tracking-tight text-[var(--neo-green)] uppercase"
                      >
                        Master the complex.<br/>Dominate the domain.
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-lg max-w-2xl mx-auto leading-relaxed text-[var(--muted)] font-medium"
                      >
                        The brutally efficient engineering knowledge base. Decouple abstraction from reality and elevate your understanding.
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 1, duration: 0.4 }}
                      className="pt-10 flex flex-col items-center gap-6"
                    >
                      <MagneticButton onClick={() => setIsSearchOpen(true)} variant="primary" className="text-xl uppercase tracking-widest px-12 py-6">
                        Initialize
                      </MagneticButton>
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)]">Scroll to Explore</span>
                    </motion.div>
                  </motion.section>

                  <section className="space-y-12 mb-32">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--muted)]">Protocol Discovery</h2>
                        <span className="text-2xl font-black uppercase tracking-tighter">Explore Insiders Only</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--neo-green)]">
                        <div className="w-2 h-2 bg-[var(--neo-green)] animate-pulse" />
                        SYSTEM OPERATIONAL
                      </div>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                      <AnimatePresence>
                        {domains.map((domain, i) => {
                          const domainConcepts = concepts.filter(c => c.domain === domain);
                          return (
                            <motion.div
                              key={domain}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50px" }}
                              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <TiltCard
                                onClick={() => navigate(`/domain/${domain}`)}
                                className="group h-full flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 flex items-center justify-center border-2 border-[var(--pop-white)] text-[var(--pop-white)] bg-transparent transition-colors group-hover:bg-[var(--pop-white)] group-hover:text-[var(--pop-black)]">
                                      <Layers className="w-5 h-5" />
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 border border-[var(--border)] text-[var(--muted)] transition-colors group-hover:border-[var(--neo-green)] group-hover:text-[var(--neo-green)]">
                                      {domainConcepts.length} terms
                                    </span>
                                  </div>
                                  <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter text-[var(--text)] group-hover:text-[var(--neo-green)] transition-colors">{domain.replace(/-/g, ' ')}</h3>
                                </div>
                                <div className="mt-8 flex items-center gap-1.5 text-xs font-bold transition-transform group-hover:translate-x-1 text-[var(--text)]">
                                  Explore <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                              </TiltCard>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
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
              className="relative h-[calc(100vh-56px)] flex flex-col shrink-0 overflow-hidden bg-card border-l border-[var(--border)] dark:border-[var(--border)] sticky top-14"
            >
              {/* Panel Header */}
              <div className="px-5 pt-6 pb-2 shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--text)]">
                      <Bot className="w-5 h-5 text-[var(--bg)]" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-[var(--text)]">
                      {selectedConcept ? `Lexicon AI · ${selectedConcept.term}` : 'Lexicon AI'}
                    </span>
                  </div>
                  <button className="p-3 hover:bg-[var(--hover)] transition-colors" onClick={() => setIsRightPanelOpen(false)} title="Close">
                    <X className="w-4 h-4 text-muted" strokeWidth={2.5} />
                  </button>
                </div>
                {/* Tabs */}
                <div className="flex p-0 gap-px bg-[var(--border)] mb-10 border border-[var(--border)]">
                  {(['ask', 'roadmap'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setRightPanelMode(tab)}
                      className={`flex-1 py-4 text-[10px] font-black transition-all capitalize uppercase tracking-widest ${rightPanelMode === tab ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--bg)] text-muted hover:text-[var(--text)]'}`}
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
                      <div className="mb-10 p-10 neo-card bg-[var(--neo-green)]/5 border-[var(--neo-green)]/20 text-[transparent] bg-clip-text bg-gradient-to-r from-[var(--neo-green)] to-[var(--text)] font-bold text-[11px] uppercase tracking-[0.2em] leading-relaxed">
                        {selectedConcept
                          ? `Context: ${selectedConcept.term}`
                          : location.pathname.startsWith('/domain/')
                            ? `Domain: ${location.pathname.split('/domain/')[1]}`
                            : "Global Intelligence"}
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10 mb-10" style={{ minHeight: '160px' }}>
                        {chatMessages.length === 0 && (
                          <div className="py-20 flex flex-col items-center gap-5 text-center px-10">
                            <div className="w-16 h-16 flex items-center justify-center border-2 border-border text-muted">
                              <MessageSquare className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted leading-relaxed">System Idle. Awaiting Protocol request...</p>
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn('flex flex-col gap-3', msg.role === 'user' ? 'items-end' : 'items-start')}>
                            <div className="flex items-center gap-2 px-2">
                               <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                                 {msg.role === 'user' ? 'Operator' : 'Lexicon_AI'}
                               </span>
                            </div>
                            <div
                              className={cn(
                                'max-w-[95%] p-8 text-[14px] leading-relaxed markdown-body neo-card',
                                msg.role === 'user' ? 'bg-[var(--text)] text-[var(--bg)] border-none' : 'bg-transparent border-border'
                              )}
                            >
                              <Markdown>{msg.text}</Markdown>
                              {msg.relatedTerms && msg.relatedTerms.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-3">
                                  {msg.relatedTerms.map(term => {
                                    const c = concepts.find(x => x.term.toLowerCase() === term.toLowerCase());
                                    return c ? (
                                      <button
                                        key={term}
                                        onClick={() => navigate(`/concept/${c.id}`)}
                                        className="neo-btn-secondary px-4 py-2 text-[10px] uppercase tracking-widest"
                                      >
                                        {term}
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
                          <div className="flex flex-col gap-3 items-start animate-pulse">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--neo-green)]">Synthesizing...</span>
                            <div className="p-8 neo-card border-[var(--neo-green)]/30 bg-[var(--neo-green)]/5 w-full">
                               <div className="flex gap-2">
                                 <div className="w-2 h-2 bg-[var(--neo-green)] animate-bounce" />
                                 <div className="w-2 h-2 bg-[var(--neo-green)] animate-bounce [animation-delay:0.2s]" />
                                 <div className="w-2 h-2 bg-[var(--neo-green)] animate-bounce [animation-delay:0.4s]" />
                               </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input */}
                      <div className="relative shrink-0 mt-auto">
                        <textarea
                          value={discussionQuery}
                          onChange={e => setDiscussionQuery(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); discussFurther(); } }}
                          placeholder="INPUT COMMAND..."
                          rows={2}
                          className="w-full p-8 pr-20 text-xs font-mono rounded-none bg-[var(--hover)] border border-border text-[var(--text)] focus:outline-none focus:border-[var(--neo-green)] transition-all placeholder:opacity-30"
                        />
                        <button
                          onClick={discussFurther}
                          disabled={isDiscussing || !discussionQuery.trim()}
                          className="absolute right-5 bottom-5 w-10 h-10 flex items-center justify-center disabled:opacity-40 transition-all bg-[var(--text)] text-[var(--bg)]"
                        >
                          {isDiscussing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                      className="space-y-10"
                    >
                      <div className="space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Generate Protocol Path</h3>
                        <div className="relative">
                          <textarea
                            value={roadmapQuery}
                            onChange={(e) => setRoadmapQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateRoadmap(); } }}
                            placeholder="WHAT DO YOU WANT TO LEARN?"
                            className="w-full h-32 p-8 text-xs font-mono uppercase tracking-widest bg-[var(--hover)] border border-border focus:outline-none focus:border-[var(--neo-green)] transition-all placeholder:opacity-20 resize-none custom-scrollbar"
                          />
                          <button
                            onClick={generateRoadmap}
                            disabled={isGeneratingRoadmap || !roadmapQuery.trim()}
                            className="absolute bottom-5 right-5 w-10 h-10 flex items-center justify-center bg-[var(--text)] text-[var(--bg)] disabled:opacity-30 transition-all"
                          >
                            {isGeneratingRoadmap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {activeRoadmap && (
                        <div className="space-y-5 animate-slide-up">
                          <div className="flex items-center justify-between px-2">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Active Path: {activeRoadmap.query}</h4>
                             <button onClick={() => { saveRoadmap(activeRoadmap); setRightPanelMode('saved'); }} className="neo-btn-secondary px-4 py-2 text-[9px] uppercase tracking-widest">
                               Save Path
                             </button>
                          </div>
                          <div className="space-y-5">
                            {activeRoadmap.steps.map((step, idx) => {
                              const c = concepts.find(x => x.term === step.term);
                              return (
                                <div key={idx} className="relative pl-10">
                                  {/* Connector Line */}
                                  {idx < activeRoadmap.steps.length - 1 && (
                                    <div className="absolute left-[7.5px] top-4 bottom-[-20px] w-[1px] bg-border" />
                                  )}
                                  <div className="absolute left-0 top-3 w-4 h-4 border-2 border-[var(--text)] bg-[var(--bg)] z-10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-[var(--text)]" />
                                  </div>
                                  <div
                                    onClick={() => c && navigate(`/concept/${c.id}`)}
                                    className={cn(
                                      "p-8 neo-card neo-card-interactive transition-all",
                                      c ? "cursor-pointer" : "opacity-50"
                                    )}
                                  >
                                    <div className="text-xs font-bold mb-2 uppercase tracking-tight">{step.term}</div>
                                    <div className="text-[11px] text-muted leading-relaxed">{step.reason}</div>
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
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <GamifiedReward />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
