import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeftRight, 
  Check, 
  X, 
  Search, 
  ChevronRight,
  Sparkles,
  Layers,
  Zap,
  BookOpen
} from 'lucide-react';
import { getAllConcepts } from '../utils/searchEngine';
import { Concept } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Comparison() {
  const [searchParams, setSearchParams] = useSearchParams();
  const allConcepts = getAllConcepts();

  const termA = searchParams.get('a') || '';
  const termB = searchParams.get('b') || '';

  const conceptA = allConcepts.find(c => c.term.toLowerCase() === termA.toLowerCase());
  const conceptB = allConcepts.find(c => c.term.toLowerCase() === termB.toLowerCase());

  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  const filteredA = useMemo(() => 
    allConcepts.filter(c => c.term.toLowerCase().includes(searchA.toLowerCase())).slice(0, 5),
    [searchA, allConcepts]
  );

  const filteredB = useMemo(() => 
    allConcepts.filter(c => c.term.toLowerCase().includes(searchB.toLowerCase())).slice(0, 5),
    [searchB, allConcepts]
  );

  const updateParam = (key: 'a' | 'b', value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-12 pb-20">
      <section className="text-center space-y-6 pt-12">
        <h1 className="text-page-title text-[var(--text)]">
          Concept <span className="text-[#0071E3]">Comparison</span>
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto font-medium">
          Side-by-side analysis of engineering terms to understand key differences and similarities.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-card border border-gray-100 rounded-full shadow-xl flex items-center justify-center z-10 hidden md:flex">
          <span className="text-xl font-black text-muted italic">VS</span>
        </div>

        {/* Column A */}
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-card border border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-[#0071E3]/10 focus:border-[#0071E3] outline-none transition-all"
              placeholder="Select first concept..."
              value={searchA}
              onChange={(e) => setSearchA(e.target.value)}
            />
            {searchA && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                {filteredA.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { updateParam('a', c.term); setSearchA(''); }}
                    className="w-full px-6 py-4 text-left hover:bg-card transition-colors flex items-center justify-between group"
                  >
                    <span className="font-bold text-gray-700">{c.term}</span>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-[var(--text)] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {conceptA ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-4xl font-bold text-[var(--text)]">{conceptA.term}</h2>
                <span className="px-3 py-1 bg-search text-muted text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {conceptA.domain}
                </span>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Definition</h4>
                <p className="text-muted leading-relaxed font-medium">{conceptA.definition_short}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Key Feature</h4>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-center gap-4">
                  <Layers className="w-5 h-5 text-[#0071E3]" />
                  <span className="text-sm font-bold text-[#0071E3]">{conceptA.difficulty} Level</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Examples</h4>
                <ul className="space-y-2">
                  {conceptA.examples.slice(0, 2).map((ex, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="h-96 bg-card rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-muted space-y-4">
              <BookOpen className="w-12 h-12" />
              <p className="font-medium">Select a concept to compare</p>
            </div>
          )}
        </div>

        {/* Column B */}
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-card border border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-[#0071E3]/10 focus:border-[#0071E3] outline-none transition-all"
              placeholder="Select second concept..."
              value={searchB}
              onChange={(e) => setSearchB(e.target.value)}
            />
            {searchB && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                {filteredB.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { updateParam('b', c.term); setSearchB(''); }}
                    className="w-full px-6 py-4 text-left hover:bg-card transition-colors flex items-center justify-between group"
                  >
                    <span className="font-bold text-gray-700">{c.term}</span>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-[var(--text)] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {conceptB ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-4xl font-bold text-[var(--text)]">{conceptB.term}</h2>
                <span className="px-3 py-1 bg-search text-muted text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {conceptB.domain}
                </span>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Definition</h4>
                <p className="text-muted leading-relaxed font-medium">{conceptB.definition_short}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Key Feature</h4>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex items-center gap-4">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-600">{conceptB.difficulty} Level</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Examples</h4>
                <ul className="space-y-2">
                  {conceptB.examples.slice(0, 2).map((ex, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="h-96 bg-card rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-muted space-y-4">
              <BookOpen className="w-12 h-12" />
              <p className="font-medium">Select a concept to compare</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table - "Extraordinary Layer" */}
      {conceptA && conceptB && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8 pt-12"
        >
          <div className="flex items-center gap-3 text-[var(--text)] font-bold uppercase tracking-wider text-sm">
            <Sparkles className="w-5 h-5 text-[#0071E3]" />
            <span>Deep Differentiation</span>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card/50">
                  <th className="px-8 py-6 text-xs font-bold text-muted uppercase tracking-widest">Feature</th>
                  <th className="px-8 py-6 text-lg font-bold text-[var(--text)]">{conceptA.term}</th>
                  <th className="px-8 py-6 text-lg font-bold text-[var(--text)]">{conceptB.term}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="px-8 py-6 text-sm font-bold text-muted uppercase tracking-widest">Domain</td>
                  <td className="px-8 py-6 text-gray-700 font-medium">{conceptA.domain}</td>
                  <td className="px-8 py-6 text-gray-700 font-medium">{conceptB.domain}</td>
                </tr>
                <tr>
                  <td className="px-8 py-6 text-sm font-bold text-muted uppercase tracking-widest">Difficulty</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                      conceptA.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}>{conceptA.difficulty}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                      conceptB.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}>{conceptB.difficulty}</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-8 py-6 text-sm font-bold text-muted uppercase tracking-widest">Prerequisites</td>
                  <td className="px-8 py-6 text-muted text-sm">{conceptA.prerequisites.join(', ') || 'None'}</td>
                  <td className="px-8 py-6 text-muted text-sm">{conceptB.prerequisites.join(', ') || 'None'}</td>
                </tr>
                <tr>
                  <td className="px-8 py-6 text-sm font-bold text-muted uppercase tracking-widest">Analogy</td>
                  <td className="px-8 py-6 text-muted text-sm italic">"{conceptA.analogy}"</td>
                  <td className="px-8 py-6 text-muted text-sm italic">"{conceptB.analogy}"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>
      )}
    </div>
  );
}
