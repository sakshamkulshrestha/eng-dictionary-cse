import Fuse from 'fuse.js';
import { Concept } from '../types';
import conceptsData from '../data/concepts.json';

const concepts = conceptsData as Concept[];

const fuseOptions = {
  keys: [
    { name: 'term', weight: 1.0 },
    { name: 'domain', weight: 0.5 },
    { name: 'definition_short', weight: 0.3 },
    { name: 'related_terms', weight: 0.2 },
  ],
  threshold: 0.3,
  includeScore: true,
  shouldSort: true,
};

const fuse = new Fuse(concepts, fuseOptions);

export const searchConcepts = (query: string) => {
  if (!query) return [];
  return fuse.search(query);
};

export const getConceptById = (id: string) => {
  return concepts.find(c => c.id === id);
};

export const getConceptsByDomain = (domain: string) => {
  return concepts.filter(c => c.domain === domain);
};

export const getAllDomains = () => {
  return Array.from(new Set(concepts.map(c => c.domain)));
};

export const getAllConcepts = () => {
  return concepts;
};
