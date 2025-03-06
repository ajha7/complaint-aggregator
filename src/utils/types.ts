
// Basic Reddit types
export interface RedditPost {
  id: string;
  title: string;
  content: string;
  url: string;
  created_utc: number;
  score: number;
  author: string;
  num_comments: number;
  permalink: string;
  comments: RedditComment[];
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
  permalink: string;
  replies?: RedditComment[];
}

// Complaint analysis types
export interface Complaint {
  id: string;
  text: string;
  source: {
    type: 'post' | 'comment';
    id: string;
    author: string;
    score: number;
    permalink: string;
    created_utc: number;
  };
  score: number;
  confidence: number;
  category?: string;
  sentiment?: number; // Negative values indicate negative sentiment
  containsNegativeTerms?: boolean; // Flag for comments containing "hate" or equivalent terms
}

export interface ComplaintCluster {
  id: string;
  summary: string;
  complaints: Complaint[];
  totalScore: number;
  frequency: number;
  category?: string; // Added this property
  avgSentiment?: number; // Average sentiment of complaints in the cluster
  negativeTermsCount?: number; // Count of complaints with negative terms
}

// App state types
export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  progress: {
    current: number;
    total: number;
    stage: string;
  };
  error?: string;
  subreddit?: string;
  timeRange?: string; // String to match how it's used
  posts?: RedditPost[];
  complaints?: Complaint[];
  clusters?: ComplaintCluster[];
  lastUpdated?: number;
  filters?: {
    showNegativeOnly?: boolean;
  };
}
