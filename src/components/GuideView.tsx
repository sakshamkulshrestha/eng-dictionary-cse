import React from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Star, Zap, Shield, Target } from 'lucide-react';
import MagneticButton from './primitives/MagneticButton';

interface GuideViewProps {
  onClose: () => void;
}

export default function GuideView({ onClose }: GuideViewProps) {
  return (
    <div className="w-full h-full animate-fade-in perspective-1000 p-6 sm:p-20">
      <div className="max-w-6xl mx-auto relative">

        <header className="py-32 space-y-12">
          <div className="flex items-center gap-4 text-[var(--neo-green)]">
            <div className="w-12 h-1 px-4 bg-[var(--neo-green)]" />
            <span className="text-xs font-bold uppercase tracking-[0.5em]">The Manifesto</span>
          </div>
          <h1 className="text-[12vw] sm:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase font-serif">
            Abstraction<br />Is Reality.
          </h1>
          <p className="text-2xl sm:text-4xl font-medium max-w-4xl leading-tight text-[var(--muted)]">
            The Lexicon is not a dictionary. It is a protocol for mastering the complex architectures of our digital foundation.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-32 border-t border-[var(--border)]">
          <div className="space-y-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter font-serif text-[var(--neo-purple)]">The Mission</h2>
            <p className="text-xl leading-relaxed text-[var(--muted)]">
              We eliminate the friction of learning by providing a brutally efficient interface into computer science. No metaphors. No fluff. Only the high-status knowledge required to dominate the domain.
            </p>
            <ul className="space-y-8">
              {[
                { icon: <Zap className="w-6 h-6" />, text: "Instant conceptual clarity via pseudo-morphic architecture." },
                { icon: <Shield className="w-6 h-6" />, text: "Verified patterns for production-grade engineering." },
                { icon: <Target className="w-6 h-6" />, text: "Strategic roadmaps for accelerated mastery." }
              ].map((item, i) => (
                <li key={i} className="flex gap-6 items-center group">
                  <div className="w-12 h-12 flex items-center justify-center border border-[var(--border)] group-hover:bg-[var(--pop-white)] group-hover:text-[var(--pop-black)] transition-all">
                    {item.icon}
                  </div>
                  <span className="text-lg font-bold uppercase tracking-tight">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="neo-card p-12 flex flex-col justify-between border-2 !border-[var(--neo-green)]">
            <div className="space-y-6">
              <Star className="w-12 h-12 text-[var(--neo-green)] fill-[var(--neo-green)]" />
              <h3 className="text-3xl font-black uppercase tracking-tighter font-serif">Insider Access</h3>
              <p className="text-lg text-[var(--muted)]">
                The Lexicon is an exclusive system built for those who understand that in engineering, details are not just details. They are the product.
              </p>
            </div>
            <div className="pt-12">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--neo-green)] mb-2">System Version</div>
              <div className="text-5xl font-black tracking-tighter">2.0.0-PRO</div>
            </div>
          </div>
        </div>

        <footer className="py-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-12 border-t border-[var(--border)]">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-[0.5em] text-[var(--muted)]">Engineered By</div>
            <div className="flex flex-wrap gap-4">
              {["Saksham", "Pranathi", "Dravinesh", "Muni Sai"].map(name => (
                <span key={name} className="px-4 py-2 border border-[var(--border)] text-sm font-bold uppercase">{name}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[var(--muted)] opacity-50">
              THE LEXICON PROTOCOL · EST. MMXXVI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
