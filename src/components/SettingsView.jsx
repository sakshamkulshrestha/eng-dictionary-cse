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
}) {
  const fileInputRef = useRef(null);

  const colors = [
    { name: 'Red', value: '#FF6961' },      // Light Red
    { name: 'Blue', value: '#5AC8FA' },     // Light Blue
    { name: 'Pink', value: '#FFB3C6' },     // Baby Pink
    { name: 'Green', value: '#34C759' },    // iOS Green
    { name: 'Yellow', value: '#FFD60A' },   // Light Orange/Yellow
    { name: 'Purple', value: '#C68EFA' }    // Light Purple
  ];

  const confirmAction = (action, message) => {
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

  const handleImport = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-black dark:text-white pb-32 animate-fade-in perspective-1000">
      <header className="mb-12 pl-2">
        <h1 className="text-5xl sm:text-[64px] font-extrabold tracking-[-0.04em] mb-4 leading-none animate-slide-up bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400 pb-2">
          Settings
        </h1>
        <p className="text-xl text-[#8E8E93] font-medium animate-slide-up delay-100">
          Customize your semantic experience.
        </p>
      </header>

      <div className="space-y-10">
        
        {/* Appearance Section */}
        <div className="animate-slide-up delay-150">
          <h2 className="text-[13px] font-bold text-gray-500 mb-2.5 uppercase tracking-widest pl-4">Appearance</h2>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none border border-black/5 dark:border-white/10">
            
            <div className="flex items-center justify-between p-4 px-5 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-zinc-700 flex items-center justify-center">
                  <Moon className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-[17px] font-medium">Dark Mode</span>
              </div>
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`w-[50px] h-8 rounded-full transition-colors relative ${isDark ? 'bg-accent' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
              >
                <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm absolute top-[2px] transition-transform duration-300 ${isDark ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <Type className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-[17px] font-medium">Typography Scale</span>
              </div>
              <div className="flex items-center bg-[#E5E5EA] dark:bg-[#3A3A3C] p-1 rounded-full">
                <button 
                  onClick={() => setFontSize('standard')}
                  className={`px-4 py-1 rounded-full text-[14px] font-medium transition-all ${fontSize === 'standard' ? 'bg-white dark:bg-[#1C1C1E] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setFontSize('large')}
                  className={`px-4 py-1 rounded-full text-[14px] font-medium transition-all ${fontSize === 'large' ? 'bg-white dark:bg-[#1C1C1E] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
                >
                  Large
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
                  <Palette className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-[17px] font-medium">Theme Accent</span>
              </div>
              <div className="flex items-center gap-3">
                {colors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setAccentColor(c.value)}
                    className={`w-[26px] h-[26px] rounded-full transition-transform outline-none relative flex items-center justify-center ${accentColor === c.value ? 'scale-110' : 'hover:scale-105 active:scale-90'}`}
                    style={{ backgroundColor: c.value }}
                    aria-label={`Set theme to ${c.name}`}
                  >
                    {accentColor === c.value && (
                      <div className="absolute -inset-1 rounded-full border-2 opacity-50" style={{ borderColor: c.value }}/>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Accessibility Section */}
        <div className="animate-slide-up delay-200">
          <h2 className="text-[13px] font-bold text-gray-500 mb-2.5 uppercase tracking-widest pl-4">Accessibility</h2>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none border border-black/5 dark:border-white/10">
            
            <div className="flex items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <MousePointer2 className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] font-medium">Reduce Motion</span>
                  <span className="text-[13px] text-gray-400 mt-0.5">Disables UI spring animations.</span>
                </div>
              </div>
              <button 
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`w-[50px] h-8 rounded-full transition-colors relative ${reduceMotion ? 'bg-accent' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
              >
                <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm absolute top-[2px] transition-transform duration-300 ${reduceMotion ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Volume2 className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] font-medium">Auto-Speak</span>
                  <span className="text-[13px] text-gray-400 mt-0.5">Read dictionary definitions aloud.</span>
                </div>
              </div>
              <button 
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`w-[50px] h-8 rounded-full transition-colors relative ${autoSpeak ? 'bg-accent' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
              >
                <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm absolute top-[2px] transition-transform duration-300 ${autoSpeak ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Data Section */}
        <div className="animate-slide-up delay-300">
          <h2 className="text-[13px] font-bold text-gray-500 mb-2.5 uppercase tracking-widest pl-4">Data Management</h2>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none border border-black/5 dark:border-white/10">
            
            <button 
              onClick={() => confirmAction(onClearHistory, 'Are you sure you want to clear your search history?')}
              className="w-full flex items-center justify-between p-4 px-5 border-b border-black/5 dark:border-white/10 active:bg-black/5 dark:active:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center">
                  <MonitorSmartphone className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-[17px] font-medium">Clear Search History</span>
              </div>
              <Trash2 className="w-[18px] h-[18px] text-gray-400" />
            </button>
            
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 px-5 border-b border-black/5 dark:border-white/10 active:bg-black/5 dark:active:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Download className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-[17px] font-medium">Export Bookmarks</span>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 px-5 border-b border-black/5 dark:border-white/10 active:bg-black/5 dark:active:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <Upload className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-[17px] font-medium">Import Bookmarks</span>
              </div>
              <input type="file" className="hidden" ref={fileInputRef} accept=".json" onChange={handleImport} />
            </button>

            <button 
              onClick={() => confirmAction(onClearBookmarks, 'Are you sure you want to clear all your saved bookmarks? This cannot be undone.')}
              className="w-full flex items-center justify-between p-4 px-5 active:bg-black/5 dark:active:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <Trash2 className="w-[18px] h-[18px] text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-[17px] font-medium text-red-500">Clear Saved Bookmarks</span>
              </div>
            </button>

          </div>
          <p className="px-4 mt-3 text-[13px] text-gray-400 font-medium">
            Dictionary data never leaves your device and runs entirely in local storage.
          </p>
        </div>

      </div>
    </div>
  );
}
