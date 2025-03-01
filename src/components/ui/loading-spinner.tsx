import React from "react";

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  );
}; 