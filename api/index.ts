import app from '../server/app.js';
import { connectDB } from '../server/db.js';
import { termCache } from '../server/services/termCache.js';

let readyPromise: Promise<void> | null = null;

async function ensureBackendReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await connectDB();
      await termCache.preloadTerms();
    })().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }

  return readyPromise;
}

function normalizeApiUrl(request: { url?: string; query?: Record<string, unknown> }) {
  const currentUrl = request.url || '/api';
  const parsedUrl = new URL(currentUrl, 'http://vercel.local');

  const queryPath = request.query?.path || parsedUrl.searchParams.get('path');
  const pathParts = Array.isArray(queryPath) ? queryPath : queryPath ? [queryPath] : [];
  const pathSuffix = pathParts.map(String).join('/');

  if (parsedUrl.pathname === '/api' || parsedUrl.pathname === '/api/') {
    request.url = pathSuffix ? `/api/${pathSuffix}${parsedUrl.search}` : currentUrl;
    return;
  }

  if (parsedUrl.pathname.startsWith('/api')) return;

  request.url = pathSuffix ? `/api/${pathSuffix}${parsedUrl.search}` : `/api${currentUrl}`;
}

export default async function handler(request: any, response: any) {
  try {
    await ensureBackendReady();
    normalizeApiUrl(request);
    return app(request, response);
  } catch (error) {
    console.error('Failed to initialize Vercel API backend:', error);
    return response.status(500).json({
      error: 'Failed to initialize API backend. Check server environment variables and MongoDB connectivity.',
    });
  }
}
