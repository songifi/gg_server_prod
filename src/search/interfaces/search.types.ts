export interface SuggestionResponse {
  text: string;
  score: number;
  source?: {
    type?: string;
    title?: string;
  };
  isSpellingCorrection?: boolean;
}

export interface SearchResult {
  hits: {
    id: string;
    score: number;
    type: string;
    source: any;
    highlight?: Record<string, string[]>;
  }[];
  total: number;
  facets: Record<string, Array<{ key: string; count: number }>>;
  page: number;
  limit: number;
}
