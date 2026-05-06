import express from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { getDB } from './db.js';
import { findClosestTerm, getSmartCandidates } from './services/termMatcher.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Helper Functions ---

function parseJsonPayload(text: string): any {
  if (!text) return null;
  try {
    // Extract the JSON object from any surrounding text
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    let jsonStr = text.substring(start, end + 1);

    // --- Attempt 1: Try direct parse ---
    try { return JSON.parse(jsonStr); } catch {}

    // --- Attempt 2: Fix common AI JSON mistakes ---
    // Remove trailing commas before ] or }
    jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
    // Fix unescaped newlines/tabs inside string values
    jsonStr = jsonStr.replace(/(?<=:\s*"[^"]*)\n/g, '\\n');
    jsonStr = jsonStr.replace(/(?<=:\s*"[^"]*)\t/g, '\\t');
    try { return JSON.parse(jsonStr); } catch {}

    // --- Attempt 3: Handle truncated JSON (AI ran out of tokens) ---
    // If the JSON is cut off mid-array, try to close it
    let fixedStr = jsonStr;
    // Count open/close brackets
    const openBrackets = (fixedStr.match(/\[/g) || []).length;
    const closeBrackets = (fixedStr.match(/\]/g) || []).length;
    const openBraces = (fixedStr.match(/\{/g) || []).length;
    const closeBraces = (fixedStr.match(/\}/g) || []).length;

    // Remove any trailing incomplete object (e.g., { "term": "Bub )
    fixedStr = fixedStr.replace(/,\s*\{[^}]*$/g, '');

    // Add missing closing brackets/braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) fixedStr += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) fixedStr += '}';

    // Remove trailing commas again after truncation fix
    fixedStr = fixedStr.replace(/,\s*([\]}])/g, '$1');

    try { return JSON.parse(fixedStr); } catch {}

    // --- Attempt 4: Extract steps array manually using regex ---
    const stepsMatch = text.match(/"steps"\s*:\s*\[([\s\S]*?)\]/);
    const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
    if (stepsMatch) {
      const stepsContent = stepsMatch[1];
      // Extract individual step objects
      const stepRegex = /\{\s*"term"\s*:\s*"([^"]+)"\s*,\s*"reason"\s*:\s*"([^"]+)"\s*,\s*"order"\s*:\s*(\d+)\s*\}/g;
      const steps: any[] = [];
      let match;
      while ((match = stepRegex.exec(stepsContent)) !== null) {
        steps.push({ term: match[1], reason: match[2], order: parseInt(match[3]) });
      }
      if (steps.length > 0) {
        return { title: titleMatch?.[1] || '', steps };
      }
    }

    console.error("JSON parse failed after all recovery attempts. Raw text:", text.slice(0, 500));
    return null;
  } catch (e) {
    console.error("JSON parse failed:", e);
    return null;
  }
}


// For analyze-history which still uses the shortlist approach
function buildShortlistedTerms(inputs: string[], limit: number = 120): string[] {
  const combinedInput = inputs.join(' ');
  const candidates = getSmartCandidates(combinedInput, limit);
  return candidates.map(c => c.term);
}

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

    console.log(`🚀 Roadmap request: "${query}"`);

    // ====================================================================
    // PHASE 1: AI decides what terms belong in the roadmap (from its own
    //          knowledge), AND orders them from basic → advanced.
    //          No database search needed here — AI knows what concepts exist.
    // ====================================================================
    const payload = {
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: [
        {
          role: "system",
          content: "You are a computer science education assistant. You ONLY respond with valid JSON. You ONLY discuss computer science topics. Refuse any non-CS requests."
        },
        {
          role: "user",
          content: `List ALL specific computer science terms related to: "${query}".

Each term must be a single specific concept name like "Bubble Sort" or "For Loop".
Do NOT use vague phrases. Order from basic to advanced. Be comprehensive.

Respond with ONLY this JSON format:
{"title":"<short title>","steps":[{"term":"<exact concept name>","reason":"<one short sentence>","order":<number>}]}`
        }
      ],
      temperature: 0.2,
      top_p: 0.85,
      max_tokens: 4096,
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

    // Debug: log first 600 chars of raw response to diagnose parse issues
    console.log(`📝 Raw AI response (first 600 chars): ${text.slice(0, 600)}`);

    const parsed = parseJsonPayload(text);
    const aiSteps = Array.isArray(parsed?.steps) ? parsed.steps : [];

    console.log(`🤖 AI suggested ${aiSteps.length} terms: [${aiSteps.slice(0, 8).map((s: any) => s.term).join(', ')}${aiSteps.length > 8 ? '...' : ''}]`);

    // ====================================================================
    // PHASE 2: Match each AI-suggested term against the database.
    //          findClosestTerm uses fuzzy matching, so "Bubble Sort" will
    //          match even if the DB has "Bubble sort" or "BubbleSort".
    //          Only terms that exist in the DB make it through.
    // ====================================================================
    const matchedSteps: any[] = [];
    const seenIds = new Set<string>();

    for (const step of aiSteps) {
      const termName = String(step.term || '').trim();
      if (!termName) continue;

      const match = findClosestTerm(termName);

      if (match.matched && match.id && !seenIds.has(match.id)) {
        seenIds.add(match.id);
        matchedSteps.push({
          term: match.dbTerm || termName,
          reason: step.reason || '',
          order: matchedSteps.length + 1,
          matched: true,
          dbTerm: match.dbTerm,
          id: match.id,
          score: match.score
        });
      }
    }

    // Re-number orders sequentially
    matchedSteps.forEach((s, i) => { s.order = i + 1; });

    console.log(`✅ Roadmap: ${matchedSteps.length}/${aiSteps.length} AI terms matched in DB for "${query}"`);

    res.json({
      title: typeof parsed?.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : `Roadmap: ${query}`,
      steps: matchedSteps
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
      messages: [
        {
          role: "system",
          content: "You are Lexicon AI, a computer science education assistant. You ONLY answer questions about computer science, programming, software engineering, and related technical topics. If a user asks about anything unrelated to CS/tech, politely decline and redirect them to CS topics. Keep answers concise, clear, and educational."
        },
        {
          role: "user",
          content: `${contextBlock}\n\nUser: ${message}\nKeep answer concise, clear, and engaging. Use markdown formatting for code blocks. If you mention concept names, prefix with [CONCEPT: name] for referencing.`
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 4096,
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

// Generate a concise AI-powered title for a chat conversation
app.post('/api/chat-title', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.json({ title: 'Chat' });
    }

    // Build a compact summary of the conversation for title generation
    const summary = messages
      .slice(0, 6)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${String(m.text || '').slice(0, 100)}`)
      .join('\n');

    const payload = {
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: [{
        role: "user",
        content: `Generate a very short title (3-6 words) that summarizes this conversation. Output ONLY the title text, nothing else.\n\n${summary}`
      }],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 30,
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

    if (!response.ok) {
      return res.json({ title: messages.find((m: any) => m.role === 'user')?.text?.slice(0, 40) || 'Chat' });
    }

    const data = await response.json();
    let title = (data?.choices?.[0]?.message?.content || '').trim();

    // Clean up: remove quotes, newlines, etc.
    title = title.replace(/^["'`]+|["'`]+$/g, '').replace(/\n/g, ' ').trim();
    if (!title || title.length > 60) {
      title = messages.find((m: any) => m.role === 'user')?.text?.slice(0, 40) || 'Chat';
    }

    res.json({ title });
  } catch (error: any) {
    console.error('Chat title generation failed:', error);
    res.json({ title: 'Chat' });
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
