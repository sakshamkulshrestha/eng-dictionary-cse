import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Bot, Bookmark, Map, Settings, Layers, Zap, ArrowRight, Volume2, GitBranch, Star, ExternalLink, MessageSquare } from 'lucide-react';
import AnimatedText from './primitives/AnimatedText';
import MagneticButton from './primitives/MagneticButton';

interface GuideViewProps {
  onClose: () => void;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
};

const doodle = {
  ai: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="14" r="9" strokeDasharray="2 3"/>
      <path d="M12 12.5c0-1 .8-2 2-2s2 1 2 2"/>
      <path d="M16 12.5c0-1 .8-2 2-2s2 1 2 2"/>
      <path d="M13 17c1.2 1.5 4.8 1.5 6 0"/>
      <path d="M8 6L6 3M24 6l2-3M16 5V2"/>
      <path d="M10 24l-2 5M22 24l2 5M16 23v6"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="14" cy="14" r="8"/>
      <path d="M20 20l8 8" strokeWidth="2.5"/>
      <path d="M11 11l6 0" strokeWidth="1.2" strokeDasharray="1 2"/>
      <path d="M11 14l4 0" strokeWidth="1.2" strokeDasharray="1 2"/>
      <circle cx="14" cy="14" r="3" strokeWidth="0.8" strokeDasharray="2 2"/>
    </svg>
  ),
  roadmap: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 28L16 4l10 24" strokeWidth="1.4"/>
      <path d="M10 20h12" strokeWidth="1"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <path d="M16 4v-1M16 3l-1-1M16 3l1-1" strokeWidth="1.2"/>
      <path d="M11 24c2-2 8-2 10 0" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4c0 0 4-1 10 1s10-1 10-1v22c0 0-4 1-10-1s-10 1-10 1z"/>
      <path d="M16 5v22"/>
      <path d="M10 10l4 0" strokeWidth="1" strokeDasharray="1 2"/>
      <path d="M10 14l3 0" strokeWidth="1" strokeDasharray="1 2"/>
      <path d="M19 10l4 0" strokeWidth="1" strokeDasharray="1 2"/>
      <path d="M19 14l3 0" strokeWidth="1" strokeDasharray="1 2"/>
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4L4 12l12 8 12-8z"/>
      <path d="M4 18l12 8 12-8" strokeDasharray="3 2"/>
      <path d="M4 24l12 8 12-8" strokeDasharray="2 3"/>
      <circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none" opacity="0.4"/>
    </svg>
  ),
  speaker: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12h4l6-6v20l-6-6H6z"/>
      <path d="M22 10c2 2 2 10 0 12" strokeDasharray="2 2"/>
      <path d="M26 7c3 4 3 14 0 18" strokeDasharray="3 2"/>
      <circle cx="10" cy="16" r="1" fill="currentColor" stroke="none" opacity="0.3"/>
    </svg>
  ),
  bookmark: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h16v25l-8-5-8 5z"/>
      <path d="M12 10l8 0" strokeWidth="1" strokeDasharray="2 2"/>
      <path d="M12 14l6 0" strokeWidth="1" strokeDasharray="2 2"/>
      <circle cx="22" cy="6" r="3" fill="currentColor" stroke="none" opacity="0.15"/>
      <path d="M20.5 6l1 1 2.5-2.5" strokeWidth="1.2"/>
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="4"/>
      <path d="M16 2v4M16 26v4M2 16h4M26 16h4"/>
      <path d="M5.8 5.8l2.8 2.8M23.4 23.4l2.8 2.8M5.8 26.2l2.8-2.8M23.4 8.6l2.8-2.8" strokeDasharray="2 1"/>
      <circle cx="16" cy="16" r="8" strokeWidth="0.8" strokeDasharray="3 3"/>
    </svg>
  ),
};

const features = [
  {
    icon: doodle.ai,
    title: "AI Assistant",
    subtitle: "Ask anything, get intelligent answers",
    description: "The Lexicon AI panel is a context-aware chatbot powered by NVIDIA's Nemotron model. It understands what concept you're currently viewing and gives answers tailored to that context. You can ask follow-up questions, request explanations, or explore tangential topics.",
    details: [
      "Click the AI icon (robot) in the top-right corner to open the panel.",
      "The 'Ask' tab lets you have a conversation — type a question and press Enter.",
      "Context is shown at the top: if you're on a concept page, AI knows the topic.",
      "AI responses include clickable links to related concepts in the dictionary.",
      "Conversation history is preserved during your session.",
    ],
    color: "var(--neo-purple)"
  },
  {
    icon: doodle.search,
    title: "Smart Search",
    subtitle: "Find anything, instantly",
    description: "The search bar at the top of every page gives you instant access to every concept in the dictionary. As you type, results appear in real-time with domain labels so you know exactly where each term belongs.",
    details: [
      "Results are ranked by relevance — the best match appears first.",
      "Press Enter to immediately navigate to the top result.",
      "Use Arrow Down to navigate through results with your keyboard.",
      "Each result shows the full domain name (e.g., 'Computer Networks') for quick context.",
      "A live counter shows how many matching concepts were found.",
    ],
    color: "var(--neo-green)"
  },
  {
    icon: doodle.roadmap,
    title: "Learning Roadmaps",
    subtitle: "AI-generated study paths",
    description: "The 'Pathways' tab in the AI panel lets you generate personalized learning roadmaps. Describe what you want to learn (e.g., 'I want to understand how the internet works'), and the AI creates a step-by-step sequence of concepts to study in order.",
    details: [
      "Switch to the 'Pathways' tab in the AI panel.",
      "Type your learning goal and press Enter or click the send button.",
      "Each step in the roadmap links to an actual concept in the dictionary.",
      "Click any step to jump directly to that concept page.",
      "Save roadmaps to your Library for later reference.",
    ],
    color: "var(--neo-orange)"
  },
  {
    icon: doodle.book,
    title: "Concept Deep Dive",
    subtitle: "Everything you need to know, in one place",
    description: "Every concept page is a complete knowledge unit. It starts with a large animated title, followed by a short definition, then expands into a detailed explanation with multiple supporting sections.",
    details: [
      "Short Definition — A one-line summary at the top for quick recall.",
      "Detailed Explanation — A comprehensive paragraph explaining how the concept works.",
      "Deep Logic — Additional technical depth for advanced understanding.",
      "Real-World Analogy — A relatable metaphor to make the concept click instantly.",
      "Code Example — Actual syntax or pseudocode you can copy and use.",
      "Comparisons — Side-by-side cards showing how this concept differs from related ones. Click to navigate.",
      "Common Misconceptions — A list of things people often get wrong about this topic.",
      "Related Terms — Clickable tags linking to connected concepts.",
    ],
    color: "var(--neo-green)"
  },
  {
    icon: doodle.layers,
    title: "Domain Explorer",
    subtitle: "Browse by subject area",
    description: "The homepage organizes all concepts into domain cards — Computer Networks, Operating Systems, Data Structures, Database Management Systems, and more. Each card shows the number of terms available in that domain.",
    details: [
      "Click any domain card to see all concepts within that subject.",
      "Inside a domain page, concepts are listed alphabetically for easy scanning.",
      "Click any concept to open its full detail page.",
      "Navigate back to the domain or home using the back button at the top.",
    ],
    color: "var(--neo-purple)"
  },
  {
    icon: doodle.bookmark,
    title: "Library & Bookmarks",
    subtitle: "Save concepts for later",
    description: "Your Library stores bookmarked concepts and saved roadmaps. Bookmark any concept by clicking the bookmark icon on its detail page. Access your Library from the 'Library' link in the top navigation bar.",
    details: [
      "Click the bookmark icon on any concept page to save it.",
      "Open Library from the navbar to see all saved concepts.",
      "Saved concepts are grouped by domain for easy browsing.",
      "Saved roadmaps appear in a separate section with their original query.",
      "Remove bookmarks by clicking the bookmark icon again.",
    ],
    color: "var(--neo-pink)"
  },
  {
    icon: doodle.speaker,
    title: "Audio Pronunciation",
    subtitle: "Hear definitions read aloud",
    description: "Each concept page has a speaker icon that reads the term and its short definition out loud using your browser's text-to-speech engine. You can also enable Auto-Speak in Settings to have every concept read automatically when you open it.",
    details: [
      "Click the speaker icon on any concept page to hear it.",
      "Enable Auto-Speak in Settings for hands-free learning.",
      "Works with your system's default voice and language.",
    ],
    color: "var(--neo-orange)"
  },
  {
    icon: doodle.gear,
    title: "Settings",
    subtitle: "Customize your experience",
    description: "The Settings page lets you personalize the Lexicon to your preferences. Access it from the gear icon in the top-right corner of the navbar.",
    details: [
      "Dark Mode — Toggle between dark and light themes. Both are carefully designed for comfort.",
      "Text Size — Choose between Standard and Large for reading density.",
      "Auto-Speak — When enabled, definitions are read aloud automatically when you open a concept.",
    ],
    color: "var(--neo-green)"
  },
];


const team = [
  { name: "Saksham Kulshrestha", role: "Product Architect", img: "/avatars/saksham.png" },
  { name: "Pranathi", role: "Data Engineer", img: "/avatars/pranathi.png" },
  { name: "Dravinesh", role: "Research Analyst", img: "/avatars/dravinesh.png" },
  { name: "Muni Sai", role: "Knowledge Mapper", img: "/avatars/munisai.png" },
];



export default function GuideView({ onClose }: GuideViewProps) {
  return (
    <div className="w-full h-full animate-fade-in">
      <div className="max-w-4xl w-full mx-auto p-10 sm:p-20 text-[var(--text)] pb-32">

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 sm:py-28 space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 text-[var(--neo-green)]"
          >
            <div className="w-8 h-[2px] bg-[var(--neo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Complete User Guide</span>
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
            className="text-lg sm:text-xl text-muted font-medium max-w-3xl leading-relaxed"
          >
            The Lexicon is a premium engineering knowledge base designed for Computer Science students.
            It combines curated definitions, AI-powered learning tools, and a cinematic interface to make
            studying complex topics feel effortless. Below is a complete guide to every feature.
          </motion.p>
        </motion.header>

        {/* What is The Lexicon */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16 neo-card p-10 sm:p-12 border-2 !border-[var(--neo-green)]/30 bg-[var(--neo-green)]/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-4 h-4 text-[var(--neo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--neo-green)]">About This Project</span>
          </div>
          <p className="text-[15px] leading-[1.8] text-[var(--text)] font-medium">
            The Lexicon is an interactive dictionary covering core Computer Science subjects including
            <strong> Computer Networks</strong>, <strong>Operating Systems</strong>, <strong>Data Structures</strong>,
            <strong> Database Management Systems</strong>, and more. Each concept includes definitions,
            detailed explanations, real-world analogies, code examples, comparisons, and common misconceptions — all
            presented through a motion-driven, premium interface with dark and light mode support.
          </p>
        </motion.section>

        {/* Feature Sections */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.h2 variants={fadeUp} className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-1 mb-2">
            Features & How to Use Them
          </motion.h2>

          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="neo-card p-0 overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 sm:p-10 border-b border-[var(--border)]">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center" style={{ background: feature.color }}>
                    <div className="text-[var(--pop-black)]">{feature.icon}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">0{i + 1}</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{feature.title}</h3>
                    </div>
                    <p className="text-[12px] font-bold text-muted uppercase tracking-widest">{feature.subtitle}</p>
                  </div>
                </div>
              </div>
              {/* Body */}
              <div className="p-8 sm:p-10 space-y-6">
                <p className="text-[15px] text-[var(--text)] leading-[1.8] font-medium">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 mt-2 shrink-0" style={{ background: feature.color }} />
                      <span className="text-[13px] text-muted leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feedback Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-20 neo-card p-10 sm:p-12 border-2 !border-[var(--neo-purple)]/30 text-center"
        >
          <MessageSquare className="w-8 h-8 mx-auto mb-4 text-[var(--neo-purple)]" />
          <h3 className="text-2xl font-bold uppercase tracking-tight mb-3">Have Suggestions?</h3>
          <p className="text-[14px] text-muted leading-relaxed mb-8 max-w-lg mx-auto">
            We'd love to hear your feedback! If you have ideas for new features, found a bug, or want to suggest improvements, please fill out our feedback form.
          </p>
          <a
            href="https://forms.gle/3c5qujrJ2zmpSCBy6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--text)] text-[var(--bg)] font-bold uppercase tracking-widest text-[12px] hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            Open Feedback Form
          </a>
        </motion.section>

        {/* Team Credits — Cinematic */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="py-24 mt-20 border-t-2 border-[var(--text)]"
        >
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
              className="h-[2px] bg-[var(--neo-green)] mx-auto"
            />
            <AnimatedText
              text="The Team"
              el="h2"
              className="text-[10vw] sm:text-[6vw] font-black leading-[0.9] tracking-tighter uppercase"
              animationType="words"
              delayOffset={0.1}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-sm font-bold text-muted uppercase tracking-[0.2em]"
            >
              IMTech Students · University of Hyderabad
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="neo-card p-10 flex items-center gap-6 group cursor-default"
              >
                <div className="w-16 h-16 shrink-0 overflow-hidden bg-[var(--hover)]">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight">{member.name}</span>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-widest mt-1">{member.role}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center space-y-3"
          >
            <div className="w-8 h-[2px] bg-[var(--border)] mx-auto" />
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted opacity-50">
              The Lexicon · Computer Science Engineering · 2026
            </p>
          </motion.div>
        </motion.footer>
      </div>
    </div>
  );
}
