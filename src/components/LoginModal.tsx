import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from '../firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'verify';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled in the Firebase Console. Please enable it under Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await sendEmailVerification(userCredential.user);
        setMode('verify');
        setSuccess('Account created! A verification email has been sent to ' + email + '. Please verify your email before signing in.');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setMode('verify');
          setError('Your email is not verified yet. We have sent another verification link to your inbox.');
          await sendEmailVerification(userCredential.user);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      setIsLoading(true);
      try {
        await sendEmailVerification(auth.currentUser);
        setSuccess('Verification email resent!');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-md bg-card  border border-[var(--border)] dark:border-[var(--border)] shadow-2xl rounded-3xl p-10 z-[101]"
      >
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                {mode === 'signin' ? 'Initialize Access' : mode === 'signup' ? 'Create Identity' : 'Verify Credentials'}
              </h2>
              <p className="text-sm text-[#8E8E93]">
                {mode === 'signin' ? 'Authenticate to access the archive.' : mode === 'signup' ? 'Register your engineering profile.' : 'Security verification required.'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--hover)] dark:hover:bg-[var(--active)] rounded-full transition-colors text-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-400"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold uppercase tracking-wider">{success}</p>
            </motion.div>
          )}

          {mode === 'verify' ? (
            <div className="text-center space-y-8 py-4">
              <div className="w-20 h-20 bg-[var(--text)]/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)] border border-[var(--text)]/20">
                <ShieldCheck className="w-10 h-10 text-[var(--text)]" />
              </div>
              <p className="text-sm text-[#8E8E93] leading-relaxed">
                A verification link has been dispatched to <br />
                <span className="text-[var(--text)] font-bold">{email}</span>
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={resendVerification}
                  disabled={isLoading}
                  className="w-full py-4 rounded-full flex items-center justify-center gap-3 bg-[var(--text)] text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Resend Verification'}
                </button>
                <button
                  onClick={() => setMode('signin')}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] hover:text-white transition-colors"
                >
                  Return to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-6">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E93] ml-4">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-[var(--text)] transition-colors" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl outline-none text-[var(--text)] focus:border-[var(--text)] transition-all placeholder:text-muted"
                        placeholder="Nikola Tesla"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E93] ml-4">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-[var(--text)] transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl outline-none text-[var(--text)] focus:border-[var(--text)] transition-all placeholder:text-muted"
                      placeholder="engineer@lexicon.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E93] ml-4">Access Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-[var(--text)] transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl outline-none text-[var(--text)] focus:border-[var(--text)] transition-all placeholder:text-muted"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-full flex items-center justify-center gap-3 bg-[var(--text)] text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_rgba(0,0,0,0.1)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm">{mode === 'signin' ? 'Authorize' : 'Register'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-10 flex items-center gap-6">
                <div className="h-px flex-1 bg-[var(--active)] dark:bg-[var(--active)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E93]">External Auth</span>
                <div className="h-px flex-1 bg-[var(--active)] dark:bg-[var(--active)]" />
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-[var(--hover)] dark:bg-[var(--hover)] border border-[var(--border)] dark:border-[var(--border)] rounded-3xl flex items-center justify-center gap-4 hover:bg-[var(--active)] dark:hover:bg-[var(--active)] transition-all active:scale-[0.98]"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span className="text-sm font-bold text-[var(--text)]">Google Identity</span>
              </button>

              <div className="mt-10 text-center">
                <button
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] hover:text-white transition-colors"
                >
                  {mode === 'signin' ? "Need an account? Create Identity" : "Existing user? Initialize Access"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
