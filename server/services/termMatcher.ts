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
  const fuse = new Fuse(terms, {
    keys: ['term', 'normalized', 'aliases'], // Removed superNormalized to prevent substring collision false positives
    includeScore: true,
    threshold: 0.25,
    distance: 100
  });

  const fuseResults = fuse.search(input);
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

export function bulkMatchTerms(inputs: string[]): MatchResult[] {
  return inputs.map(input => findClosestTerm(input));
}
