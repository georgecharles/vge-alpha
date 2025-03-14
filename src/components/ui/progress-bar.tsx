import React, { useEffect, useState } from 'react';
// import NProgress from "nprogress"; // Remove this line
// import "nprogress/nprogress.css"; // Also remove this line

// NProgress.configure({ // Remove this block
//   showSpinner: false,
//   trickleSpeed: 200,
//   minimum: 0.08,
// });

interface ProgressBarProps {
  isAnimating: boolean;
}

export function ProgressBar({ isAnimating }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAnimating) {
      setProgress(0);
      return;
    }

    // Start progress animation
    setProgress(10);
    
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 500);
    const timer3 = setTimeout(() => setProgress(80), 800);
    const timer4 = setTimeout(() => setProgress(100), 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isAnimating]);

  if (!isAnimating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-primary transition-all duration-300 ease-in-out"
        style={{ 
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1
        }}
      />
    </div>
  );
}
