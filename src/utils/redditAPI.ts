import { RedditPost, RedditComment } from './types';
import { toast } from '@/hooks/use-toast';

// Reddit API endpoints
const REDDIT_API_BASE = 'https://www.reddit.com';

/**
 * Fetches posts from a subreddit within a specified time range
 */
export async function fetchSubredditPosts(
  subreddit: string, 
  timeRangeMonths: number = 3,
  setProgress: (current: number, total: number, stage: string) => void
): Promise<RedditPost[]> {
  try {
    const posts: RedditPost[] = [];
    let after = null;
    let totalFetched = 0;
    const startTime = Math.floor(Date.now() / 1000) - (timeRangeMonths * 30 * 24 * 60 * 60);
    let shouldContinue = true;
    
    setProgress(0, 100, 'Fetching posts');

    while (shouldContinue) {
      const url = `${REDDIT_API_BASE}/r/${subreddit}/new.json?limit=100${after ? `&after=${after}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const children = data.data.children;
      after = data.data.after;
      
      if (!children || children.length === 0 || !after) {
        shouldContinue = false;
      }
      
      // Filter posts by date and map to our interface
      for (const child of children) {
        const post = child.data;
        
        if (post.created_utc < startTime) {
          shouldContinue = false;
          break;
        }
        
        posts.push({
          id: post.id,
          title: post.title,
          content: post.selftext,
          url: post.url,
          created_utc: post.created_utc,
          score: post.score,
          author: post.author,
          num_comments: post.num_comments,
          permalink: post.permalink,
          comments: [] // Will be populated later
        });
      }
      
      totalFetched += children.length;
      setProgress(totalFetched, totalFetched + 100, 'Fetching posts');
      
      // Reddit API rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Fetched ${posts.length} posts from r/${subreddit}`);
    return posts;
  } catch (error) {
    console.error('Error fetching subreddit posts:', error);
    toast({
      title: "Error",
      description: `Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    return [];
  }
}

/**
 * Fetches all comments for a specific post
 */
export async function fetchPostComments(
  post: RedditPost,
  setProgress: (current: number, total: number, stage: string) => void,
  currentPost: number,
  totalPosts: number
): Promise<RedditComment[]> {
  try {
    const url = `${REDDIT_API_BASE}${post.permalink}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length < 2) {
      return [];
    }
    
    // The second element contains the comments
    const commentsData = data[1].data.children;
    const comments: RedditComment[] = parseComments(commentsData);
    
    setProgress(currentPost, totalPosts, `Fetching comments (${currentPost}/${totalPosts})`);
    
    // Reddit API rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return comments;
  } catch (error) {
    console.error(`Error fetching comments for post ${post.id}:`, error);
    // Don't show toast for every comment error to avoid spamming the user
    return [];
  }
}

/**
 * Recursively parses comment data
 */
function parseComments(commentsData: any[]): RedditComment[] {
  if (!commentsData || commentsData.length === 0) {
    return [];
  }
  
  return commentsData
    .filter(comment => comment.kind === 't1') // Only include actual comments
    .map(comment => {
      const data = comment.data;
      
      const parsedComment: RedditComment = {
        id: data.id,
        body: data.body,
        author: data.author,
        score: data.score,
        created_utc: data.created_utc,
        permalink: data.permalink,
        replies: []
      };
      
      // Parse replies if they exist
      if (data.replies && data.replies.data && data.replies.data.children) {
        parsedComment.replies = parseComments(data.replies.data.children);
      }
      
      return parsedComment;
    });
}

/**
 * Fetches all posts and their comments from a subreddit
 */
export async function fetchSubredditData(
  subreddit: string,
  timeRangeMonths: number = 3,
  setProgress: (current: number, total: number, stage: string) => void
): Promise<RedditPost[]> {
  // First, fetch all posts
  const posts = await fetchSubredditPosts(subreddit, timeRangeMonths, setProgress);
  
  if (posts.length === 0) {
    return [];
  }
  
  // Then, fetch comments for each post
  const postsWithComments: RedditPost[] = [];
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const comments = await fetchPostComments(post, setProgress, i + 1, posts.length);
    
    postsWithComments.push({
      ...post,
      comments
    });
  }
  
  return postsWithComments;
}
