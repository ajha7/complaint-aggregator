
import React, { useState } from 'react';
import Header from '@/components/Header';
import SubredditForm from '@/components/SubredditForm';
import LoadingState from '@/components/LoadingState';
import ComplaintsDashboard from '@/components/ComplaintsDashboard';
import { AnalysisState, RedditPost, Complaint, ComplaintCluster } from '@/utils/types';
import { fetchSubredditData } from '@/utils/redditAPI';
import { extractComplaints, clusterComplaints, summarizeClusters } from '@/utils/complaintAnalysis';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    progress: {
      current: 0,
      total: 0,
      stage: ''
    }
  });

  // Helper to update progress
  const updateProgress = (current: number, total: number, stage: string) => {
    setAnalysisState(prev => ({
      ...prev,
      progress: {
        current,
        total,
        stage
      }
    }));
  };

  // Start the analysis process
  const handleAnalyze = async (subreddit: string, timeRange: number) => {
    try {
      // Reset state
      setAnalysisState({
        status: 'loading',
        subreddit,
        timeRange,
        progress: {
          current: 0,
          total: 100,
          stage: 'Initializing'
        }
      });

      // Step 1: Fetch all posts and comments
      updateProgress(0, 100, 'Fetching posts from r/' + subreddit);
      const posts = await fetchSubredditData(subreddit, timeRange, updateProgress);

      if (posts.length === 0) {
        toast.error(`No posts found in r/${subreddit} for the selected time range`);
        setAnalysisState(prev => ({ ...prev, status: 'error', error: 'No posts found' }));
        return;
      }

      // Step 2: Extract complaints
      updateProgress(0, posts.length, 'Analyzing posts and comments');
      const complaints = extractComplaints(posts, updateProgress);

      if (complaints.length === 0) {
        toast.warning(`No complaints detected in r/${subreddit}`);
      }

      // Step 3: Cluster similar complaints
      updateProgress(0, complaints.length, 'Clustering similar complaints');
      const clusters = clusterComplaints(complaints, updateProgress);

      // Step 4: Summarize clusters
      updateProgress(0, 100, 'Generating summaries');
      const summarizedClusters = summarizeClusters(clusters);

      // Analysis complete
      setAnalysisState({
        status: 'success',
        subreddit,
        timeRange,
        posts,
        complaints,
        clusters: summarizedClusters,
        lastUpdated: Date.now(),
        progress: {
          current: 100,
          total: 100,
          stage: 'Complete'
        }
      });

      toast.success(`Analysis of r/${subreddit} complete`, {
        description: `Found ${complaints.length} complaints in ${posts.length} posts`
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAnalysisState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  // Render loading state
  const renderLoadingState = () => (
    <LoadingState
      stage={analysisState.progress.stage}
      current={analysisState.progress.current}
      total={analysisState.progress.total}
      className="py-24"
    />
  );

  // Render the results
  const renderResults = () => {
    if (!analysisState.clusters || !analysisState.subreddit || !analysisState.timeRange) {
      return null;
    }

    return (
      <ComplaintsDashboard
        clusters={analysisState.clusters}
        subreddit={analysisState.subreddit}
        timeRange={analysisState.timeRange}
      />
    );
  };

  // Render main content based on state
  const renderContent = () => {
    switch (analysisState.status) {
      case 'loading':
        return renderLoadingState();
      case 'success':
        return renderResults();
      case 'error':
        return (
          <div className="py-16 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Analysis Failed</h2>
            <p className="text-muted-foreground mb-6">{analysisState.error}</p>
            <SubredditForm onAnalyze={handleAnalyze} isLoading={false} />
          </div>
        );
      default:
        return (
          <div className="py-16 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 animate-fade-in">Reddit Complaint Analyzer</h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Identify, analyze, and aggregate complaints from any subreddit
            </p>
            <SubredditForm onAnalyze={handleAnalyze} isLoading={false} />
            
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="glass p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Comprehensive Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Analyzes every post and comment from the past 3 months
                </p>
              </div>
              
              <div className="glass p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Smart Aggregation</h3>
                <p className="text-muted-foreground text-sm">
                  Groups similar complaints to identify patterns and trends
                </p>
              </div>
              
              <div className="glass p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Insightful Visualization</h3>
                <p className="text-muted-foreground text-sm">
                  Clear visualizations to understand the most common complaints
                </p>
              </div>
            </div>

            <div id="about" className="mt-24 max-w-2xl mx-auto text-left glass p-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">About This Tool</h2>
              <p className="mb-4">
                The Reddit Complaint Analyzer helps product managers, community moderators, and researchers identify common complaints and issues within any subreddit. By analyzing user feedback at scale, it provides valuable insights into what your users or community members are struggling with.
              </p>
              <p className="mb-4">
                This tool uses natural language processing to detect complaints in text and clusters similar complaints together. It then ranks these clusters by both frequency (how many people mentioned similar issues) and impact (based on upvotes).
              </p>
              <p>
                Simply enter a subreddit name and the desired time range, and let the analyzer do the work. The process may take a few minutes for large subreddits, but the comprehensive insights are worth the wait.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4">
        {renderContent()}
      </main>
      <footer className="border-t border-border/40 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Reddit Complaint Analyzer. Not affiliated with Reddit, Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
