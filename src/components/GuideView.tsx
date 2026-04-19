import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Layers, Bot, Bookmark, Settings, Volume2, ChevronLeft, Sparkles, Compass, Map, ArrowRight, Keyboard, Zap } from 'lucide-react';

interface GuideViewProps {
  onClose?: () => void;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
};

function FeatureCard({ icon, iconBg, title, description, tips }: { icon: React.ReactNode; iconBg: string; title: string; description: string; tips?: string[] }) {
  return (
    <motion.div variants={fadeUp} className="p-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl space-y-4 hover:border-[var(--text)]/20 transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
      {tips && tips.length > 0 && (
        <div className="pt-3 border-t border-[var(--border)] space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px] text-[var(--text)] opacity-80">
              <span className="shrink-0 w-1 h-1 rounded-full bg-[var(--neo-green)] mt-2" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-5 items-start">
      <div className="w-10 h-10 rounded-xl bg-[var(--text)] text-[var(--bg)] flex items-center justify-center text-sm font-black shrink-0 mt-1">
        {step}
      </div>
      <div>
        <h4 className="text-sm font-bold mb-1">{title}</h4>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default function GuideView({ onClose }: GuideViewProps) {
  const team = [
    { name: "Saksham Kulshrestha", role: "Full Stack Developer", avatar: "/avatars/saksham.png" },
    { name: "Gotta Pranathi Yadav", role: "Database Engineer", avatar: "/avatars/pranathi.png" },
    { name: "Molagara Dravinesh", role: "QA Tester", avatar: "/avatars/dravinesh.png" },
    { name: "Kuntumalla Muni Sai Charan", role: "Field Coordinator", avatar: "/avatars/munisai.png" }
  ];

  return (
    <div className="w-full h-full animate-fade-in">
      <div className="max-w-3xl w-full mx-auto p-8 sm:p-16 text-[var(--text)] pb-32">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Header */}
          <motion.header variants={fadeUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Lexicon Guide</h1>
            <p className="text-muted text-sm font-medium max-w-lg mx-auto">
              A student-led research project developed and managed by IMTech students, University of Hyderabad.
            </p>
          </motion.header>

          {/* Credits */}
          <motion.section variants={fadeUp} className="space-y-6">
            <div className="flex items-center gap-3 justify-center mb-8">
              <div className="w-8 h-[2px] bg-[var(--neo-purple)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Developed By</span>
              <div className="w-8 h-[2px] bg-[var(--neo-purple)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {team.map(m => (
                <div key={m.name} className="flex items-center p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl transition-all hover:border-[var(--text)]/20 shadow-sm">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-[var(--border)] bg-[var(--hover)] shrink-0">
                    <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center'); e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user text-[var(--muted)]"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-tight">{m.name}</div>
                    <div className="text-[11px] text-muted uppercase font-bold tracking-widest mt-1">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Quick Start Steps */}
          <motion.section variants={fadeUp} className="space-y-6 mt-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-[var(--neo-green)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Quick Start</span>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-6">
              <StepCard step={1} title="Browse Domains" description="Start on the home page and pick a domain like Artificial Intelligence or Operating Systems to explore." />
              <StepCard step={2} title="Read a Concept" description="Click any concept card to see its full explanation, analogies, comparisons, and related terms." />
              <StepCard step={3} title="Search Anything" description="Press / or click the search bar to instantly find any concept across all domains." />
              <StepCard step={4} title="Ask the AI" description="Click the bot icon to open the AI assistant. Ask follow-up questions or generate a learning roadmap." />
              <StepCard step={5} title="Bookmark & Track" description="Save important concepts to your Library for easy access later." />
            </div>
          </motion.section>

          {/* Feature Cards Grid */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-[var(--neo-purple)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Features</span>
            </div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <FeatureCard
                icon={<Search className="w-5 h-5 text-white" />}
                iconBg="bg-[var(--neo-purple)]"
                title="Smart Search"
                description="Fuzzy search across all concepts with instant results."
                tips={['Press / to focus search from anywhere', 'Results show domain and definition preview', 'Click X to clear and close']}
              />
              <FeatureCard
                icon={<BookOpen className="w-5 h-5 text-[var(--pop-black)]" />}
                iconBg="bg-[var(--neo-green)]"
                title="Concept Cards"
                description="Each concept includes explanation, analogies, code examples, and comparisons."
                tips={['Click the domain badge to go back to that domain', 'Use Read Aloud for audio definitions', 'Related terms are clickable']}
              />
              <FeatureCard
                icon={<Bot className="w-5 h-5 text-white" />}
                iconBg="bg-[var(--neo-orange)]"
                title="AI Assistant"
                description="Get explanations, ask follow-up questions, and generate personalized learning roadmaps."
                tips={['Ask mode: conversational Q&A', 'Roadmap mode: generate a step-by-step learning path', 'Save roadmaps to your Library']}
              />
              <FeatureCard
                icon={<Bookmark className="w-5 h-5 text-white" />}
                iconBg="bg-[var(--neo-pink)]"
                title="Library"
                description="Your personal collection of bookmarked concepts and saved roadmaps."
                tips={['Click the bookmark icon on any concept to save it', 'Access your Library from the nav bar', 'Roadmaps are saved from the AI panel']}
              />
              <FeatureCard
                icon={<Layers className="w-5 h-5 text-[var(--pop-black)]" />}
                iconBg="bg-[var(--neo-gold)]"
                title="Domain Browsing"
                description="Explore concepts organized by domain. Use the in-domain filter to narrow results."
                tips={['Each domain page has its own filter input', 'Concepts are sorted alphabetically']}
              />
              <FeatureCard
                icon={<Settings className="w-5 h-5 text-[var(--text)]" />}
                iconBg="bg-[var(--hover)]"
                title="Customization"
                description="Dark/light mode, text size, accent colors, and more."
                tips={['All settings are saved automatically', 'Export your data anytime from Settings']}
              />
            </motion.div>
          </section>

          {/* Keyboard Shortcuts */}
          <motion.section variants={fadeUp} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-[var(--neo-gold)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Keyboard Shortcuts</span>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-3">
              {[
                { keys: '/', desc: 'Open search' },
                { keys: '⌘ K', desc: 'Open search (alternative)' },
                { keys: 'Esc', desc: 'Close search / AI panel' },
              ].map(shortcut => (
                <div key={shortcut.keys} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted font-medium">{shortcut.desc}</span>
                  <kbd className="px-4 py-2 bg-[var(--hover)] border border-[var(--border)] rounded-lg text-[12px] font-mono font-bold">{shortcut.keys}</kbd>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Support & Suggestions */}
          <motion.section variants={fadeUp} className="mt-24 p-10 bg-[var(--text)] rounded-3xl text-center text-[var(--bg)]">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">Have a suggestion?</h2>
            <p className="text-[var(--bg)]/70 mb-8 max-w-md mx-auto text-sm">Help us improve the dictionary. Suggest new terms or report errors via our Google Form.</p>
            <a href="https://forms.gle/yFKUyDdgt8FL4y2M6" target="_blank" className="inline-block bg-[var(--bg)] text-[var(--text)] px-8 py-3 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg">Support & Suggestions</a>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
