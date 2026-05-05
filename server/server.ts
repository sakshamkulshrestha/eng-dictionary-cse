import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import { createServer as createViteServer } from 'vite';
import express from 'express';
import app from './app.js';
import { termCache } from './services/termCache.js';

// Load environment variables from .env and .env.local
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDB();
    await termCache.preloadTerms(); // Preload for instant matching
  } catch (err) {
    console.error("Critical Failure: Could not connect to Database or load cache. Exiting...");
    process.exit(1);
  }

  // Vite Integration for Local Dev or Static Serving for Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
