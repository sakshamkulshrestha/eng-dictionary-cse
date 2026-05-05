/**
 * Normalizes a term for highly tolerant matching operations.
 * 
 * Rules:
 * 1. Lowercases the string
 * 2. Removes all non-alphanumeric characters except spaces (removes -, /, etc)
 * 3. Collapses multiple spaces into a single space
 * 4. Trims leading and trailing spaces
 * 5. Simple pluralization stripping (e.g. 'trees' -> 'tree', 'tables' -> 'table', 'apis' -> 'api')
 */
export function normalizeTerm(term: string): string {
  if (!term) return '';

  let normalized = term.toLowerCase();

  // Remove specific common punctuation often used inside technical terms
  // Example: TCP/IP -> tcpip
  normalized = normalized.replace(/[\/\-\\.,;_!@#$%^&*()+=[\]{}|<>?"']/g, ' ');

  // Special cases for technical terms
  // C++ and C# get their special chars stripped by above, let's preserve them or map them
  // Actually, wait: it's better to preserve + and # but let's see. 
  // If we remove + and #, "C++" becomes "c". So we should NOT strip + and #. Let's adjust the regex.

  // Custom substitution for known tricky technical characters before general punctuation strip
  normalized = term.toLowerCase();

  // Special handling for dots in things like Node.js -> nodejs
  normalized = normalized.replace(/\.js/g, 'js');

  // Strip all punctuation EXCEPT + and # to preserve C++, C#
  normalized = normalized.replace(/[^\w\s+#]/g, ' ');

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Basic singularization for typical technical plurals (s, es)
  // Trees -> tree, Tables -> table. Just a very basic heuristic:
  // if length > 3 and ends with "ies", replace with "y"
  if (normalized.length > 3 && normalized.endsWith('ies')) {
    normalized = normalized.substring(0, normalized.length - 3) + 'y';
  } else if (normalized.length > 3 && normalized.endsWith('es') && !normalized.endsWith('ss')) {
    normalized = normalized.substring(0, normalized.length - 1); // remove the s
  } else if (normalized.length > 3 && normalized.endsWith('s') && !normalized.endsWith('ss') && !normalized.endsWith('us') && !normalized.endsWith('is')) {
    normalized = normalized.substring(0, normalized.length - 1);
  }

  // Final collapse and trim again 
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Strip ALL spaces for super-normalized comparison?
  // If we strip all spaces, "TCP IP" becomes "tcpip" and "TCP/IP" becomes "tcpip" -> EXACT MATCH
  // Let's create a second version that strips spaces completely for Layer 2.
  return normalized;
}

/**
 * Super normalization strips ALL whitespace to allow "Hash Table" to match "HashTable"
 */
export function superNormalizeTerm(term: string): string {
  return normalizeTerm(term).replace(/\s+/g, '');
}
