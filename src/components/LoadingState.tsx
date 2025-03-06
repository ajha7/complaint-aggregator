
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  stage: string;
  current: number;
  total: number;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  stage,
  current,
  total,
  className
}) => {
  const progress = total > 0 ? Math.floor((current / total) * 100) : 0;

  return (
    <div className={cn("w-full flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <div className="w-16 h-16 relative animate-spin-slow">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary opacity-75"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-opacity-50"></div>
      </div>
      
      <h3 className="text-xl font-medium mt-4 animate-pulse-opacity">{stage}</h3>
      
      <div className="w-full max-w-md">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {current} of {total > 0 ? total : '?'} ({progress}%)
        </p>
      </div>
      
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Analyzing large subreddits may take several minutes. Please be patient as we process all the data.
      </p>
    </div>
  );
};

export default LoadingState;
