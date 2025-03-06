
import { RedditPost, RedditComment } from './types';
import { useToast, toast } from '@/hooks/use-toast';

// Simulated Reddit API call to fetch posts from a subreddit
export async function fetchSubredditPosts(
  subreddit: string, 
  timeRange: number = 7 // Default to 7 days
): Promise<RedditPost[]> {
  try {
    console.log(`Fetching posts from r/${subreddit} for the past ${timeRange} days`);
    
    // In a real app, this would be an actual API call
    // For demo purposes, let's simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a varying number of posts based on subreddit name
    const mockPosts = generateMockPosts(subreddit, timeRange);
    return mockPosts;
  } catch (error) {
    console.error('Error fetching subreddit posts:', error);
    toast({
      title: "Error",
      description: `Failed to fetch posts from r/${subreddit}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    return [];
  }
}

// Generate mock data for demonstration
function generateMockPosts(subreddit: string, timeRange: number): RedditPost[] {
  const now = Date.now() / 1000; // Current time in seconds (Unix timestamp)
  const postsCount = Math.floor(Math.random() * 10) + 5; // 5-15 posts
  
  const posts: RedditPost[] = [];
  
  for (let i = 0; i < postsCount; i++) {
    const postId = `post_${i}_${Math.random().toString(36).substring(7)}`;
    const createdTime = now - Math.random() * timeRange * 86400; // Random time within the range
    
    posts.push({
      id: postId,
      title: generatePostTitle(subreddit, i),
      content: generatePostContent(subreddit, i),
      author: `user_${Math.random().toString(36).substring(7)}`,
      score: Math.floor(Math.random() * 1000),
      comments: generateComments(3, postId, createdTime),
      permalink: `/r/${subreddit}/comments/${postId}`,
      created_utc: createdTime
    });
  }
  
  return posts;
}

// Helper to generate comments (recursive for replies)
function generateComments(
  depth: number, 
  postId: string, 
  parentTime: number, 
  parentId: string = ''
): RedditComment[] {
  if (depth <= 0) return [];
  
  const count = Math.floor(Math.random() * 5) + 1; // 1-5 comments
  const comments: RedditComment[] = [];
  
  for (let i = 0; i < count; i++) {
    const commentId = `comment_${i}_${Math.random().toString(36).substring(7)}`;
    const createdTime = parentTime + Math.random() * 86400 / 2; // Up to 12 hours after parent
    
    comments.push({
      id: commentId,
      body: generateCommentBody(),
      author: `user_${Math.random().toString(36).substring(7)}`,
      score: Math.floor(Math.random() * 100),
      replies: Math.random() > 0.7 ? generateComments(depth - 1, postId, createdTime, commentId) : [],
      permalink: `/r/subreddit/comments/${postId}/comment/${commentId}`,
      created_utc: createdTime
    });
  }
  
  return comments;
}

// Generate a post title that sometimes includes complaints
function generatePostTitle(subreddit: string, index: number): string {
  const titles = [
    `Just tried the new ${subreddit} service and it was great!`,
    `Is anyone else having issues with ${subreddit}?`,
    `${subreddit} customer service is terrible, I've been waiting for 2 weeks!`,
    `How to get the most out of your ${subreddit} experience`,
    `I'm done with ${subreddit}, switching to a competitor`,
    `${subreddit} saved my day, amazing experience!`,
    `Warning about ${subreddit} - major bugs in the latest update`,
    `Can't believe how bad ${subreddit} has become lately`,
    `${subreddit} pricing is outrageous now, any alternatives?`,
    `Best features of ${subreddit} that most people don't know about`,
    `Hate how ${subreddit} keeps changing the interface`,
    `${subreddit} crashed and I lost all my data!`,
    `The new ${subreddit} update is actually pretty good`,
    `${subreddit} needs to fix their broken payment system`,
    `Just had the worst experience with ${subreddit}`,
    `Long-time ${subreddit} user, but might be time to move on`,
    `${subreddit} support never responds to tickets`,
    `Is ${subreddit} down for anyone else?`,
    `Really confused by ${subreddit}'s new policy`,
    `${subreddit} completely ignored my refund request`
  ];
  
  return titles[index % titles.length];
}

// Generate post content with varying sentiment and complaint patterns
function generatePostContent(subreddit: string, index: number): string {
  const contents = [
    `I've been using ${subreddit} for years and I've always been satisfied with the service. The recent updates have only made it better!`,
    
    `Has anyone else noticed how ${subreddit} has been getting worse lately? The app crashes constantly, customer service is unresponsive, and they keep raising prices. I'm really disappointed.`,
    
    `I don't understand why ${subreddit} decided to change their interface again. It's confusing, unintuitive, and makes everything harder to find. Seriously considering canceling my subscription.`,
    
    `The latest ${subreddit} update is full of bugs. My account keeps getting logged out, features are missing, and sometimes it won't even load. Fix your product before adding new features!`,
    
    `I've been having a great experience with ${subreddit} so far. Their customer service was quick to respond when I had an issue, and the product itself works exactly as advertised.`,
    
    `Does anybody else hate the new ${subreddit} redesign? It's like they didn't even test it with real users. Basic functionality is broken and everything takes more clicks now.`,
    
    `${subreddit} charged me twice for the same service and now they're refusing to refund the duplicate charge. This is absolutely unacceptable and probably illegal.`,
    
    `I want to thank the ${subreddit} team for their amazing work. The recent performance improvements have made a huge difference!`,
    
    `The problem with ${subreddit} is that they clearly don't care about their users anymore. It's all about maximizing profit now. The quality has tanked while prices keep going up.`,
    
    `After the latest update, ${subreddit} is unusable on my device. It freezes, crashes, and sometimes doesn't even open. I've already reached out to support but no response for days.`
  ];
  
  return contents[index % contents.length];
}

// Generate a comment body with various sentiments and complaint patterns
function generateCommentBody(): string {
  const comments = [
    "I completely agree with you. Having the exact same issues.",
    
    "That hasn't been my experience at all. Everything works fine for me.",
    
    "Have you tried contacting customer support? They resolved my problem quickly.",
    
    "This is exactly why I stopped using their service last year. Nothing has improved.",
    
    "I think you're overreacting. It's not perfect but it's not terrible either.",
    
    "WORST. SERVICE. EVER. I hate everything about it and regret ever signing up.",
    
    "Thanks for posting this. I thought I was the only one having these problems!",
    
    "The developers clearly don't use their own product. How could they miss such obvious issues?",
    
    "I've actually found a workaround for this problem. DM me if you want details.",
    
    "Can't believe they expect us to pay for this level of service. Absolutely disappointing.",
    
    "I've been using this service for years and never had any issues. Maybe it's your setup?",
    
    "Their support team is useless. I've been trying to get help for weeks with no solution.",
    
    "Switched to a competitor and couldn't be happier. Don't waste your time with this.",
    
    "The new version fixed most of the issues I was having before.",
    
    "Completely broken on my end too. Going to request a refund.",
    
    "This used to be so good. What happened to the quality?",
    
    "Everyone complaining here needs to calm down. It's not that serious.",
    
    "Garbage service with garbage support. Avoid at all costs.",
    
    "Has anyone found an alternative that actually works properly?",
    
    "After the latest update my account was completely broken. Had to start over from scratch."
  ];
  
  return comments[Math.floor(Math.random() * comments.length)];
}
