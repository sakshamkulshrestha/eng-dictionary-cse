import React, { useRef } from 'react';
import { Moon, Palette, Trash2, Smartphone, MonitorSmartphone, MousePointer2, Type, Volume2, Download, Upload } from 'lucide-react';

export default function SettingsView({
  isDark,
  setIsDark,
  accentColor,
  setAccentColor,
  reduceMotion,
  setReduceMotion,
  fontSize,
  setFontSize,
  autoSpeak,
  setAutoSpeak,
  onClearHistory,
  onClearBookmarks,
  bookmarks,
  setBookmarks
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const confirmAction = (action: any, message: string) => {
    if (window.confirm(message)) {
      action();
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "dictionary_bookmarks.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: any) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e: any) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setBookmarks(imported);
          alert('Bookmarks imported successfully!');
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-10">
      <header className="mb-20">
        <h1 className="text-page-title mb-5">
          Settings
        </h1>
        <p className="text-lg text-muted font-bold uppercase tracking-widest">
          Customize your semantic experience.
        </p>
      </header>

      <div className="space-y-10">

        {/* Appearance Section */}
        <div className="space-y-10">
          <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-2">System Aesthetics</h2>
          <div className="neo-card p-0">
            <div className="flex items-center justify-between p-10 border-b border-[var(--border)]">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[var(--text)] flex items-center justify-center">
                  <Moon className="w-5 h-5 text-[var(--bg)]" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black uppercase tracking-widest">Atmosphere Control</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider">Toggle Dark/Light Protocol</span>
                </div>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`w-[60px] h-8 border-2 border-[var(--text)] transition-colors relative ${isDark ? 'bg-[var(--text)]' : 'bg-transparent'}`}
              >
                <div className={`w-[20px] h-[20px] bg-[var(--bg)] absolute top-1 transition-transform duration-200 ${isDark ? 'translate-x-[32px]' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-10">
              <div className="flex items-center gap-5 mb-5 sm:mb-0">
                <div className="w-10 h-10 bg-[var(--neo-purple)] flex items-center justify-center">
                  <Type className="w-5 h-5 text-[var(--pop-white)]" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black uppercase tracking-widest">Typographic Scale</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider">Adjust reading density</span>
                </div>
              </div>
              <div className="flex items-center gap-1 border-2 border-[var(--text)] p-1">
                <button
                  onClick={() => setFontSize('standard')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${fontSize === 'standard' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-muted hover:text-[var(--text)]'}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${fontSize === 'large' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-muted hover:text-[var(--text)]'}`}
                >
                  Expanded
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="space-y-10">
          <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-2">Tactical Accessibility</h2>
          <div className="neo-card p-0">
            <div className="flex items-center justify-between p-10 border-b border-[var(--border)]">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[var(--neo-gold)] flex items-center justify-center">
                  <MousePointer2 className="w-5 h-5 text-[var(--bg)]" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black uppercase tracking-widest">Kinetic Motion</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider">Protocol: Reduce UI Strains</span>
                </div>
              </div>
              <button
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`w-[60px] h-8 border-2 border-[var(--text)] transition-colors relative ${reduceMotion ? 'bg-[var(--text)]' : 'bg-transparent'}`}
              >
                <div className={`w-[20px] h-[20px] bg-[var(--bg)] absolute top-1 transition-transform duration-200 ${reduceMotion ? 'translate-x-[32px]' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-10">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[var(--neo-green)] flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-[var(--bg)]" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black uppercase tracking-widest">Audio Synthesis</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider">Automated definition playback</span>
                </div>
              </div>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`w-[60px] h-8 border-2 border-[var(--text)] transition-colors relative ${autoSpeak ? 'bg-[var(--text)]' : 'bg-transparent'}`}
              >
                <div className={`w-[20px] h-[20px] bg-[var(--bg)] absolute top-1 transition-transform duration-200 ${autoSpeak ? 'translate-x-[32px]' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="space-y-10">
          <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] pl-2">Data Persistence Protocols</h2>
          <div className="neo-card p-0">
            <button
              onClick={() => confirmAction(onClearHistory, 'Wipe search history?')}
              className="w-full flex items-center justify-between p-10 border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors text-left group"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[var(--text)] flex items-center justify-center">
                  <MonitorSmartphone className="w-5 h-5 text-[var(--bg)]" strokeWidth={3} />
                </div>
                <span className="text-[14px] font-black uppercase tracking-widest group-hover:pl-2 transition-all">Terminate Search Cache</span>
              </div>
              <Trash2 className="w-5 h-5 text-muted group-hover:text-[var(--neo-pink)] transition-colors" />
            </button>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-10 border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors text-left group"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[var(--neo-purple)] flex items-center justify-center">
                  <Download className="w-5 h-5 text-[var(--pop-white)]" strokeWidth={3} />
                </div>
                <span className="text-[14px] font-black uppercase tracking-widest group-hover:pl-2 transition-all">Extract Local Bookmarks</span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-10 border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors text-left group"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[var(--neo-green)] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[var(--bg)]" strokeWidth={3} />
                </div>
                <span className="text-[14px] font-black uppercase tracking-widest group-hover:pl-2 transition-all">Inject External Backup</span>
              </div>
              <input type="file" className="hidden" ref={fileInputRef} accept=".json" onChange={handleImport} />
            </button>

            <button
              onClick={() => confirmAction(onClearBookmarks, 'Wipe all saved intelligence?')}
              className="w-full flex items-center justify-between p-10 hover:bg-[var(--neo-pink)]/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[var(--neo-pink)] flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-[var(--pop-white)]" strokeWidth={3} />
                </div>
                <span className="text-[14px] font-black uppercase tracking-widest text-[var(--neo-pink)] group-hover:pl-2 transition-all">Global Memory Purge</span>
              </div>
            </button>
          </div>
        </div>

        <p className="px-4 mt-3 text-[13px] text-muted font-medium">
          Dictionary data never leaves your device and runs entirely in local storage.
        </p>

      </div>
    </div>
  );
}
