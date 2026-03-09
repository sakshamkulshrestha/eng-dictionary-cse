import React from 'react';
import { ChevronRight, ArrowUpRight, Info, BookOpen, AlertCircle, Code, Layers } from 'lucide-react';

export default function EntryDetail({ entry, dictionaryData, onNavigate }) {
  if (!entry) return <div className="text-center py-20 text-gray-500">Term not found.</div>;

  const findTermId = (termName) => {
    const found = dictionaryData.find(d => d.term.toLowerCase() === termName.toLowerCase());
    return found ? found.id : null;
  };

  const renderText = (text) => text?.split('\n').map((line, i) => (
    <React.Fragment key={i}>{line}<br/></React.Fragment>
  ));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Navigation Breadcrumbs */}
      <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-10 tracking-widest uppercase font-semibold">
        <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Home</span>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('index', null, entry.domain)}>
          {entry.domain}
        </span>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-black dark:text-white">{entry.term}</span>
      </nav>

      {/* Header Area (Points 1: Simple Definition) */}
      <div className="mb-12 border-b border-gray-200 dark:border-[#27272A] pb-10">
        <button 
          onClick={() => onNavigate('index', null, entry.domain)}
          className="px-3 py-1 mb-6 rounded-sm text-xs font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
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
        <div className="md:col-span-2 space-y-12">
          
          {/* Point 2: Explanation */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Explanation</h2>
            </div>
            <p className="text-lg text-black dark:text-gray-200 leading-relaxed font-serif bg-gray-50 dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-100 dark:border-[#1A1A1A]">
              {renderText(entry.explanation)}
            </p>
          </section>

          {/* Point 3: Technical Definition */}
          {entry.technical_definition && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Technical Definition</h2>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-400 italic leading-relaxed pl-4 border-l-2 border-gray-300 dark:border-gray-700">
                {entry.technical_definition}
              </p>
            </section>
          )}

          {/* Point 4: Syntax / Example */}
          {entry.syntax_or_example && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Code className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Syntax / Example</h2>
              </div>
              <pre className="p-5 bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-md overflow-x-auto text-sm text-black dark:text-gray-300 font-mono">
                <code>{entry.syntax_or_example}</code>
              </pre>
            </section>
          )}

          {/* Point 8: Image (Optional) */}
          {entry.images && (
            <section>
               <div className="mt-8 p-4 bg-gray-50 dark:bg-[#0A0A0A] border border-dashed border-gray-300 dark:border-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-400 italic text-sm text-center">
                  <div className="mb-2">Visual representation:</div>
                  {/* Note: This is where you'd render an actual <img> tag if you have URLs */}
                  <div className="font-sans text-gray-500">{entry.images}</div>
               </div>
            </section>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="md:col-span-1 space-y-12">
          
          {/* Point 5: Comparisons */}
          {entry.comparisons?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Comparisons</h2>
              </div>
              <div className="space-y-4">
                {entry.comparisons.map((comp, index) => {
                  const targetId = findTermId(comp.target);
                  return (
                    <div key={index} className="p-4 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span 
                          onClick={() => targetId && onNavigate('entry', targetId)}
                          className={`font-bold text-sm ${targetId ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-cyan-400 flex items-center gap-1' : 'text-black dark:text-white'}`}
                        >
                          vs. {comp.target} {targetId && <ArrowUpRight className="w-3 h-3" />}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed">{comp.note}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Point 7: Misconceptions */}
          {entry.common_misconceptions?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Student Mistakes</h2>
              </div>
              <ul className="space-y-3">
                {entry.common_misconceptions.map((misc, index) => (
                  <li key={index} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-100 dark:border-red-900/30">
                    {misc}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Point 6: Related Words */}
          {entry.related_words?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Related Words</h2>
              <div className="flex flex-wrap gap-2">
                {entry.related_words.map((term, index) => {
                  const termId = findTermId(term);
                  return (
                    <span 
                      key={index} 
                      onClick={() => termId && onNavigate('entry', termId)}
                      className={`text-xs py-1.5 px-3 border border-gray-200 dark:border-gray-800 rounded-full flex items-center gap-1 transition-all
                        ${termId ? 'cursor-pointer hover:border-black dark:hover:border-white' : 'opacity-40'}`}
                    >
                      {term}
                      {termId && <ArrowUpRight className="w-2 h-2" />}
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