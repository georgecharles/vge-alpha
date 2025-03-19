import React from 'react';
import { cn } from '../../lib/utils';

type LoadingSpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3 border-[1.5px]',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-[3px]',
    xl: 'h-12 w-12 border-4'
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-transparent border-b-current text-current', 
        sizeClasses[size],
        className
      )}
    />
  );
}; 