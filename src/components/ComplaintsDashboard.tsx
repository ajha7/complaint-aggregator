
import React from 'react';
import { ComplaintCluster } from '@/utils/types';
import ComplaintsChart from './ComplaintsChart';
import ComplaintsList from './ComplaintsList';

interface ComplaintsDashboardProps {
  clusters: ComplaintCluster[];
  subreddit: string;
  timeRange: number;
}

const ComplaintsDashboard: React.FC<ComplaintsDashboardProps> = ({
  clusters,
  subreddit,
  timeRange
}) => {
  const topClusters = clusters.slice(0, 10);
  
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
          Analysis Complete
        </span>
        <h2 className="text-3xl font-bold mb-2">r/{subreddit}</h2>
        <p className="text-muted-foreground">
          Analysis of the last {timeRange} {timeRange === 1 ? 'month' : 'months'} revealed {clusters.length} complaint clusters from a total of {clusters.reduce((acc, cluster) => acc + cluster.complaints.length, 0)} individual complaints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplaintsChart clusters={topClusters} />
        
        <div className="space-y-4">
          <div className="glass p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Analysis Summary</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 p-4 rounded-lg">
                <dt className="text-muted-foreground text-sm">Total Complaints</dt>
                <dd className="text-2xl font-bold">
                  {clusters.reduce((acc, cluster) => acc + cluster.complaints.length, 0)}
                </dd>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <dt className="text-muted-foreground text-sm">Unique Clusters</dt>
                <dd className="text-2xl font-bold">{clusters.length}</dd>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <dt className="text-muted-foreground text-sm">Most Frequent</dt>
                <dd className="text-lg font-semibold truncate">
                  {clusters.length > 0 ? `${clusters[0].frequency} mentions` : 'N/A'}
                </dd>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <dt className="text-muted-foreground text-sm">Highest Scored</dt>
                <dd className="text-lg font-semibold truncate">
                  {clusters.length > 0 ? `${Math.max(...clusters.map(c => c.totalScore))} points` : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="glass p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Top Complaint</h3>
            {clusters.length > 0 ? (
              <div>
                <p className="mb-2">{clusters[0].summary}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{clusters[0].frequency} {clusters[0].frequency === 1 ? 'mention' : 'mentions'}</span>
                  <span>•</span>
                  <span>{clusters[0].totalScore} total points</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No complaints found</p>
            )}
          </div>
        </div>
      </div>
      
      <ComplaintsList clusters={clusters} />
    </div>
  );
};

export default ComplaintsDashboard;
