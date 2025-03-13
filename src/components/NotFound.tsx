import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
          404
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-lg">
          Sorry, we couldn't find the page you're looking for. The page might have been removed, renamed, or doesn't exist.
        </p>
        
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 