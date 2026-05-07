import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// --- Global Self-Healing Routine for Stale Vercel 403s ---
// Aggressively clear stale cookies that cause Vercel Edge 403s (e.g. expired _vercel_jwt)
const clearAllCookies = () => {
  const cookies = document.cookie.split(';');
  const domain = window.location.hostname;
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    
    // Attempt to clear cookie on various common paths and domains
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
    
    // Also try removing root domain if it's a subdomain
    const domainParts = domain.split('.');
    if (domainParts.length > 2) {
      const rootDomain = domainParts.slice(1).join('.');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootDomain}`;
    }
  }
};

// Clear cookies immediately on boot to wipe any stale preview JWTs
clearAllCookies();

// Unregister legacy Service Workers AND explicitly delete their Cache Storage
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(success => {
        if (success) console.log('Successfully unregistered legacy Service Worker');
      });
    }
  });

  // Explicitly clear Cache Storage to ensure no stale 403 responses are served
  if ('caches' in window) {
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)));
    }).then(() => {
      console.log('Successfully cleared all legacy caches');
    });
  }
}

// Global Fetch Interceptor to catch 403/401 errors mid-session and self-heal
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  if (response.status === 403 || response.status === 401) {
    console.warn(`Intercepted ${response.status} from API. Triggering self-healing recovery.`);
    
    // 1. Clear all possible stale auth/session/preview cookies
    clearAllCookies();
    
    // 2. Clear all Service Worker caches again just in case
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
    
    // 3. Clear session storage (but leave localStorage where user data is kept)
    sessionStorage.clear();
    
    // 4. Reload the page to recover gracefully, preventing infinite loops using a session flag
    if (!sessionStorage.getItem('recovered_from_403')) {
      sessionStorage.setItem('recovered_from_403', 'true');
      window.location.reload();
    }
  }
  
  return response;
};
