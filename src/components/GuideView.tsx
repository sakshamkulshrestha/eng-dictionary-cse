import React from 'react';
import { motion } from 'framer-motion';
import {
  X, BookOpen, Search, Bookmark, Map,
  MessageSquare, Network, Cpu, Zap,
  Moon, Sun, Hash, Users
} from 'lucide-react';

interface GuideViewProps {
  onClose: () => void;
}

const developers = [
  "Saksham Kulshrestha",
  "Gotta Pranathi Yadav",
  "Molagara Dravinesh",
  "Kuntumala Muni Sai Charan"
];

const features = [
  { icon: <Search className="w-5 h-5" />, title: 'Intelligent Search', desc: 'Find any CS concept instantly. Supports fuzzy matching, connects related terms together, and outlines prerequisite setups so you know where to begin.' },
  { icon: <Hash className="w-5 h-5" />, title: 'Curated Domains', desc: 'Browse structured pillars like AI, Cloud Computing, DBMS, Networks, OS, and Cybersecurity in dedicated overview grids.' },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Concept Deep Dives', desc: 'Every term offers simple real-world analogies, code example frames, detailed logic runs, and comparisons to avoid common traps.' },
  { icon: <Map className="w-5 h-5" />, title: 'AI Roadmap Maker', desc: 'Type what you want to learn (e.g., "Learn AI") and our backend binds ideas into a step-by-step visual path using index terms.' },
  { icon: <MessageSquare className="w-5 h-5" />, title: 'Contextual AI Assist', desc: 'Stuck on a structure? The bot fires side conversations mapped tightly to whatever you are currently scrolling.' },
  { icon: <Bookmark className="w-5 h-5" />, title: 'Save & Revisit', desc: 'Bookmark items to collect star sets. Revisit them safely anytime on your dashboards or bottom tabs buffers.' },
];

export default function GuideView({ onClose }: GuideViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full bg-bg text-[var(--text)] flex flex-col"
    >
      {/* Scrollable Main */}
      <div className="w-full overflow-y-auto custom-scrollbar flex-1">
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
          {/* Hero */}
          <section className="text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center bg-[var(--text)]/10 border border-[var(--text)]/20 shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(255,255,255,0.05)]">
              <BookOpen className="w-10 h-10 text-[var(--text)]" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tighter mb-4 text-[var(--text)]">The Lexicon</h1>
              <p className="text-lg max-w-2xl mx-auto leading-relaxed text-[#8E8E93]">
                A structured CS &amp; engineering knowledge dictionary. Every concept explained clearly — with definitions, analogies, code, and connections to related ideas.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>What You Can Do</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-4 p-5 rounded-3xl bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)]"
                >
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-[var(--hover)] dark:bg-[var(--active)] text-[var(--text)]">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold mb-1 text-[var(--text)]">{f.title}</div>
                    <div className="text-xs leading-relaxed text-[#8E8E93]">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How to use */}
          <section className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Getting Started</h2>
            <div className="space-y-4">
              {[
                { step: '01', text: 'Use the search bar at the top to find any CS concept instantly.' },
                { step: '02', text: 'Browse by domain — click any card on the home page to explore that subject area.' },
                { step: '03', text: 'Open any concept to read its full definition, analogy, and code example.' },
                { step: '04', text: 'Click the bookmark icon to save concepts you want to revisit later.' },
                { step: '05', text: 'Open the AI panel (robot icon) to chat, generate a learning roadmap, or view saved items.' },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-4 items-start p-4 rounded-2xl bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)]">
                  <span className="text-xs font-bold shrink-0 text-[var(--text)]">{step}</span>
                  <span className="text-sm text-[var(--text)]">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>The Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {developers.map((dev, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-[var(--hover)] dark:bg-[var(--active)] text-[var(--text)]">
                    {dev.split(' ').map(w => w[0]).join('')}
                  </div>
                  <span className="text-sm font-medium text-[var(--text)]">{dev}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Feedback / Google Form CTA */}
          <section className="p-8 rounded-3xl space-y-5 text-center bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)]">
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-[var(--hover)] dark:bg-[var(--active)] text-[var(--text)]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-[var(--text)]">Suggest a Concept</h3>
              <p className="text-sm text-[#8E8E93]">
                Know a concept that deserves a spot in The Lexicon? Submit it using our Google Form.
              </p>
            </div>
            <a
              href="https://forms.gle/yFKUyDdgt8FL4y2M6?_imcp=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all bg-[var(--text)] text-white hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
            >
              Open Feedback Form
            </a>
          </section>

          {/* Footer */}
          <footer className="text-center space-y-2 pb-8">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#8E8E93] opacity-50">THE LEXICON · MMXXVI</p>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}
