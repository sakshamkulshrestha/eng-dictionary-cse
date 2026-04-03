import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, AlertCircle, ArrowRight, ShieldCheck, Database, Zap, BookOpen } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Authorization cancelled by user.');
      } else {
        setError(err.message || 'An unexpected error occurred during authentication.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const features = [
    { icon: <Database className="w-4 h-4" />, title: "Archive Access", desc: "Full entry to the engineering lexicon" },
    { icon: <Zap className="w-4 h-4" />, title: "AI Roadmaps", desc: "GenAI powered learning paths" },
    { icon: <BookOpen className="w-4 h-4" />, title: "Curated Content", desc: "Expert filtered domain knowledge" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-card/80 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-card border border-[var(--border)] shadow-2xl rounded-[2.5rem] p-10 z-[101] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--neo-green)] to-transparent opacity-30" />
        
        <div className="space-y-10">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--neo-green)]/10 border border-[var(--neo-green)]/20 text-[var(--neo-green)]">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Security Protocol</span>
              </div>
              <h2 className="text-3xl font-black text-[var(--text)] tracking-tighter uppercase leading-none">
                Initialize<br/>Access
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--hover)] rounded-full transition-all text-muted hover:scale-110">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted font-medium leading-relaxed">
              Authenticate via Google Identity to access the professional engineering archive and AI synthesis tools.
            </p>
            
            <div className="grid gap-3 pt-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--text)]/5 border border-[var(--text)]/5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg)] flex items-center justify-center text-[var(--text)]">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]">{f.title}</h4>
                    <p className="text-[10px] text-muted font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
            </motion.div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-5 bg-[var(--text)] text-[var(--bg)] rounded-3xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Continue with Google</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            
            <p className="text-[9px] text-center text-muted uppercase font-bold tracking-widest opacity-40">
              Secure authentication powered by Google Identity
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
