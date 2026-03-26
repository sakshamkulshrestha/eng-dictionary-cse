import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Filter, BookOpen, Layers, Zap, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchConcepts, getAllConcepts, getAllDomains } from '../utils/searchEngine';
import { Concept } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const allConcepts = getAllConcepts();
  const domains = getAllDomains();

  const searchResults = useMemo(() => {
    if (!query) return [];
    return searchConcepts(query);
  }, [query]);

  const filteredConcepts = useMemo(() => {
    let result = allConcepts;
    if (selectedDomain) {
      result = result.filter(c => c.domain === selectedDomain);
    }
    if (selectedDifficulty) {
      result = result.filter(c => c.difficulty === selectedDifficulty);
    }
    return result;
  }, [selectedDomain, selectedDifficulty, allConcepts]);

  const displayConcepts = query ? searchResults.map(r => r.item) : filteredConcepts;

  return (
    <div className="space-y-12">
      {/* Hero Section with Search */}
      <section className="text-center space-y-8 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-page-title text-[var(--text)]">
            Engineering <span className="text-[#0071E3]">Intelligence</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto font-medium">
            The ultimate dictionary for engineers, powered by data and relationships.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-muted group-focus-within:text-[#0071E3] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-4 py-6 bg-card border border-gray-200 rounded-3xl text-xl focus:ring-4 focus:ring-[#0071E3]/10 focus:border-[#0071E3] outline-none transition-all shadow-sm hover:shadow-md"
            placeholder="Search concepts, domains, or related terms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <div className="absolute right-5 inset-y-0 flex items-center">
              <button 
                onClick={() => setQuery('')}
                className="text-sm font-medium text-muted hover:text-muted"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filters & Indexing */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Filter By</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDomain(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                !selectedDomain ? "bg-card text-white" : "bg-card border border-gray-200 text-muted hover:border-gray-300"
              )}
            >
              All Domains
            </button>
            {domains.map(domain => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  /* selection removed */ false ? "bg-[#0071E3] text-white" : "bg-card border border-gray-200 text-muted hover:border-gray-300"
                )}
              >
                {domain}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />

          <div className="flex gap-2">
            {["Beginner", "Intermediate", "Advanced"].map(level => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(selectedDifficulty === level ? null : level)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedDifficulty === level ? "bg-emerald-600 text-white" : "bg-card border border-gray-200 text-muted hover:border-gray-300"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayConcepts.map((concept, index) => (
              <motion.div
                key={concept.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link to={`/concept/${concept.id}`} className="block group h-full">
                  <div className="bg-card p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#0071E3]/20 transition-all h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-search text-muted text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {concept.domain}
                      </span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        concept.difficulty === "Beginner" ? "bg-emerald-400" :
                        concept.difficulty === "Intermediate" ? "bg-amber-400" : "bg-rose-400"
                      )} />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text)] mb-3 group-hover:text-[#0071E3] transition-colors">
                      {concept.term}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed mb-6 flex-grow">
                      {concept.definition_short}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex gap-2">
                        {concept.prerequisites.slice(0, 2).map(p => (
                          <span key={p} className="text-[10px] font-medium text-muted">
                            #{p}
                          </span>
                        ))}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted group-hover:text-[#0071E3] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {displayConcepts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text)]">No concepts found</h3>
            <p className="text-muted">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>

      {/* Quick Stats / Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0071E3]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[var(--text)]">Modular Data</h4>
            <p className="text-sm text-muted">100% JSON-driven architecture for infinite scalability.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[var(--text)]">Fuzzy Search</h4>
            <p className="text-sm text-muted">Intelligent typo-tolerant search engine with Fuse.js.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[var(--text)]">Learning Paths</h4>
            <p className="text-sm text-muted">Auto-generated prerequisite chains for deep learning.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
