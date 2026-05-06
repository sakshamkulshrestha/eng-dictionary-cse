import express from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { getDB } from './db.js';
import { findClosestTerm, getTopTermCandidates } from './services/termMatcher.js';
import { termCache } from './services/termCache.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API Routes ---

const getNvidiaKey = () => process.env.NVIDIA_API_KEY || '';

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const shortlistedTerms = buildShortlistedTerms([query], 180);
    const termListStr = shortlistedTerms.join(', ');

    const payload = {
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: [{
        role: "user",
        content: `I want to learn: "${query}".
Generate a step-by-step learning roadmap with 6 to 10 steps.
Provide a logical order and one brief reason per step.

CRITICAL RULE: Each "term" in each step MUST be a single, specific technical concept — NOT a compound phrase or sentence.
You MUST pick every term from this shortlist of available dictionary terms:
[${termListStr}]

Use EXACT spellings from the shortlist.
Output ONLY a JSON object with keys: "title" (string) and "steps" (array of objects).
Each step object must include: "term" (string), "reason" (string), "order" (number).`
      }],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 2200,
      reasoning_budget: 1024,
      chat_template_kwargs: { enable_thinking: true },
      stream: false,
      response_format: { type: "json_object" }
    };

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getNvidiaKey()}`,
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
    const parsed = parseJsonPayload(text);
    const aiSteps = Array.isArray(parsed?.steps) ? parsed.steps : [];

    let mappedSteps = mapRoadmapStepsToDatabase(aiSteps);
    if (mappedSteps.length === 0) {
      mappedSteps = buildFallbackRoadmap(query, shortlistedTerms);
    }

    res.json({
      title: typeof parsed?.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : `Roadmap: ${query}`,
      steps: mappedSteps
    });
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
        'Authorization': `Bearer ${getNvidiaKey()}`,
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

    const cleanHistory = history
      .map((item: any) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 12);

    const shortlistedTerms = buildShortlistedTerms(cleanHistory, 120);
    if (shortlistedTerms.length === 0) return res.json({ suggestions: [] });
    const termListStr = shortlistedTerms.join(', ');

    const payload = {
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: [{
        role: "user",
        content: `Based on this recent CSE search history: [${cleanHistory.join(', ')}].
Suggest exactly 4 next concepts the user should explore.

CRITICAL RULES:
1) Each "term" MUST be selected from the shortlist below.
2) Use exact spelling from the shortlist.
3) Do not repeat any term from the user's history.

Shortlist:
[${termListStr}]

Output ONLY JSON:
{ "suggestions": [{ "term": string, "reason": string }] }`
      }],
      temperature: 0.35,
      top_p: 1,
      max_tokens: 1100,
      stream: false,
      response_format: { type: "json_object" }
    };

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getNvidiaKey()}`,
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

    const parsed = parseJsonPayload(text);
    const historySet = new Set(cleanHistory.map((item) => item.toLowerCase()));
    const aiSuggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];

    const mappedSuggestions = aiSuggestions
      .map((suggestion: any) => {
        const match = findClosestTerm(String(suggestion?.term || ''));
        return {
          term: match.dbTerm || String(suggestion?.term || ''),
          reason: String(suggestion?.reason || 'Builds naturally from your recent search trail.'),
          matched: match.matched,
          dbTerm: match.dbTerm,
          id: match.id,
          score: match.score
        };
      })
      .filter((suggestion) => suggestion.matched && suggestion.id && !historySet.has(suggestion.term.toLowerCase()));

    const dedupedSuggestions: typeof mappedSuggestions = [];
    const seenIds = new Set<string>();
    for (const suggestion of mappedSuggestions) {
      const key = suggestion.id || suggestion.term.toLowerCase();
      if (!seenIds.has(key)) {
        seenIds.add(key);
        dedupedSuggestions.push(suggestion);
      }
    }

    if (dedupedSuggestions.length < 3) {
      for (const candidate of shortlistedTerms) {
        const match = findClosestTerm(candidate);
        if (!match.matched || !match.id || !match.dbTerm) continue;
        if (historySet.has(match.dbTerm.toLowerCase()) || seenIds.has(match.id)) continue;
        dedupedSuggestions.push({
          term: match.dbTerm,
          reason: 'Recommended from your recent learning history and available dictionary coverage.',
          matched: true,
          dbTerm: match.dbTerm,
          id: match.id,
          score: match.score
        });
        seenIds.add(match.id);
        if (dedupedSuggestions.length >= 4) break;
      }
    }

    res.json({ suggestions: dedupedSuggestions.slice(0, 4) });
  } catch (error: any) {
    console.error('Analyze history failed:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

app.get('/api/terms', async (req, res) => {
  try {
    const db = getDB();
    const collectionsInfo = await db.listCollections().toArray();
    const collections = collectionsInfo.filter((c: any) => c.name.endsWith('_terms'));

    let allConcepts: any[] = [];
    for (const col of collections) {
      const data = await db.collection(col.name).find({}).toArray();
      const validData = data.filter((d: any) => d.term && d.domain);
      const dataWithSource = validData.map((d: any) => ({ ...d, id: d._id.toString(), collection_source: col.name }));
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
      const validData = data.filter((d: any) => d.term && d.domain);
      results = results.concat(validData);
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

export default app;
