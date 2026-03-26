import { Concept } from '../types';
import conceptsData from '../data/concepts.json';

const concepts = conceptsData as Concept[];

/**
 * Generates a learning path for a given target term.
 * It traverses the prerequisite graph to find all necessary concepts.
 */
export const generateLearningPath = (targetTerm: string): Concept[] => {
  const path: Concept[] = [];
  const visited = new Set<string>();

  const traverse = (term: string) => {
    const concept = concepts.find(c => c.term.toLowerCase() === term.toLowerCase());
    if (!concept || visited.has(concept.id)) return;

    // First traverse prerequisites to build a bottom-up path
    if (concept.prerequisites && concept.prerequisites.length > 0) {
      concept.prerequisites.forEach(prereq => traverse(prereq));
    }

    if (!visited.has(concept.id)) {
      visited.add(concept.id);
      path.push(concept);
    }
  };

  traverse(targetTerm);
  return path;
};

/**
 * Suggests related concepts based on domain and shared prerequisites.
 */
export const getRelatedRecommendations = (conceptId: string): Concept[] => {
  const target = concepts.find(c => c.id === conceptId);
  if (!target) return [];

  return concepts
    .filter(c => c.id !== conceptId)
    .filter(c => 
      c.domain === target.domain || 
      c.prerequisites.some(p => target.prerequisites.includes(p)) ||
      target.related_terms.includes(c.term)
    )
    .slice(0, 5);
};
