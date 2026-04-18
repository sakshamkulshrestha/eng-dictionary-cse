export interface Concept {
  id: string;
  term: string;
  domain: string;
  one_line_definition?: string;
  technical_definition?: string;
  explanation?: string;
  syntax_or_example?: string;
  real_world_analogy?: string;
  computer_analogy?: string;
  common_misconception?: string[];
  suggested_related_terms?: string[];
  prerequisites?: string[];
  next_steps?: string[];
  comparisons?: { target: string; note: string; winner_scenario?: string }[];
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
