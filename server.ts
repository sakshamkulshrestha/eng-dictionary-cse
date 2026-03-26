import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const db = new Database(process.env.DATABASE_PATH || 'concepts.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    term TEXT NOT NULL,
    domain TEXT NOT NULL,
    definition_short TEXT NOT NULL,
    definition_detailed TEXT NOT NULL,
    analogy TEXT NOT NULL,
    examples TEXT NOT NULL,
    related_terms TEXT NOT NULL,
    prerequisites TEXT NOT NULL,
    image_query TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    comparisons TEXT,
    common_misconceptions TEXT
  )
`);

// Migration Logic: Seed from JSON if empty
const count = db.prepare('SELECT count(*) as count FROM concepts').get() as { count: number };
if (count.count === 0) {
  console.log('Seeding database from data directories...');
  try {
    const dataDirs = [
      path.join(__dirname, 'src/data'),
      path.join(__dirname, 'data')
    ];

    const insert = db.prepare(`
      INSERT INTO concepts (id, term, domain, definition_short, definition_detailed, analogy, examples, related_terms, prerequisites, image_query, difficulty, comparisons, common_misconceptions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let totalMigrated = 0;

    for (const dir of dataDirs) {
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(dir, file);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const concepts = JSON.parse(rawData);

        const transaction = db.transaction((data) => {
          for (const c of data) {
            // Unified mapping logic
            const id = c.id || `gen_${Math.random().toString(36).substr(2, 9)}`;
            const term = c.term || '';
            const domain = c.domain || 'General';
            const defShort = c.definition_short || '';
            const defDetailed = c.definition_detailed || c.technical_definition || '';
            const analogy = c.analogy || c.explanation || '';
            const examples = Array.isArray(c.examples) ? c.examples : (c.syntax_or_example ? [c.syntax_or_example] : []);
            const related = c.related_terms || c.related_words || [];
            const prereqs = c.prerequisites || [];
            const imgQuery = c.image_query || c.images || '';
            const difficulty = c.difficulty || 'Intermediate';
            const comparisons = c.comparisons || [];
            const misconceptions = c.common_misconceptions || [];

            insert.run(
              id,
              term,
              domain,
              defShort,
              defDetailed,
              analogy,
              JSON.stringify(examples),
              JSON.stringify(related),
              JSON.stringify(prereqs),
              imgQuery,
              difficulty,
              JSON.stringify(comparisons),
              JSON.stringify(misconceptions)
            );
          }
        });

        transaction(concepts);
        totalMigrated += concepts.length;
        console.log(`Migrated ${concepts.length} concepts from ${file}`);
      }
    }
    console.log(`Successfully migrated ${totalMigrated} concepts in total.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

async function startServer() {
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

  // API Routes
  app.get('/api/concepts', (req, res) => {
    try {
      const concepts = db.prepare('SELECT * FROM concepts').all();
      // Parse JSON strings back to arrays
      const parsedConcepts = concepts.map((c: any) => ({
        ...c,
        examples: JSON.parse(c.examples),
        related_terms: JSON.parse(c.related_terms),
        prerequisites: JSON.parse(c.prerequisites),
        comparisons: c.comparisons ? JSON.parse(c.comparisons) : [],
        common_misconceptions: c.common_misconceptions ? JSON.parse(c.common_misconceptions) : []
      }));
      res.json(parsedConcepts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch concepts' });
    }
  });

  app.get('/api/concepts/:id', (req, res) => {
    try {
      const concept = db.prepare('SELECT * FROM concepts WHERE id = ?').get(req.params.id) as any;
      if (!concept) return res.status(404).json({ error: 'Concept not found' });

      res.json({
        ...concept,
        examples: JSON.parse(concept.examples),
        related_terms: JSON.parse(concept.related_terms),
        prerequisites: JSON.parse(concept.prerequisites),
        comparisons: concept.comparisons ? JSON.parse(concept.comparisons) : [],
        common_misconceptions: concept.common_misconceptions ? JSON.parse(concept.common_misconceptions) : []
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch concept' });
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
