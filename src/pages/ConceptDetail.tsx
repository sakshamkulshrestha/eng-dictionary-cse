import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Lightbulb, 
  ListChecks, 
  Link as LinkIcon, 
  GitBranch, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getConceptById } from '../utils/searchEngine';
import { generateLearningPath, getRelatedRecommendations } from '../utils/recommendationEngine';
import { Concept } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ConceptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const concept = getConceptById(id || '');

  if (!concept) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--text)]">Concept not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-[#0071E3] font-medium">
          Go back home
        </button>
      </div>
    );
  }

  const learningPath = generateLearningPath(concept.term);
  const recommendations = getRelatedRecommendations(concept.id);

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-search rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-muted" />
        </button>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-search text-muted text-[10px] font-bold uppercase tracking-widest rounded-full">
            {concept.domain}
          </span>
          <span className={cn(
            "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
            concept.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-700" :
            concept.difficulty === "Intermediate" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
          )}>
            {concept.difficulty}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h1 className="text-page-title text-[var(--text)]">
              {concept.term}
            </h1>
            <p className="text-body-primary text-[var(--muted)]">
              {concept.definition_short}
            </p>
            <div className="prose prose-lg text-muted max-w-none">
              <p>{concept.definition_detailed}</p>
            </div>
          </section>

          {/* Analogy Section - "Important for judges" */}
          <section className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100/50 space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-wider text-sm">
              <Lightbulb className="w-5 h-5" />
              <span>The Analogy</span>
            </div>
            <p className="text-xl text-amber-900 font-medium italic leading-relaxed">
              "{concept.analogy}"
            </p>
          </section>

          {/* Examples */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[var(--text)] font-bold uppercase tracking-wider text-sm">
              <ListChecks className="w-5 h-5" />
              <span>Real-World Examples</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {concept.examples.map((example, i) => (
                <div key={i} className="p-6 bg-card border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <p className="text-gray-700 font-medium">{example}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Terms */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[var(--text)] font-bold uppercase tracking-wider text-sm">
              <LinkIcon className="w-5 h-5" />
              <span>Related Concepts</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {concept.related_terms.map(term => (
                <Link 
                  key={term}
                  to={`/compare?a=${concept.term}&b=${term}`}
                  className="px-6 py-3 bg-card border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:border-[#0071E3] hover:text-[#0071E3] transition-all flex items-center gap-2 group"
                >
                  {term}
                  <Sparkles className="w-4 h-4 text-muted group-hover:text-[#0071E3]" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - Learning Path & Recommendations */}
        <div className="space-y-12">
          {/* Learning Path */}
          <section className="bg-card p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-[var(--text)] font-bold uppercase tracking-wider text-sm">
              <GitBranch className="w-5 h-5" />
              <span>Learning Path</span>
            </div>
            
            <div className="relative space-y-8">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-search" />
              
              {learningPath.map((step, i) => (
                <div key={step.id} className="relative flex gap-6 items-start group">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 transition-colors",
                    step.id === concept.id ? "bg-[#0071E3]" : "bg-gray-200 group-hover:bg-gray-300"
                  )} />
                  <div className="space-y-1">
                    <Link 
                      to={`/concept/${step.id}`}
                      className={cn(
                        "text-sm font-bold transition-colors",
                        step.id === concept.id ? "text-[#0071E3]" : "text-muted hover:text-[var(--text)]"
                      )}
                    >
                      {step.term}
                    </Link>
                    <p className="text-xs text-muted line-clamp-2">
                      {step.definition_short}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Image Query Placeholder */}
          <section className="aspect-square bg-search rounded-[2rem] overflow-hidden relative group cursor-pointer">
            <img 
              src={`https://picsum.photos/seed/${concept.id}/800/800`} 
              alt={concept.term}
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-8 flex flex-col justify-end">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Visual Reference</p>
              <h4 className="text-white font-bold text-lg">{concept.image_query}</h4>
              <ExternalLink className="absolute top-6 right-6 w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
            </div>
          </section>

          {/* Recommendations */}
          <section className="space-y-6">
            <h4 className="text-sm font-bold text-muted uppercase tracking-widest">You might also like</h4>
            <div className="space-y-4">
              {recommendations.map(rec => (
                <Link 
                  key={rec.id}
                  to={`/concept/${rec.id}`}
                  className="flex items-center justify-between p-4 bg-card border border-gray-50 rounded-2xl hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-muted font-bold text-xs group-hover:bg-[#0071E3]/5 group-hover:text-[#0071E3] transition-colors">
                      {rec.term[0]}
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-[var(--text)]">{rec.term}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-[var(--text)] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
