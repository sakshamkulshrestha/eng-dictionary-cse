import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Bot, Bookmark, Map, Settings, Layers, Zap, ArrowRight } from 'lucide-react';
import AnimatedText from './primitives/AnimatedText';

interface GuideViewProps {
  onClose: () => void;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
};

const features = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Search",
    description: "Find any concept instantly. Type in the search bar at the top to filter through all engineering terms. Results appear in real-time with domain labels.",
    tip: "Press Enter to jump to the first result, or use arrow keys to navigate."
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Explore Domains",
    description: "Browse concepts organized by domain — Computer Networks, Operating Systems, Data Structures, and more. Each domain card shows the total number of terms available.",
    tip: "Click any domain card on the homepage to dive into its concepts."
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Concept Details",
    description: "Each concept page includes a full definition, detailed explanation, real-world analogy, code examples, comparisons with related terms, and common misconceptions.",
    tip: "Click on related terms or comparison cards to navigate between concepts."
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Assistant",
    description: "Ask Lexicon AI any question about the concepts. It provides context-aware answers based on the concept you're currently viewing. You can also generate learning roadmaps.",
    tip: "Click the AI icon in the top-right corner to open the assistant panel."
  },
  {
    icon: <Bookmark className="w-6 h-6" />,
    title: "Library",
    description: "Save any concept to your library for quick access later. Your saved words are organized by domain, and saved roadmaps are listed by date.",
    tip: "Click the bookmark icon on any concept page to save it."
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Learning Roadmaps",
    description: "Generate personalized learning paths using AI. Tell the system what you want to learn, and it creates a step-by-step roadmap linking real concepts from the dictionary.",
    tip: "Open the AI panel, switch to 'Pathways' tab, and describe your learning goal."
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: "Settings",
    description: "Toggle between dark and light mode, adjust text size for comfortable reading, and enable auto-speak to hear definitions read aloud.",
    tip: "Access settings from the gear icon in the top-right corner."
  }
];

export default function GuideView({ onClose }: GuideViewProps) {
  return (
    <div className="w-full h-full animate-fade-in">
      <div className="max-w-4xl w-full mx-auto p-10 sm:p-20 text-[var(--text)] pb-32">

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 sm:py-32 space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 text-[var(--neo-green)]"
          >
            <div className="w-8 h-[2px] bg-[var(--neo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">User Guide</span>
          </motion.div>

          <AnimatedText
            text="How to use The Lexicon"
            el="h1"
            className="text-[10vw] sm:text-[6vw] font-black leading-[0.9] tracking-tighter uppercase"
            animationType="words"
            delayOffset={0.2}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-xl sm:text-2xl text-muted font-medium max-w-3xl leading-relaxed"
          >
            The Lexicon is an engineering knowledge base designed for clarity and speed. Here's everything you need to know to get the most out of it.
          </motion.p>
        </motion.header>

        {/* Feature Sections */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="neo-card p-0 overflow-hidden group"
            >
              <div className="flex flex-col sm:flex-row gap-6 p-8 sm:p-10">
                <div className="flex items-start gap-6 flex-1">
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-[var(--text)] text-[var(--bg)] transition-colors group-hover:bg-[var(--neo-green)] group-hover:text-[var(--pop-black)]">
                    {feature.icon}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">0{i + 1}</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{feature.title}</h3>
                    </div>
                    <p className="text-[15px] text-muted leading-relaxed">{feature.description}</p>
                    <div className="flex items-start gap-2 pt-2">
                      <Zap className="w-3.5 h-3.5 text-[var(--neo-green)] mt-0.5 shrink-0" />
                      <span className="text-[12px] font-bold text-[var(--neo-green)]">{feature.tip}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Credits */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="py-20 mt-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 border-t border-[var(--border)]"
        >
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Built By</div>
            <div className="flex flex-wrap gap-3">
              {["Saksham", "Pranathi", "Dravinesh", "Muni Sai"].map(name => (
                <span key={name} className="px-5 py-2.5 border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide hover:border-[var(--text)] transition-colors">{name}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted opacity-50">
              The Lexicon · 2026
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
