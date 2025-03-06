import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SubredditForm } from '@/components/SubredditForm';
import { ComplaintsDashboard } from '@/components/ComplaintsDashboard';
import { extractComplaints, clusterComplaints, summarizeClusters } from '@/utils/complaintAnalysis';
import { fetchSubredditPosts } from '@/utils/redditAPI';
import { ComplaintCluster } from '@/utils/types';
import { LoadingState } from '@/components/LoadingState';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; stage: string }>({
    current: 0,
    total: 0,
    stage: '',
  });
  
  // State to store analysis results
  const [analysisState, setAnalysisState] = useState<{
    subreddit?: string;
    timeRange?: number;
    clusters?: ComplaintCluster[];
  }>({});

  const handleAnalyzeSubreddit = async (subreddit: string, timeRange: string) => {
    try {
      setIsLoading(true);
      
      // Convert timeRange from string to number
      const timeRangeNumber = Number(timeRange);
      
      // Update state to indicate we're working on this subreddit
      setAnalysisState({
        subreddit,
        timeRange: timeRangeNumber,
        clusters: undefined,
      });
      
      // Helper function to update progress
      const updateProgress = (current: number, total: number, stage: string) => {
        setProgress({ current, total, stage });
      };
      
      // Step 1: Fetch posts from the subreddit
      updateProgress(0, 100, 'Fetching subreddit posts...');
      const posts = await fetchSubredditPosts(subreddit, timeRangeNumber);
      
      if (posts.length === 0) {
        toast({
          title: "No posts found",
          description: `No posts found for r/${subreddit} in the selected time range.`,
          variant: "default"
        });
        setIsLoading(false);
        return;
      }
      
      // Step 2: Extract complaints from posts
      updateProgress(0, posts.length, 'Analyzing posts and comments...');
      const complaints = extractComplaints(posts, updateProgress);
      
      if (complaints.length === 0) {
        toast({
          title: "No complaints found",
          description: `No complaints identified in r/${subreddit} posts.`,
          variant: "default"
        });
        setIsLoading(false);
        return;
      }
      
      // Step 3: Cluster similar complaints
      updateProgress(0, complaints.length, 'Clustering similar complaints...');
      const clusters = clusterComplaints(complaints, updateProgress);
      
      // Step 4: Summarize clusters
      const summarizedClusters = summarizeClusters(clusters);
      
      // Update state with results
      setAnalysisState({
        subreddit,
        timeRange: timeRangeNumber,
        clusters: summarizedClusters,
      });
      
      toast({
        title: "Analysis complete",
        description: `Found ${complaints.length} complaints across ${summarizedClusters.length} clusters.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the results
  const renderResults = () => {
    if (!analysisState.clusters || !analysisState.subreddit || !analysisState.timeRange) {
      return null;
    }

    return (
      <ComplaintsDashboard
        clusters={analysisState.clusters}
        subreddit={analysisState.subreddit}
        timeRange={analysisState.timeRange} // Now this is correctly a number
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SubredditForm onSubmit={handleAnalyzeSubreddit} isLoading={isLoading} />
        </div>
        
        {isLoading ? (
          <LoadingState 
            current={progress.current} 
            total={progress.total} 
            stage={progress.stage} 
          />
        ) : renderResults()}
      </main>
    </div>
  );
};

export default Index;
