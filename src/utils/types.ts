
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
    created_utc: number; // Added this property
  };
  score: number;
  confidence: number;
  category?: string;
  sentiment?: number;
}

export interface ComplaintCluster {
  id: string;
  summary: string;
  complaints: Complaint[];
  totalScore: number;
  frequency: number;
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
  timeRange?: string; // Changed to string to match how it's used
  posts?: RedditPost[];
  complaints?: Complaint[];
  clusters?: ComplaintCluster[];
  lastUpdated?: number;
}
