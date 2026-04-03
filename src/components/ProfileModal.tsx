import React from 'react';
import { motion } from 'framer-motion';
import { X, LogOut, User as UserIcon, Mail, Shield, ExternalLink } from 'lucide-react';
import { auth, signOut, User } from '../firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  if (!isOpen || !user) return null;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[var(--bg)] border border-[var(--text)]/10 shadow-2xl rounded-[2rem] overflow-hidden z-[111]"
      >
        {/* Profile Header */}
        <div className="relative h-32 bg-[var(--text)]/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--neo-green)]/10 via-transparent to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-[var(--bg)]/50 backdrop-blur-md rounded-full text-[var(--text)] hover:scale-110 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-10 pb-10 -mt-16 relative">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-[var(--bg)] shadow-xl bg-[var(--bg)]">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--text)]/5 text-[var(--text)]/40">
                  <UserIcon className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--neo-green)] rounded-full border-4 border-[var(--bg)]" />
          </div>

          <div className="mt-6 space-y-1">
            <h3 className="text-2xl font-black tracking-tight text-[var(--text)]">
              {user.displayName || 'Anonymous Operator'}
            </h3>
            <p className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
              <Shield className="w-3 h-3 text-[var(--neo-green)]" />
              Verified Identity Access
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="p-6 rounded-2xl bg-[var(--text)]/5 border border-[var(--text)]/5 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                <span>Identity Details</span>
                <Mail className="w-3 h-3" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--muted)] opacity-50">Email Address</p>
                <p className="text-sm font-bold text-[var(--text)]">{user.email}</p>
              </div>
              <div className="pt-4 border-t border-[var(--text)]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-[var(--muted)] opacity-50">Provider</p>
                    <p className="text-sm font-bold text-[var(--text)]">Google Secure Identity</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--text)]/20" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all group"
            >
              Terminate Session
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
