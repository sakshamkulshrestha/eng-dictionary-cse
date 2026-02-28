import React from 'react';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

export default function EntryDetail({ entry, dictionaryData, onNavigate }) {
  if (!entry) return <div className="text-center py-20 text-gray-500">Term not found.</div>;

  // Helper function to find the ID of a term by its name for cross-linking
  const findTermId = (termName) => {
    const found = dictionaryData.find(d => d.term.toLowerCase() === termName.toLowerCase());
    return found ? found.id : null;
  };

  // Helper to render text with line breaks
  const renderText = (text) => text.split('\n').map((line, i) => (
    <React.Fragment key={i}>{line}<br/></React.Fragment>
  ));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* 1. Updated Breadcrumbs: Home > Domain > Term */}
      <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-10 tracking-widest uppercase font-semibold">
        <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Home</span>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('index', null, entry.domain)}>
          {entry.domain}
        </span>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-black dark:text-white">{entry.term}</span>
      </nav>

      {/* Header with clickable Domain Tag */}
      <div className="mb-12 border-b border-gray-200 dark:border-[#27272A] pb-10">
        <button 
          onClick={() => onNavigate('index', null, entry.domain)}
          className="px-3 py-1 mb-6 rounded-sm text-xs font-bold uppercase tracking-widest amoled-border hover:bg-gray-100 dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          {entry.domain}
        </button>
        <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white mb-6 tracking-tight">
          {entry.term}
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400 font-light leading-snug">
          {entry.definition_short}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Explanation */}
        <div className="md:col-span-2 space-y-12">
          
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Explanation</h2>
            <p className="text-lg text-black dark:text-gray-200 leading-relaxed font-serif">
              {renderText(entry.explanation)}
            </p>
          </section>

          {/* Optional Syntax/Code Block from JSON */}
          {entry.syntax_or_example && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Example / Syntax</h2>
              <pre className="p-4 bg-gray-50 dark:bg-[#0A0A0A] amoled-border rounded-md overflow-x-auto text-sm text-black dark:text-gray-300 font-mono">
                <code>{entry.syntax_or_example}</code>
              </pre>
            </section>
          )}

          {/* Comparisons with Cross-linking */}
          {entry.comparisons?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Comparisons</h2>
              <div className="space-y-4">
                {entry.comparisons.map((comp, index) => {
                  const targetId = findTermId(comp.target);
                  return (
                    <div key={index} className="p-5 amoled-card rounded-md">
                      <div className="flex items-center mb-2">
                        <span 
                          onClick={() => targetId && onNavigate('entry', targetId)}
                          className={`font-bold text-lg ${targetId ? 'cursor-pointer hover:underline flex items-center gap-1' : 'text-black dark:text-white'}`}
                        >
                          vs. {comp.target} {targetId && <ArrowUpRight className="w-4 h-4 text-gray-400" />}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed">{comp.note}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Misconceptions & Related Terms */}
        <div className="md:col-span-1 space-y-12">
          
          {entry.misconceptions?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Common Misconceptions</h2>
              <ul className="space-y-4">
                {entry.misconceptions.map((misc, index) => (
                  <li key={index} className="text-sm text-black dark:text-gray-300 border-l-2 border-black dark:border-white pl-4 py-1">
                    {misc}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Terms with Cross-linking */}
          {entry.related_terms?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Related Terms</h2>
              <div className="flex flex-col gap-2">
                {entry.related_terms.map((term, index) => {
                  const termId = findTermId(term);
                  return (
                    <span 
                      key={index} 
                      onClick={() => termId && onNavigate('entry', termId)}
                      className={`text-sm py-2 px-3 amoled-border rounded-sm flex items-center justify-between transition-colors
                        ${termId ? 'cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black' : 'opacity-50'}`}
                    >
                      {term}
                      {termId && <ArrowUpRight className="w-3 h-3" />}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}