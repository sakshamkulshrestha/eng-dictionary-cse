export interface Concept {
  id: string;
  term: string;
  domain: string;
  definition_short: string;
  definition_detailed: string;
  logic_deep?: string;
  analogy: string;
  examples: string[];
  related_terms: string[];
  prerequisites: string[];
  advanced_topics?: string[];
  image_query: string;
  syntax_or_example?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  category: 'Core' | 'Extended';
  breadcrumbs?: string[];
  comparisons?: { target: string; note: string }[];
  common_misconceptions?: string[];
}

export interface RoadmapStep {
  term: string;
  reason: string;
  order: number;
}

export interface Roadmap {
  id: string;
  query: string;
  steps: RoadmapStep[];
  createdAt: number;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: 'standard' | 'large' | 'small' | 'medium';
  fontFamily: 'default' | 'sans' | 'system' | 'dyslexic';
  focusMode: boolean;
  autoExpandDetails: boolean;
  accentColor?: string;
  reduceMotion?: boolean;
  autoSpeak?: boolean;
}

export interface UserState {
  bookmarks: string[];
  history: string[];
  roadmaps: Roadmap[];
  settings: UserSettings;
}

export type LayoutState = 'grid' | 'list' | 'detail';
