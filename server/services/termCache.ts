import { getDB } from '../db.js';

export interface CachedTerm {
  id: string;
  term: string;
  domain: string;
  definition: string;
  normalized: string;
  superNormalized: string;
  aliases: string[];
}

class TermCache {
  private terms: CachedTerm[] = [];
  private isLoaded = false;

  public async preloadTerms() {
    if (this.isLoaded) return;

    console.log("⏳ Preloading terms into memory cache for instant matching...");
    try {
      const db = getDB();
      const collectionsInfo = await db.listCollections().toArray();
      const collections = collectionsInfo.filter((c: any) => c.name.endsWith('_terms'));

      const allTerms: CachedTerm[] = [];
      const { normalizeTerm, superNormalizeTerm } = await import('../utils/searchNormalization.js');

      for (const col of collections) {
        // Fetch all basic fields needed for matching to keep memory footprint low
        const data = await db.collection(col.name).find({}, {
          projection: { _id: 1, term: 1, domain: 1, aliases: 1, one_line_definition: 1 }
        }).toArray();

        for (const doc of data) {
          if (!doc.term || !doc.domain) continue;

          allTerms.push({
            id: doc._id.toString(),
            term: doc.term,
            domain: doc.domain,
            definition: doc.one_line_definition || '',
            normalized: normalizeTerm(doc.term),
            superNormalized: superNormalizeTerm(doc.term),
            aliases: doc.aliases ? (Array.isArray(doc.aliases) ? doc.aliases.map(a => normalizeTerm(a)) : [normalizeTerm(doc.aliases)]) : []
          });
        }
      }

      this.terms = allTerms;
      this.isLoaded = true;
      console.log(`✅ Cached ${this.terms.length} terms in memory for instant Search and AI matchmaking.`);
    } catch (error) {
      console.error("❌ Failed to preload term cache:", error);
    }
  }

  public getTerms(): CachedTerm[] {
    return this.terms;
  }

  public isReady(): boolean {
    return this.isLoaded;
  }
}

export const termCache = new TermCache();
