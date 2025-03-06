
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn(
      "w-full py-6 px-4 sm:px-6 backdrop-blur-md bg-background/80 border-b border-border/40 sticky top-0 z-40 transition-all duration-300",
      className
    )}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5 text-primary-foreground"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-medium">Reddit Complaint Analyzer</h1>
            <p className="text-sm text-muted-foreground">Identify and analyze complaints from any subreddit</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors duration-200" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            About
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
