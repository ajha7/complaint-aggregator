
import { RedditPost, RedditComment, Complaint, ComplaintCluster } from './types';
import { toast } from '@/hooks/use-toast';

// Expanded list of complaint indicators, categorized by type
const COMPLAINT_CATEGORIES = {
  PRODUCT_ISSUES: [
    'broken', 'bug', 'glitch', 'crash', 'freezes', 'hangs', 'slow', 'laggy',
    'unresponsive', 'doesn\'t work', 'not working', 'doesn\'t load', 'can\'t access',
    'feature request', 'missing feature', 'needs improvement'
  ],
  SERVICE_QUALITY: [
    'poor service', 'bad service', 'terrible service', 'customer service',
    'response time', 'waiting', 'no response', 'never responded', 'ignored',
    'unprofessional', 'rude', 'unhelpful'
  ],
  PRICING_CONCERNS: [
    'expensive', 'overpriced', 'not worth', 'waste of money', 'refund',
    'price increase', 'cost too much', 'paying too much', 'charge too much',
    'subscription', 'hidden fees', 'unexpected charges'
  ],
  USER_EXPERIENCE: [
    'confusing', 'complicated', 'hard to use', 'difficult to navigate', 'unintuitive',
    'can\'t figure out', 'frustrating experience', 'bad design', 'poor design',
    'bad UI', 'bad UX', 'difficult to understand'
  ],
  RELIABILITY_ISSUES: [
    'unreliable', 'inconsistent', 'stops working', 'keeps crashing',
    'always down', 'outage', 'downtime', 'server issues', 'maintenance',
    'connection issues', 'disconnects', 'timeouts'
  ],
  DISSATISFACTION: [
    'disappointed', 'disappointed with', 'dissatisfied', 'unhappy', 'upset',
    'terrible', 'horrible', 'awful', 'bad', 'worst', 'sucks', 'hate',
    'regret', 'waste of time', 'would not recommend', 'don\'t recommend'
  ]
};

// Comprehensive list of all complaint indicators flattened
const ALL_COMPLAINT_INDICATORS = Object.values(COMPLAINT_CATEGORIES).flat();

// List of strongly negative terms to flag for the "hate/negative" filter
const NEGATIVE_TERMS = [
  'hate', 'despise', 'loathe', 'terrible', 'worst', 'garbage', 'trash',
  'useless', 'awful', 'pathetic', 'horrible', 'disaster', 'disgusting',
  'appalling', 'atrocious', 'abysmal', 'deplorable', 'dreadful', 'intolerable',
  'abomination', 'catastrophe', 'nightmare', 'horrific', 'repulsive', 'contempt',
  'revolting', 'inexcusable', 'unforgivable', 'ridiculous', 'scam', 'fraud'
];

// Simple sentiment analysis dictionary (expanded)
const SENTIMENT_DICTIONARY = {
  // Negative terms (with weights)
  'hate': -5, 'terrible': -4, 'awful': -4, 'horrible': -4, 'worst': -4,
  'bad': -3, 'poor': -3, 'disappointed': -3, 'disappointing': -3, 'useless': -3,
  'waste': -3, 'problem': -2, 'issue': -2, 'difficult': -2, 'frustrating': -2,
  'expensive': -2, 'overpriced': -2, 'slow': -2, 'broken': -3, 'bug': -2,
  'glitch': -2, 'error': -2, 'crash': -3, 'freezes': -3, 'annoying': -2,
  'confusing': -2, 'confused': -2, 'complicated': -2, 'sucks': -4, 'garbage': -4, 
  'trash': -4, 'disaster': -4
  
  // Positive terms (with weights)
  'good': 2, 'great': 3, 'excellent': 4, 'amazing': 4, 'awesome': 4,
  'love': 5, 'like': 2, 'helpful': 3, 'works': 2, 'working': 2,
  'easy': 2, 'simple': 2, 'fast': 2, 'quick': 2, 'reliable': 3,
  'worth': 2, 'recommend': 3, 'satisfied': 3, 'happy': 3, 'pleased': 3,
  'perfect': 4, 'fantastic': 4, 'brilliant': 4, 'superb': 4
};

// Linguistic negation terms that can flip sentiment
const NEGATION_TERMS = [
  'not', 'no', 'never', 'don\'t', 'doesn\'t', 'didn\'t', 'can\'t', 'cannot',
  'couldn't', 'shouldn't', 'wouldn't', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t'
];

/**
 * Enhanced text analysis to detect complaints using multiple signals
 * This provides a more nuanced and accurate assessment than simple keyword matching
 */
function analyzeText(text: string): { 
  isComplaint: boolean; 
  confidence: number; 
  category?: string;
  sentiment: number;
  containsNegativeTerms: boolean;
} {
  if (!text || text.length < 5) {
    return { 
      isComplaint: false, 
      confidence: 0, 
      sentiment: 0,
      containsNegativeTerms: false 
    };
  }
  
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);
  
  // Check for strongly negative terms first
  const containsNegativeTerms = NEGATIVE_TERMS.some(term => textLower.includes(term));
  
  // Category detection
  let detectedCategory = '';
  let highestCategoryMatches = 0;
  
  for (const [category, indicators] of Object.entries(COMPLAINT_CATEGORIES)) {
    const categoryMatches = indicators.filter(indicator => textLower.includes(indicator)).length;
    if (categoryMatches > highestCategoryMatches) {
      highestCategoryMatches = categoryMatches;
      detectedCategory = category;
    }
  }
  
  // Check all complaint indicators for general complaint detection
  let complaintIndicatorsFound = 0;
  for (const indicator of ALL_COMPLAINT_INDICATORS) {
    if (textLower.includes(indicator)) {
      complaintIndicatorsFound++;
    }
  }
  
  // Calculate complaint confidence
  const indicatorRatio = complaintIndicatorsFound / (ALL_COMPLAINT_INDICATORS.length * 0.1);
  const confidence = Math.min(Math.max(indicatorRatio, 0), 1);
  
  // More sophisticated sentiment analysis
  let sentiment = 0;
  let negationActive = false;
  
  // Process text for sentiment with negation handling
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-z']/g, ''); // Clean punctuation
    
    // Check for negation
    if (NEGATION_TERMS.includes(word)) {
      negationActive = true;
      continue;
    }
    
    // Apply sentiment with negation logic
    if (SENTIMENT_DICTIONARY[word]) {
      const sentimentValue = SENTIMENT_DICTIONARY[word];
      sentiment += negationActive ? -sentimentValue : sentimentValue;
      negationActive = false; // Reset negation after applying to a sentiment word
    }
    
    // Reset negation after 3 words if not used
    if (negationActive && i > 0 && (i % 3 === 0)) {
      negationActive = false;
    }
  }
  
  // Normalize sentiment to a scale from -1 to 1
  sentiment = sentiment / (Math.abs(sentiment) + 5);
  
  // Use multiple signals to determine if text is a complaint
  // 1. Contains complaint indicators
  // 2. Has negative sentiment
  // 3. Contains strongly negative terms
  const isComplaint = (
    complaintIndicatorsFound > 0 || 
    sentiment < -0.2 ||
    containsNegativeTerms
  );
  
  return { 
    isComplaint, 
    confidence: isComplaint ? Math.max(confidence, 0.3) : 0, 
    category: detectedCategory || undefined,
    sentiment,
    containsNegativeTerms
  };
}

/**
 * Recursively processes comments to find complaints
 */
function processComments(
  comments: RedditComment[], 
  postId: string, 
  complaints: Complaint[]
): Complaint[] {
  for (const comment of comments) {
    const analysis = analyzeText(comment.body);
    
    if (analysis.isComplaint) {
      complaints.push({
        id: `comment-${comment.id}`,
        text: comment.body,
        source: {
          type: 'comment',
          id: comment.id,
          author: comment.author,
          score: comment.score,
          permalink: comment.permalink,
          created_utc: comment.created_utc
        },
        score: comment.score,
        confidence: analysis.confidence,
        category: analysis.category,
        sentiment: analysis.sentiment,
        containsNegativeTerms: analysis.containsNegativeTerms
      });
    }
    
    // Process replies recursively
    if (comment.replies && comment.replies.length > 0) {
      processComments(comment.replies, postId, complaints);
    }
  }
  
  return complaints;
}

/**
 * Extracts complaints from Reddit posts and comments using enhanced NLP techniques
 */
export function extractComplaints(
  posts: RedditPost[],
  setProgress: (current: number, total: number, stage: string) => void
): Complaint[] {
  try {
    const allComplaints: Complaint[] = [];
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      setProgress(i + 1, posts.length, `Analyzing post ${i + 1}/${posts.length}`);
      
      // Check if the post itself contains a complaint
      const analysis = analyzeText(post.title + ' ' + post.content);
      
      if (analysis.isComplaint) {
        allComplaints.push({
          id: `post-${post.id}`,
          text: post.title + (post.content ? '\n' + post.content : ''),
          source: {
            type: 'post',
            id: post.id,
            author: post.author,
            score: post.score,
            permalink: post.permalink,
            created_utc: post.created_utc
          },
          score: post.score,
          confidence: analysis.confidence,
          category: analysis.category,
          sentiment: analysis.sentiment,
          containsNegativeTerms: analysis.containsNegativeTerms
        });
      }
      
      // Process all comments for the post
      processComments(post.comments, post.id, allComplaints);
    }
    
    console.log(`Found ${allComplaints.length} complaints in ${posts.length} posts`);
    console.log(`Negative terms found in ${allComplaints.filter(c => c.containsNegativeTerms).length} complaints`);
    
    return allComplaints;
  } catch (error) {
    console.error('Error extracting complaints:', error);
    toast({
      title: "Error",
      description: `Failed to analyze complaints: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    return [];
  }
}

/**
 * This function is kept from the original implementation
 */
function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  
  // Tokenize and normalize
  const getTokens = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 3);
  };
  
  const tokensA = new Set(getTokens(textA));
  const tokensB = new Set(getTokens(textB));
  
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  // Calculate Jaccard similarity
  const intersection = new Set([...tokensA].filter(token => tokensB.has(token)));
  const union = new Set([...tokensA, ...tokensB]);
  
  return intersection.size / union.size;
}

/**
 * Clusters similar complaints together and adds sentiment analysis
 */
export function clusterComplaints(
  complaints: Complaint[],
  setProgress: (current: number, total: number, stage: string) => void
): ComplaintCluster[] {
  try {
    const clusters: ComplaintCluster[] = [];
    const SIMILARITY_THRESHOLD = 0.25; // Adjust based on your needs
    
    for (let i = 0; i < complaints.length; i++) {
      setProgress(i + 1, complaints.length, `Clustering complaints ${i + 1}/${complaints.length}`);
      const complaint = complaints[i];
      let foundCluster = false;
      
      // Check if this complaint is similar to any existing cluster
      for (const cluster of clusters) {
        // Compare to the summary or to each complaint in the cluster
        const similarityToSummary = calculateTextSimilarity(complaint.text, cluster.summary);
        
        if (similarityToSummary >= SIMILARITY_THRESHOLD) {
          cluster.complaints.push(complaint);
          cluster.totalScore += complaint.score;
          cluster.frequency += 1;
          
          // Update sentiment averages
          const totalSentiment = (cluster.avgSentiment || 0) * (cluster.complaints.length - 1) + 
                                (complaint.sentiment || 0);
          cluster.avgSentiment = totalSentiment / cluster.complaints.length;
          
          // Update negative terms count
          if (complaint.containsNegativeTerms) {
            cluster.negativeTermsCount = (cluster.negativeTermsCount || 0) + 1;
          }
          
          // Carry over the category from the complaint if the cluster doesn't have one
          if (!cluster.category && complaint.category) {
            cluster.category = complaint.category;
          }
          
          foundCluster = true;
          break;
        }
        
        // If not similar to summary, check similarity with each complaint in the cluster
        if (!foundCluster) {
          for (const existingComplaint of cluster.complaints) {
            const similarity = calculateTextSimilarity(complaint.text, existingComplaint.text);
            if (similarity >= SIMILARITY_THRESHOLD) {
              cluster.complaints.push(complaint);
              cluster.totalScore += complaint.score;
              cluster.frequency += 1;
              
              // Update sentiment averages
              const totalSentiment = (cluster.avgSentiment || 0) * (cluster.complaints.length - 1) + 
                                    (complaint.sentiment || 0);
              cluster.avgSentiment = totalSentiment / cluster.complaints.length;
              
              // Update negative terms count
              if (complaint.containsNegativeTerms) {
                cluster.negativeTermsCount = (cluster.negativeTermsCount || 0) + 1;
              }
              
              // Carry over the category from the complaint if the cluster doesn't have one
              if (!cluster.category && complaint.category) {
                cluster.category = complaint.category;
              }
              
              foundCluster = true;
              break;
            }
          }
        }
        
        if (foundCluster) break;
      }
      
      // If no similar cluster found, create a new one
      if (!foundCluster) {
        clusters.push({
          id: `cluster-${clusters.length + 1}`,
          summary: complaint.text,
          complaints: [complaint],
          totalScore: complaint.score,
          frequency: 1,
          avgSentiment: complaint.sentiment || 0,
          negativeTermsCount: complaint.containsNegativeTerms ? 1 : 0,
          category: complaint.category
        });
      }
    }
    
    // Sort clusters by frequency and then by total score
    return clusters.sort((a, b) => {
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }
      return b.totalScore - a.totalScore;
    });
  } catch (error) {
    console.error('Error clustering complaints:', error);
    toast({
      title: "Error",
      description: `Failed to cluster complaints: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    return [];
  }
}

/**
 * Generates a summary for each cluster
 * In a real app, you'd use an LLM or summarization model
 */
export function summarizeClusters(clusters: ComplaintCluster[]): ComplaintCluster[] {
  // For simplicity, we'll use the first complaint text as the summary
  // In a real application, you'd use a proper summarization model
  return clusters.map(cluster => {
    // Find the highest scored complaint
    const highestScoredComplaint = cluster.complaints.reduce(
      (highest, current) => current.score > highest.score ? current : highest,
      cluster.complaints[0]
    );
    
    return {
      ...cluster,
      summary: highestScoredComplaint.text.length > 100 
        ? highestScoredComplaint.text.substring(0, 100) + '...'
        : highestScoredComplaint.text
    };
  });
}
