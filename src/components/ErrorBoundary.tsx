import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import MagneticButton from './primitives/MagneticButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Firestore Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}.`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[var(--pop-black)] flex items-center justify-center p-8 text-center text-[var(--pop-white)]">
          <div className="max-w-2xl space-y-12 flex flex-col items-center">
            <div className="w-24 h-24 flex items-center justify-center border-4 border-[var(--neo-pink)] text-[var(--neo-pink)] bg-[var(--neo-pink)]/5 relative">
               <AlertTriangle className="w-12 h-12" />
               <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--neo-pink)] flex items-center justify-center text-[var(--pop-black)] font-black text-[10px]">
                 !
               </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl font-black uppercase tracking-tighter font-serif">Protocol Disrupted</h1>
              <p className="text-xl text-[var(--muted)] font-medium leading-relaxed max-w-lg mx-auto">
                An unexpected state collision has occurred. The system context has been preserved, but the view layer requires re-initialization.
              </p>
              <div className="p-4 bg-[var(--neo-pink)]/5 border border-[var(--neo-pink)]/20 font-mono text-sm text-[var(--neo-pink)] opacity-80 uppercase tracking-tighter">
                {errorMessage}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <MagneticButton 
                onClick={() => window.location.reload()}
                variant="primary"
                className="px-12 py-4 flex items-center gap-3 !bg-[var(--neo-pink)] !border-[var(--neo-pink)] !text-[var(--pop-white)]"
              >
                <RefreshCcw className="w-5 h-5" /> RE-INITIALIZE
              </MagneticButton>
              <MagneticButton 
                onClick={() => window.location.href = '/'}
                variant="secondary"
                className="px-12 py-4 flex items-center gap-3"
              >
                <Home className="w-5 h-5" /> EXIT TO HUB
              </MagneticButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
