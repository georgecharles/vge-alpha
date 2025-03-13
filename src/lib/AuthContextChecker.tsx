import React, { useState, useEffect } from 'react';
import { useAuth } from './auth';
import { Button } from '../components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AuthContextCheckerProps {
  children: React.ReactNode;
}

// A component that safely checks if the auth context is available
export function AuthContextChecker({ children }: AuthContextCheckerProps) {
  const [hasAuthContext, setHasAuthContext] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    checkAuthContext();
  }, []);

  const checkAuthContext = () => {
    setIsChecking(true);
    try {
      // This will throw an error if auth context isn't available
      const auth = useAuth();
      setHasAuthContext(true);
    } catch (error) {
      console.error('Auth context not available:', error);
      setHasAuthContext(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!hasAuthContext) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center max-w-md p-6 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">Authentication Error</h3>
          <p className="text-muted-foreground mb-4">
            Unable to access authentication. This may be due to a temporary issue or your session has expired.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              window.location.reload();
            }}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Auth context is available, render children
  return <>{children}</>;
}

// Component that handles the inner content and safely uses auth context
export function createAuthProtectedComponent<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => (
    <AuthContextChecker>
      <Component {...props} />
    </AuthContextChecker>
  );
} 