
  // Render the results
  const renderResults = () => {
    if (!analysisState.clusters || !analysisState.subreddit || !analysisState.timeRange) {
      return null;
    }

    return (
      <ComplaintsDashboard
        clusters={analysisState.clusters}
        subreddit={analysisState.subreddit}
        timeRange={Number(analysisState.timeRange)} // Convert string to number
      />
    );
  };
