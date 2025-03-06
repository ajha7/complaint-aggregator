
import { RedditPost, RedditComment, Complaint, ComplaintCluster } from './types';
import { toast } from '@/components/ui/sonner';

// A simple sentiment classifier using keywords (will be replaced with ML in a production app)
// This is a placeholder for demonstration - in a real app, you'd use a proper NLP model
const COMPLAINT_INDICATORS = [
  'issue', 'problem', 'bug', 'glitch', 'broken', 'error', 'trouble',
  'disappointed', 'disappointed with', 'dissatisfied', 'unhappy', 'upset',
  'terrible', 'horrible', 'awful', 'bad', 'worst', 'sucks', 'hate',
  'fix', 'needs to be fixed', 'should be fixed', 'doesn\'t work', 'not working',
  'doesn\'t load', 'can\'t access', 'can\'t use', 'useless', 'waste',
  'poor', 'low quality', 'disappointing', 'frustrating', 'annoying',
  'slow', 'laggy', 'crash', 'freezes', 'hangs', 'unresponsive',
  'overpriced', 'expensive', 'not worth', 'waste of money', 'refund',
  'customer service', 'support', 'response', 'waiting', 'no response',
  'misleading', 'false', 'deceptive', 'scam', 'fraud'
];

/**
 * Analyzes text to detect if it contains a complaint
 * In a real app, this would use NLP or ML models
 */
function detectComplaint(text: string): { isComplaint: boolean; confidence: number } {
  if (!text || text.length < 5) {
    return { isComplaint: false, confidence: 0 };
  }
  
  const textLower = text.toLowerCase();
  let complaintsFound = 0;
  
  for (const indicator of COMPLAINT_INDICATORS) {
    if (textLower.includes(indicator.toLowerCase())) {
      complaintsFound++;
    }
  }
  
  const confidence = complaintsFound / (COMPLAINT_INDICATORS.length * 0.2);
  return { 
    isComplaint: complaintsFound > 0, 
    confidence: Math.min(Math.max(confidence, 0), 1) 
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
    const { isComplaint, confidence } = detectComplaint(comment.body);
    
    if (isComplaint && confidence > 0.3) { // Threshold to reduce false positives
      complaints.push({
        id: `comment-${comment.id}`,
        text: comment.body,
        source: {
          type: 'comment',
          id: comment.id,
          author: comment.author,
          score: comment.score,
          permalink: comment.permalink
        },
        score: comment.score,
        confidence
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
 * Extracts complaints from Reddit posts and comments
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
      const { isComplaint, confidence } = detectComplaint(post.title + ' ' + post.content);
      
      if (isComplaint && confidence > 0.3) {
        allComplaints.push({
          id: `post-${post.id}`,
          text: post.title + (post.content ? '\n' + post.content : ''),
          source: {
            type: 'post',
            id: post.id,
            author: post.author,
            score: post.score,
            permalink: post.permalink
          },
          score: post.score,
          confidence
        });
      }
      
      // Process all comments for the post
      processComments(post.comments, post.id, allComplaints);
    }
    
    console.log(`Found ${allComplaints.length} complaints in ${posts.length} posts`);
    return allComplaints;
  } catch (error) {
    console.error('Error extracting complaints:', error);
    toast.error(`Failed to analyze complaints: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

/**
 * Simple text similarity function using Jaccard similarity
 * In a production app, you would use proper embeddings or NLP models
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
 * Clusters similar complaints together
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
          frequency: 1
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
    toast.error(`Failed to cluster complaints: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
