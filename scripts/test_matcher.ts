import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../server/db.js';
import { termCache } from '../server/services/termCache.js';
import { findClosestTerm } from '../server/services/termMatcher.js';

async function runTests() {
  await connectDB();
  await termCache.preloadTerms();

  const testTerms = [
    "TCP/IP",               // Exact match or punctuation normalized
    "tcpip",                // Normalized
    "Binary Search Trees",  // Plural -> Singular
    "Rest Api",             // Case variation
    "hash tables",          // Plural / Case
    "Ram Memory",           // Fuzzy
    "C++",                  // Special characters
    "C#",                   // Special characters
    "Node.js",              // .js extension
    "OAuth 2.0",            // Special characters
    "Continue Statement",   // Compound -> "Continue"
    "Merge Sort Algorithm", // Compound -> "Merge Sort"
    "Prepared Statement",   // Compound -> "Prepared Statement" (exact multi-word)
    "Increment Operator",   // Should match "Increment Operator" exactly
  ];

  console.log('--- RUNNING MATCHER TESTS ---');
  for (const term of testTerms) {
    const res = findClosestTerm(term);
    console.log(`[Input: ${term.padEnd(20)}] => Matched: ${res.matched ? 'YES' : 'NO '} | DB Term: ${res.dbTerm?.padEnd(25)} | Score: ${res.score.toFixed(3)}`);
  }

  process.exit(0);
}

runTests();
