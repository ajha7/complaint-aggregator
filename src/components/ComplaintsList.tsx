
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ComplaintCluster } from '@/utils/types';
import { Badge } from '@/components/ui/badge';

interface ComplaintsListProps {
  clusters: ComplaintCluster[];
}

const ComplaintsList: React.FC<ComplaintsListProps> = ({ clusters }) => {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'frequency' | 'score' | 'sentiment'>('frequency');
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);
  
  // Filter and sort clusters based on the selected options
  const filteredClusters = clusters
    .filter(cluster => !showNegativeOnly || (cluster.negativeTermsCount && cluster.negativeTermsCount > 0))
    .sort((a, b) => {
      if (sortBy === 'frequency') {
        return b.frequency - a.frequency;
      } else if (sortBy === 'score') {
        return b.totalScore - a.totalScore;
      } else {
        // Sort by sentiment (most negative first)
        return (a.avgSentiment || 0) - (b.avgSentiment || 0);
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

  // Get sentiment color based on value
  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'bg-gray-100 text-gray-800';
    if (sentiment < -0.6) return 'bg-red-100 text-red-800';
    if (sentiment < -0.3) return 'bg-orange-100 text-orange-800';
    if (sentiment < 0) return 'bg-yellow-100 text-yellow-800';
    if (sentiment > 0.3) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };
  
  // Format sentiment for display
  const formatSentiment = (sentiment?: number) => {
    if (sentiment === undefined) return 'Neutral';
    if (sentiment < -0.6) return 'Very Negative';
    if (sentiment < -0.3) return 'Negative';
    if (sentiment < 0) return 'Slightly Negative';
    if (sentiment > 0.3) return 'Positive';
    if (sentiment > 0) return 'Slightly Positive';
    return 'Neutral';
  };
  
  return (
    <Card className="glass p-6 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h3 className="text-xl font-medium">Complaint Clusters</h3>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center space-x-2">
            <Switch 
              id="negative-filter" 
              checked={showNegativeOnly}
              onCheckedChange={setShowNegativeOnly}
            />
            <Label htmlFor="negative-filter" className="cursor-pointer">
              Show hate/negative only
            </Label>
          </div>
          
          <Tabs defaultValue="frequency" onValueChange={(val) => setSortBy(val as 'frequency' | 'score' | 'sentiment')}>
            <TabsList>
              <TabsTrigger value="frequency">By Frequency</TabsTrigger>
              <TabsTrigger value="score">By Score</TabsTrigger>
              <TabsTrigger value="sentiment">By Sentiment</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="space-y-4 mt-4">
        {filteredClusters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {showNegativeOnly 
              ? 'No complaints containing extremely negative terms were found.' 
              : 'No complaints found. Either there are no complaints, or we need to improve our detection algorithm.'}
          </div>
        ) : (
          filteredClusters.map((cluster) => (
            <div 
              key={cluster.id}
              className="border border-border rounded-lg overflow-hidden transition-all duration-300"
            >
              <div 
                className="p-4 flex justify-between items-start cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(cluster.id)}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {cluster.frequency} {cluster.frequency === 1 ? 'mention' : 'mentions'}
                    </Badge>
                    <Badge variant="secondary">
                      {cluster.totalScore} points
                    </Badge>
                    {cluster.category && (
                      <Badge variant="outline" className="capitalize">
                        {cluster.category.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    )}
                    {cluster.avgSentiment !== undefined && (
                      <Badge variant="outline" className={getSentimentColor(cluster.avgSentiment)}>
                        {formatSentiment(cluster.avgSentiment)}
                      </Badge>
                    )}
                    {cluster.negativeTermsCount && cluster.negativeTermsCount > 0 && (
                      <Badge variant="destructive">
                        {cluster.negativeTermsCount} {cluster.negativeTermsCount === 1 ? 'hate term' : 'hate terms'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm line-clamp-2">{cluster.summary}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0 shrink-0">
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
                      <div 
                        key={complaint.id} 
                        className={`text-sm pl-3 py-1 border-l-2 ${
                          complaint.containsNegativeTerms 
                            ? 'border-destructive/70' 
                            : 'border-primary/60'
                        }`}
                      >
                        <p>{complaint.text}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span>by u/{complaint.source.author}</span>
                          <span>{complaint.score} points</span>
                          {complaint.source.created_utc && (
                            <span>{formatDate(complaint.source.created_utc)}</span>
                          )}
                          {complaint.sentiment !== undefined && (
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getSentimentColor(complaint.sentiment)}`}>
                              {formatSentiment(complaint.sentiment)}
                            </span>
                          )}
                          {complaint.containsNegativeTerms && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800">
                              Contains hate terms
                            </span>
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
