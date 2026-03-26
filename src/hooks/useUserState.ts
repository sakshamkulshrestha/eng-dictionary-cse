import { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, User } from '../firebase';
import { UserSettings, Roadmap } from '../types';

export function useUserState() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => {
    const saved = localStorage.getItem('roadmaps');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('lexiconSettings');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      fontSize: 'standard',
      fontFamily: 'default',
      focusMode: false,
      autoExpandDetails: true,
      accentColor: '', // Native Default 
      reduceMotion: false,
      autoSpeak: false
    };
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('Auth state check timed out, proceeding as guest.');
        setIsAuthReady(true);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              role: currentUser.email === 'kushnotperfect@gmail.com' ? 'admin' : 'user'
            };
            await setDoc(doc(db, 'users', currentUser.uid), newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
      clearTimeout(timeoutId);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('lexiconSettings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    document.documentElement.setAttribute('data-font-family', settings.fontFamily);

    // Apply theme class to body for tailwind dark mode if needed
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (settings.accentColor) {
      document.documentElement.style.setProperty('--color-accent', settings.accentColor);

      // Calculate luminance for contrast safety (ensures text is readable on accent)
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
  }, [settings]);

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
    a.download = `thinking-os-backup-${new Date().toISOString().split('T')[0]}.json`;
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

  const toggleBookmark = (id: string) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
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
    exportData,
    importData
  };
}
