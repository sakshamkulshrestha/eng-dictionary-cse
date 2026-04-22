import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { connectDB, getDB } from './db.js';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectDB();
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // AI Generation Routes
  const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || '';

  app.post('/api/generate-roadmap', async (req, res) => {
    try {
      const { query, concepts } = req.body;
      if (!query) return res.status(400).json({ error: 'Query is required' });

      const conceptList = concepts.map((c: any) => c.term).join(', ');

      const payload = {
        model: "nvidia/nemotron-3-nano-30b-a3b",
        messages: [{
          role: "user",
          content: `I want to learn: "${query}". \nBased on the following available concepts in my database, generate a step-by-step learning roadmap. \nOnly use concepts from this list: [${conceptList}]. \nProvide a logical order and a brief reason why each step is important.\nOutput ONLY a JSON object with a single key "steps" containing an array of objects. Each object must have "term" (string), "reason" (string), and "order" (number).`
        }],
        temperature: 1,
        top_p: 1,
        max_tokens: 16384,
        reasoning_budget: 16384,
        chat_template_kwargs: { enable_thinking: true },
        stream: false,
        response_format: { type: "json_object" }
      };

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nvidiaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Nvidia API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) throw new Error('Empty response from Nvidia API');
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error('Roadmap generate failed:', error);
      res.status(500).json({ error: error.message || 'Failed to generate roadmap' });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, contextBlock } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required' });

      const payload = {
        model: "nvidia/nemotron-3-nano-30b-a3b",
        messages: [{
          role: "user",
          content: `${contextBlock}\n\nUser: ${message}\nKeep answer concise, clear, and engaging. If you mention concept names, prefix with [CONCEPT: name] for referencing.`
        }],
        temperature: 1,
        top_p: 1,
        max_tokens: 16384,
        reasoning_budget: 16384,
        chat_template_kwargs: { enable_thinking: true },
        stream: false
      };

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nvidiaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) throw new Error('Empty response from Nvidia API');

      res.json({ text });
    } catch (error: any) {
      console.error('Chat failed:', error);
      res.status(500).json({ error: error.message || 'Chat failed' });
    }
  });

  app.post('/api/analyze-history', async (req, res) => {
    try {
      const { history } = req.body;
      if (!history || !Array.isArray(history) || history.length === 0) {
        return res.json({ suggestions: [] });
      }

      // We don't want to pass all concepts (too large). We just ask the AI to suggest generic terms, or we can cross-reference later.
      // But actually, the safest is to constrain the AI. For speed, we just ask for term name and reason.
      const payload = {
        model: "nvidia/nemotron-3-nano-30b-a3b",
        messages: [{
          role: "user",
          content: `Based on the following recent computing search history: [${history.join(', ')}].
Suggest exactly 3 relevant computing or software engineering concepts the user should explore next.
Prioritize core/fundamental concepts that are likely to be in a standard technical dictionary (e.g., specific protocols, algorithms, or architectural patterns).
If a concept is likely to be "extra knowledge" not in a basic set, provide a particularly clear and insightful reason.
Output ONLY a JSON object with a single key "suggestions" containing an array of objects. Each object must have "term" (string) and "reason" (string).`
        }],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 2048,
        stream: false,
        response_format: { type: "json_object" }
      };

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nvidiaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Nvidia API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      
      if (!text) {
        return res.json({ suggestions: [] });
      }

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error('Analyze history failed:', error);
      res.status(500).json({ error: error.message || 'Analysis failed' });
    }
  });

  // API Routes
  app.get('/api/terms', async (req, res) => {
    try {
      const db = getDB();
      const collectionsInfo = await db.listCollections().toArray();
      const collections = collectionsInfo.filter((c: any) => c.name.endsWith('_terms'));

      let allConcepts: any[] = [];
      for (const col of collections) {
        const data = await db.collection(col.name).find({}).toArray();
        const dataWithSource = data.map((d: any) => ({ ...d, id: d._id.toString(), collection_source: col.name }));
        allConcepts = allConcepts.concat(dataWithSource);
      }
      
      console.log(`📡 GET /api/terms - Retrieved ${allConcepts.length} terms`);
      res.json(allConcepts);
    } catch (error) {
      console.error("❌ Error fetching concepts:", error);
      res.status(500).json({ error: 'Failed to fetch concepts' });
    }
  });

  app.get('/api/terms/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const db = getDB();
      const collectionsInfo = await db.listCollections().toArray();
      const collections = collectionsInfo.filter((c: any) => c.name.endsWith('_terms'));

      let concept = null;
      for (const col of collections) {
        const query: any = { $or: [{ id: id }] };
        if (ObjectId.isValid(id)) {
          query.$or.push({ _id: new ObjectId(id) });
        }
        concept = await db.collection(col.name).findOne(query);
        if (concept) break;
      }

      if (!concept) {
        console.log(`⚠️ GET /api/terms/${id} - Concept not found`);
        return res.status(404).json({ error: 'Concept not found' });
      }

      console.log(`📡 GET /api/terms/${id} - Retrieved concept: ${concept.term}`);
      res.json({
        ...concept,
        id: concept._id.toString()
      });
    } catch (error) {
      console.error(`❌ Error fetching concept ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch concept' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) return res.json([]);

      const db = getDB();
      const collectionsInfo = await db.listCollections().toArray();
      const collections = collectionsInfo.filter((c: any) => c.name.endsWith('_terms'));

      let results: any[] = [];
      for (const col of collections) {
        const data = await db.collection(col.name).find({ term: { $regex: q, $options: "i" } }).limit(10).toArray();
        results = results.concat(data);
      }

      const parsedResults = results.map((c: any) => ({
        ...c,
        id: c._id.toString()
      }));

      console.log(`📡 GET /api/search?q=${q} - Found ${parsedResults.length} results`);
      res.json(parsedResults);
    } catch (error) {
      console.error("❌ Search failed:", error);
      res.status(500).json({ error: 'Failed to search' });
    }
  });

  // Vite Integration
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
