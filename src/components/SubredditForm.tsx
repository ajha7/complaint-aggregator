
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SubredditFormProps {
  onAnalyze: (subreddit: string, timeRange: number) => void;
  isLoading: boolean;
}

const SubredditForm: React.FC<SubredditFormProps> = ({ onAnalyze, isLoading }) => {
  const [subreddit, setSubreddit] = useState('');
  const [timeRange, setTimeRange] = useState('3');
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subreddit.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subreddit name",
        variant: "destructive"
      });
      return;
    }
    
    // Clean the subreddit input (remove r/ if present)
    const cleanSubreddit = subreddit.trim().replace(/^r\//, '');
    onAnalyze(cleanSubreddit, parseInt(timeRange));
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto glass p-6 space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Analyze Subreddit Complaints</h2>
        <p className="text-muted-foreground">
          Enter a subreddit name to identify and analyze complaints
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subreddit">Subreddit</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              r/
            </span>
            <Input
              id="subreddit"
              placeholder="subreddit"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="pl-8"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeRange">Time Range</Label>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last month</SelectItem>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Complaints'}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground text-center">
        Note: Analyzing large subreddits may take several minutes.
      </p>
    </Card>
  );
};

export default SubredditForm;
