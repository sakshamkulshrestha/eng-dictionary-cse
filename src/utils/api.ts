import { Concept, RoadmapStep } from '../types';

/**
 * Handles all backend API requests with consistent error semantics
 */
const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Network response was not ok';
      try {
        const errData = await response.json();
        errorMessage = errData.error || errorMessage;
      } catch (e) {
        // failed to parse json error, fallback to status text
        errorMessage = response.statusText;
      }
      throw new ApiError(response.status, errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other critical failure
    throw new Error(error.message || 'Failed to connect to API');
  }
}

export const DictionaryApi = {
  /**
   * Fetch all terms, optionally filtered by domain
   */
  async getTerms(): Promise<Concept[]> {
    return request<Concept[]>('/terms');
  },

  /**
   * Fetch a single term by its ID
   */
  async getTermById(id: string): Promise<Concept> {
    return request<Concept>(`/terms/${id}`);
  },

  /**
   * Search across all terms
   */
  async search(query: string): Promise<Concept[]> {
    return request<Concept[]>(`/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Chat interaction
   */
  async chat(message: string, contextBlock: string): Promise<{ text: string }> {
    return request<{ text: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, contextBlock })
    });
  },

  /**
   * Roadmap generation
   */
  async generateRoadmap(query: string): Promise<{ title: string, steps: RoadmapStep[] }> {
    return request<{ title: string, steps: RoadmapStep[] }>('/generate-roadmap', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  },

  /**
   * Smart Search History Analysis
   */
  async analyzeHistory(history: string[]): Promise<{ suggestions: { term: string, reason: string }[] }> {
    return request<{ suggestions: { term: string, reason: string }[] }>('/analyze-history', {
      method: 'POST',
      body: JSON.stringify({ history })
    });
  }
};
