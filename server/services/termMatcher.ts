import Fuse from 'fuse.js';
import { termCache, CachedTerm } from './termCache.js';
import { normalizeTerm, superNormalizeTerm } from '../utils/searchNormalization.js';

export interface MatchResult {
  input: string;
  matched: boolean;
  dbTerm: string | null;
  id: string | null;
  score: number;
}

let termFuse: Fuse<CachedTerm> | null = null;
let fuseSignature = '';

function getTermFuse(terms: CachedTerm[]) {
  const signature = `${terms.length}:${terms[0]?.id || ''}:${terms[terms.length - 1]?.id || ''}`;
  if (!termFuse || signature !== fuseSignature) {
    termFuse = new Fuse(terms, {
      keys: ['term', 'normalized', 'aliases'],
      includeScore: true,
      threshold: 0.25,
      distance: 100
    });
    fuseSignature = signature;
  }
  return termFuse;
}

export function getTopTermCandidates(input: string, limit = 120): CachedTerm[] {
  if (!termCache.isReady() || !input || typeof input !== 'string') return [];

  const terms = termCache.getTerms();
  const cleaned = input.toLowerCase().trim();
  const normInput = normalizeTerm(input);
  const normalizedTokens = normInput.split(/\s+/).filter(Boolean);

  const directContains = terms.filter((term) => {
    const termLower = term.term.toLowerCase();
    return normalizedTokens.some((token) => token.length > 1 && termLower.includes(token));
  });

  const startsWith = terms.filter((term) => term.term.toLowerCase().startsWith(cleaned));
  const fuzzy = getTermFuse(terms).search(input, { limit: limit * 2 }).map((result) => result.item);

  const combined = [...startsWith, ...directContains, ...fuzzy];
  const uniqueCandidates: CachedTerm[] = [];
  const seenIds = new Set<string>();

  for (const candidate of combined) {
    if (!seenIds.has(candidate.id)) {
      seenIds.add(candidate.id);
      uniqueCandidates.push(candidate);
      if (uniqueCandidates.length >= limit) break;
    }
  }

  return uniqueCandidates;
}

export function findClosestTerm(input: string): MatchResult {
  if (!termCache.isReady()) {
    console.warn("⚠️ termCache mapping requested but cache not ready!");
    return { input, matched: false, dbTerm: null, id: null, score: 0 };
  }

  const terms = termCache.getTerms();
  if (!input || typeof input !== 'string') return { input, matched: false, dbTerm: null, id: null, score: 0 };

  // --- PREP ---
  const lowerInput = input.toLowerCase().trim();
  const normInput = normalizeTerm(input);
  const superNormInput = superNormalizeTerm(input);

  // === Layer 1: Exact Match (Case Insensitive) ===
  const exactMatch = terms.find(t => t.term.toLowerCase() === lowerInput);
  if (exactMatch) {
    return { input, matched: true, dbTerm: exactMatch.term, id: exactMatch.id, score: 1.0 };
  }

  // === Layer 2: Normalized Match ===
  const normMatch = terms.find(t => t.superNormalized === superNormInput);
  if (normMatch) {
    return { input, matched: true, dbTerm: normMatch.term, id: normMatch.id, score: 0.98 };
  }

  // === Layer 3: Alias Match ===
  const aliasMatch = terms.find(t => t.aliases.some(alias => alias === normInput || alias.replace(/\s+/g, '') === superNormInput));
  if (aliasMatch) {
    return { input, matched: true, dbTerm: aliasMatch.term, id: aliasMatch.id, score: 0.95 };
  }

  // === Layer 3.5: Token Containment Match ===
  // Handles "Continue Statement" → "Continue", "Merge Sort Algorithm" → "Merge Sort"
  // Find DB terms that are fully contained in the input as whole words, preferring the longest match.
  const inputWords = lowerInput.split(/\s+/);
  let bestContainment: { term: CachedTerm; matchLen: number } | null = null;

  for (const t of terms) {
    const termLower = t.term.toLowerCase();
    const termWords = termLower.split(/\s+/);

    // Skip single-char terms (like "C") to avoid false positives
    if (termLower.length <= 1) continue;

    // Check if the DB term words appear consecutively in the input
    for (let start = 0; start <= inputWords.length - termWords.length; start++) {
      const slice = inputWords.slice(start, start + termWords.length).join(' ');
      if (slice === termLower) {
        if (!bestContainment || termWords.length > bestContainment.matchLen) {
          bestContainment = { term: t, matchLen: termWords.length };
        }
        break;
      }
    }
  }

  if (bestContainment && bestContainment.matchLen >= 1) {
    // Score based on how much of the input was matched (a 2-word match out of 3 words = higher than 1 out of 3)
    const coverage = bestContainment.matchLen / inputWords.length;
    const score = 0.80 + (coverage * 0.15); // Range: 0.80 to 0.95
    return { input, matched: true, dbTerm: bestContainment.term.term, id: bestContainment.term.id, score };
  }

  // === Layer 4: Fuzzy Match (Fuse.js) ===
  const fuseResults = getTermFuse(terms).search(input);
  if (fuseResults.length > 0) {
    const topResult = fuseResults[0];
    const item = topResult.item;
    const fuseScore = topResult.score !== undefined ? 1 - topResult.score : 0; // Fuse score is distance (0 = perfect)

    if (fuseScore > 0.85) {
      return { input, matched: true, dbTerm: item.term, id: item.id, score: fuseScore };
    } else if (fuseScore > 0.70) {
      // It's a "maybe", but for hyperlinking we should be conservative.
      // E.g. "Ram Memory" might match "RAM" at ~0.75 depending on token lengths.
      // So we will allow it with slightly lower confidence, but still mark matched.
      return { input, matched: true, dbTerm: item.term, id: item.id, score: fuseScore };
    }
  }

  // === Layer 5: AI Semantic Backup ===
  // (Optional implementation / Fallback later if required. For now, fuzzy handles technical misspellings well enough)

  return { input, matched: false, dbTerm: null, id: null, score: 0 };
}

// ============================================================
// SMART CANDIDATE DISCOVERY — Multi-strategy term shortlisting
// ============================================================

// Filler words to strip from user queries to extract real keywords
const FILLER_WORDS = new Set([
  'i', 'want', 'to', 'learn', 'about', 'all', 'type', 'types', 'of',
  'make', 'a', 'roadmap', 'from', 'basic', 'intermediate', 'advanced',
  'guide', 'me', 'through', 'the', 'in', 'for', 'and', 'or', 'with',
  'how', 'what', 'is', 'are', 'do', 'does', 'can', 'tell', 'explain',
  'show', 'give', 'list', 'every', 'each', 'different', 'various',
  'help', 'need', 'know', 'understand', 'study', 'cover', 'teach',
  'please', 'start', 'begin', 'end', 'like', 'some', 'any', 'my',
  'an', 'it', 'its', 'this', 'that', 'these', 'those', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'must', 'on', 'at', 'by', 'up',
  'so', 'no', 'not', 'but', 'if', 'into', 'very', 'just', 'also',
  'then', 'than', 'too', 'only', 'own', 'same', 'other', 'such',
  'more', 'most', 'much', 'many', 'few', 'let', 'us', 'get',
  'everything', 'related', 'topics', 'topic', 'concept', 'concepts'
]);

// Domain keyword mapping — maps user keywords to database domain slugs
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'data-structures-and-algorithms': [
    'dsa', 'data structure', 'data structures', 'algorithm', 'algorithms',
    'sorting', 'sort', 'search', 'searching', 'tree', 'trees', 'graph', 'graphs',
    'linked list', 'array', 'arrays', 'stack', 'stacks', 'queue', 'queues',
    'heap', 'heaps', 'hash', 'hashing', 'recursion', 'dynamic programming',
    'dp', 'greedy', 'backtracking', 'bfs', 'dfs', 'traversal', 'binary',
    'loop', 'loops', 'iteration', 'pointer', 'pointers', 'complexity'
  ],
  'database-management-system': [
    'dbms', 'database', 'databases', 'sql', 'nosql', 'query', 'queries',
    'normalization', 'relational', 'table', 'tables', 'join', 'joins',
    'index', 'indexing', 'transaction', 'transactions', 'acid', 'schema',
    'er model', 'entity', 'relationship', 'primary key', 'foreign key'
  ],
  'operating-systems': [
    'os', 'operating system', 'operating systems', 'process', 'processes',
    'thread', 'threads', 'scheduling', 'scheduler', 'memory management',
    'paging', 'segmentation', 'deadlock', 'deadlocks', 'semaphore',
    'mutex', 'file system', 'kernel', 'virtual memory', 'cpu scheduling',
    'synchronization', 'concurrency'
  ],
  'computer-networks': [
    'cn', 'networking', 'network', 'networks', 'tcp', 'udp', 'ip',
    'protocol', 'protocols', 'osi', 'osi model', 'http', 'https',
    'dns', 'routing', 'router', 'switch', 'subnet', 'subnetting',
    'firewall', 'socket', 'sockets', 'lan', 'wan', 'ethernet', 'wifi',
    'packet', 'bandwidth', 'latency'
  ],
  'object-oriented-programming': [
    'oop', 'object oriented', 'class', 'classes', 'object', 'objects',
    'inheritance', 'polymorphism', 'encapsulation', 'abstraction',
    'interface', 'abstract class', 'constructor', 'destructor',
    'method', 'overloading', 'overriding', 'coupling', 'cohesion'
  ],
  'web-development': [
    'web', 'html', 'css', 'javascript', 'react', 'angular', 'vue',
    'node', 'nodejs', 'express', 'api', 'rest', 'restful', 'dom',
    'frontend', 'backend', 'fullstack', 'responsive', 'spa',
    'webpack', 'typescript', 'json', 'ajax', 'fetch'
  ],
  'artificial-intelligence': [
    'ai', 'artificial intelligence', 'machine learning', 'ml',
    'deep learning', 'neural network', 'neural networks', 'nlp',
    'natural language', 'classification', 'regression', 'clustering',
    'supervised', 'unsupervised', 'reinforcement', 'cnn', 'rnn',
    'transformer', 'gpt', 'bert', 'training', 'model'
  ],
  'cloud-computing': [
    'cloud', 'cloud computing', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'container', 'containers', 'microservices',
    'serverless', 'iaas', 'paas', 'saas', 'devops', 'ci/cd',
    'deployment', 'scaling', 'load balancer', 'virtualization'
  ],
  'cyber-security': [
    'security', 'cyber', 'cybersecurity', 'encryption', 'decryption',
    'firewall', 'malware', 'virus', 'phishing', 'authentication',
    'authorization', 'ssl', 'tls', 'cryptography', 'hashing',
    'vulnerability', 'penetration', 'xss', 'sql injection', 'csrf'
  ],
  'software-engineering': [
    'software engineering', 'sdlc', 'agile', 'scrum', 'waterfall',
    'testing', 'unit test', 'integration test', 'design pattern',
    'design patterns', 'solid', 'uml', 'requirement', 'requirements',
    'version control', 'git', 'debugging', 'refactoring', 'ci cd'
  ]
};

/**
 * Extract meaningful technical keywords from a natural-language query.
 * "I want to learn all type of sorting algorithm in DSA" → ["sorting", "algorithm", "dsa"]
 */
function extractKeywords(query: string): string[] {
  const lower = query.toLowerCase().trim();
  const tokens = lower
    .replace(/[^a-z0-9#+\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const keywords = tokens.filter(t => !FILLER_WORDS.has(t) && t.length > 1);

  // Also extract multi-word phrases that match domain keywords
  const phrases: string[] = [];
  for (const domainKeys of Object.values(DOMAIN_KEYWORDS)) {
    for (const phrase of domainKeys) {
      if (phrase.includes(' ') && lower.includes(phrase)) {
        phrases.push(phrase);
      }
    }
  }

  return [...new Set([...keywords, ...phrases])];
}

/**
 * Detect which database domains are relevant based on extracted keywords.
 */
function detectDomains(keywords: string[]): string[] {
  const matchedDomains = new Set<string>();
  const keywordsLower = keywords.map(k => k.toLowerCase());

  for (const [domain, domainKeywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const dk of domainKeywords) {
      // Check if any extracted keyword matches a domain keyword
      if (keywordsLower.includes(dk)) {
        matchedDomains.add(domain);
        continue;
      }
      // Check if any keyword is a substring of a domain keyword or vice versa
      for (const kw of keywordsLower) {
        if (kw.length > 2 && (dk.includes(kw) || kw.includes(dk))) {
          matchedDomains.add(domain);
        }
      }
    }
  }

  return Array.from(matchedDomains);
}

// Lazy-initialized Fuse index for definition searching
let definitionFuse: Fuse<CachedTerm> | null = null;
let defFuseSignature = '';

function getDefinitionFuse(terms: CachedTerm[]): Fuse<CachedTerm> {
  const sig = `def:${terms.length}:${terms[0]?.id || ''}`;
  if (!definitionFuse || sig !== defFuseSignature) {
    definitionFuse = new Fuse(terms, {
      keys: [
        { name: 'term', weight: 0.4 },
        { name: 'definition', weight: 0.5 },
        { name: 'aliases', weight: 0.1 }
      ],
      includeScore: true,
      threshold: 0.4,
      distance: 200
    });
    defFuseSignature = sig;
  }
  return definitionFuse;
}

/**
 * Smart candidate discovery — the main function that replaces the naive approach.
 * Uses keyword extraction, domain detection, and definition search to find
 * actually relevant terms for AI shortlisting.
 */
export function getSmartCandidates(query: string, limit = 80): CachedTerm[] {
  if (!termCache.isReady() || !query) return [];

  const terms = termCache.getTerms();
  const keywords = extractKeywords(query);
  const detectedDomains = detectDomains(keywords);

  console.log(`🧠 Smart Discovery — keywords: [${keywords.join(', ')}], domains: [${detectedDomains.join(', ')}]`);

  const uniqueResults: CachedTerm[] = [];
  const seenIds = new Set<string>();

  function addUnique(candidates: CachedTerm[]) {
    for (const c of candidates) {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        uniqueResults.push(c);
      }
    }
  }

  // === Strategy 1: Domain-based pull ===
  // If we detected domains, pull ALL terms from those domains (most relevant)
  if (detectedDomains.length > 0) {
    const domainTerms = terms.filter(t =>
      detectedDomains.includes(t.domain)
    );

    // Within domain terms, prioritize those whose name or definition contains a keyword
    const keywordMatches: CachedTerm[] = [];
    const others: CachedTerm[] = [];

    for (const t of domainTerms) {
      const termLower = t.term.toLowerCase();
      const defLower = t.definition.toLowerCase();
      const combined = termLower + ' ' + defLower;

      const hasKeyword = keywords.some(kw =>
        kw.length > 2 && combined.includes(kw)
      );

      if (hasKeyword) {
        keywordMatches.push(t);
      } else {
        others.push(t);
      }
    }

    // Keyword matches first, then remaining domain terms
    addUnique(keywordMatches);
    addUnique(others);
  }

  // === Strategy 2: Definition search across ALL domains ===
  // Search the combined term+definition index for each keyword
  for (const keyword of keywords) {
    if (keyword.length < 2) continue;
    const defResults = getDefinitionFuse(terms).search(keyword, { limit: 40 });
    addUnique(defResults.map(r => r.item));
  }

  // Also search the full query as a phrase
  const fullQueryResults = getDefinitionFuse(terms).search(query, { limit: 30 });
  addUnique(fullQueryResults.map(r => r.item));

  // === Strategy 3: Direct keyword containment in term names ===
  // Catches things that fuzzy search might miss
  const directMatches = terms.filter(t => {
    const termLower = t.term.toLowerCase();
    return keywords.some(kw => kw.length > 2 && termLower.includes(kw));
  });
  addUnique(directMatches);

  // === Strategy 4: Fuzzy fallback on term names ===
  const fuzzyResults = getTermFuse(terms).search(query, { limit: 30 });
  addUnique(fuzzyResults.map(r => r.item));

  console.log(`🧠 Smart Discovery — found ${uniqueResults.length} candidates (capped at ${limit})`);

  return uniqueResults.slice(0, limit);
}

export function bulkMatchTerms(inputs: string[]): MatchResult[] {
  return inputs.map(input => findClosestTerm(input));
}
