import { useState, useEffect, useCallback } from 'react';
import { UserSettings, Roadmap, ChatConversation, ChatMessage } from '../types';

export function useUserState() {
  const SETTINGS_KEY = 'cseDictionarySettings';
  const LEGACY_SETTINGS_KEY = 'lexiconSettings';

  const [user] = useState<null>(null);
  const [userProfile] = useState<any>(null);
  const [isAuthReady] = useState(true);

  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => {
    const saved = localStorage.getItem('roadmaps');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem(LEGACY_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      theme: 'system',
      fontSize: 'standard',
      fontFamily: 'default',
      focusMode: false,
      autoExpandDetails: true,
      accentColor: '', // Native Default 
      reduceMotion: false,
      autoSpeak: false
    };
  });

  // --- Chat History Persistence ---
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('chatConversations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chatConversations', JSON.stringify(chatConversations));
  }, [chatConversations]);

  const saveChatConversation = useCallback((messages: ChatMessage[], existingId?: string) => {
    if (!messages || messages.length === 0) return;
    // Immediate fallback title from first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const fallbackTitle = firstUserMsg
      ? firstUserMsg.text.slice(0, 50) + (firstUserMsg.text.length > 50 ? '...' : '')
      : 'Chat';
    const now = Date.now();

    let convoId = existingId;

    if (existingId) {
      setChatConversations(prev => prev.map(c =>
        c.id === existingId ? { ...c, messages, updatedAt: now } : c
      ));
    } else {
      convoId = crypto.randomUUID();
      const newConvo: ChatConversation = {
        id: convoId,
        title: fallbackTitle,
        messages,
        createdAt: now,
        updatedAt: now
      };
      setChatConversations(prev => [newConvo, ...prev].slice(0, 50));
    }

    // Fire async AI title generation (non-blocking)
    if (convoId && messages.length >= 2) {
      import('../utils/api').then(({ DictionaryApi }) => {
        DictionaryApi.generateChatTitle(messages).then(({ title }) => {
          if (title && title !== 'Chat') {
            setChatConversations(prev => prev.map(c =>
              c.id === convoId ? { ...c, title } : c
            ));
          }
        }).catch(() => { /* silently ignore title generation failures */ });
      });
    }

    return convoId;
  }, []);

  const deleteChatConversation = useCallback((id: string) => {
    setChatConversations(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- Resolve effective theme (system → actual dark/light) ---
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const resolvedTheme = settings.theme === 'system'
    ? (systemPrefersDark ? 'dark' : 'light')
    : settings.theme;





  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.removeItem(LEGACY_SETTINGS_KEY);
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    document.documentElement.setAttribute('data-font-family', settings.fontFamily);

    // Actually apply font-size to document
    const fontSizes: Record<string, string> = { small: '14px', standard: '16px', large: '18px', medium: '16px' };
    document.documentElement.style.fontSize = fontSizes[settings.fontSize] || '16px';

    // Apply font family
    const fontFamilies: Record<string, string> = {
      default: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
      dyslexic: "'Comic Sans MS', 'OpenDyslexic', cursive, sans-serif",
      sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    };
    if (settings.fontFamily && settings.fontFamily !== 'default') {
      const selectedFont = fontFamilies[settings.fontFamily] || fontFamilies.default;
      document.documentElement.style.setProperty('--font-sans', selectedFont);
      document.documentElement.style.setProperty('--font-serif', selectedFont);
    } else {
      document.documentElement.style.removeProperty('--font-sans');
      document.documentElement.style.removeProperty('--font-serif');
    }

    // Reduce motion
    if (settings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply theme class to body for tailwind dark mode if needed
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    if (settings.accentColor) {
      document.documentElement.style.setProperty('--color-accent', settings.accentColor);

      const hex = settings.accentColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b);

      if (luminance > 140) {
        document.documentElement.style.setProperty('--color-accent-fg', '#000000');
      } else {
        document.documentElement.style.setProperty('--color-accent-fg', '#FFFFFF');
      }
    } else {
      document.documentElement.style.removeProperty('--color-accent');
      document.documentElement.style.removeProperty('--color-accent-fg');
    }
  }, [settings, resolvedTheme]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const exportData = () => {
    const data = {
      bookmarks,
      history,
      roadmaps,
      settings,
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engineering-dictionary-cse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.history) setHistory(data.history);
      if (data.roadmaps) setRoadmaps(data.roadmaps);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const toggleBookmark = async (id: string) => {
    const isBookmarked = bookmarks.includes(id);
    setBookmarks(prev => isBookmarked ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    setHistory(prev => {
      const filtered = prev.filter(h => h !== query);
      return [query, ...filtered].slice(0, 10);
    });
  };

  const clearHistory = () => setHistory([]);

  const clearSystem = () => {
    setHistory([]);
    setBookmarks([]);
    setRoadmaps([]);
    localStorage.clear();
    window.location.reload();
  };

  const saveRoadmap = (roadmap: Roadmap) => {
    setRoadmaps(prev => [roadmap, ...prev]);
  };

  const deleteRoadmap = (id: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
  };

  return {
    user,
    userProfile,
    isAuthReady,
    bookmarks,
    toggleBookmark,
    history,
    addToHistory,
    clearHistory,
    clearSystem,
    roadmaps,
    saveRoadmap,
    deleteRoadmap,
    settings,
    updateSettings,
    resolvedTheme,
    exportData,
    importData,
    chatConversations,
    saveChatConversation,
    deleteChatConversation
  };
}
