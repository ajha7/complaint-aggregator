
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ComplaintCluster } from '@/utils/types';

interface ComplaintsListProps {
  clusters: ComplaintCluster[];
}

const ComplaintsList: React.FC<ComplaintsListProps> = ({ clusters }) => {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'frequency' | 'score'>('frequency');
  
  // Sort clusters based on the selected sort option
  const sortedClusters = [...clusters].sort((a, b) => {
    if (sortBy === 'frequency') {
      return b.frequency - a.frequency;
    } else {
      return b.totalScore - a.totalScore;
    }
  });
  
  const toggleExpand = (clusterId: string) => {
    setExpandedCluster(expandedCluster === clusterId ? null : clusterId);
  };
  
  // Format the date from UTC timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="glass p-6 w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Complaint Clusters</h3>
        
        <Tabs defaultValue="frequency" onValueChange={(val) => setSortBy(val as 'frequency' | 'score')}>
          <TabsList>
            <TabsTrigger value="frequency">By Frequency</TabsTrigger>
            <TabsTrigger value="score">By Score</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="space-y-4 mt-4">
        {sortedClusters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No complaints found. Either there are no complaints, or we need to improve our detection algorithm.
          </div>
        ) : (
          sortedClusters.map((cluster) => (
            <div 
              key={cluster.id}
              className="border border-border rounded-lg overflow-hidden transition-all duration-300"
            >
              <div 
                className="p-4 flex justify-between items-start cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(cluster.id)}
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {cluster.frequency} {cluster.frequency === 1 ? 'mention' : 'mentions'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {cluster.totalScore} points
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{cluster.summary}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform ${expandedCluster === cluster.id ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </Button>
              </div>
              
              {expandedCluster === cluster.id && (
                <div className="px-4 pb-4 pt-2 border-t border-border bg-background/50">
                  <h4 className="font-medium mb-2">Individual Complaints</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {cluster.complaints.map((complaint) => (
                      <div key={complaint.id} className="text-sm border-l-2 border-primary/60 pl-3 py-1">
                        <p>{complaint.text}</p>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                          <span>by u/{complaint.source.author}</span>
                          <span>{complaint.score} points</span>
                          {complaint.source.created_utc && (
                            <span>{formatDate(complaint.source.created_utc)}</span>
                          )}
                          <a 
                            href={`https://reddit.com${complaint.source.permalink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View on Reddit
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ComplaintsList;
