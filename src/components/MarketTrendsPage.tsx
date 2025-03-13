import React from "react";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import MarketTrends from "./MarketTrends";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

// Auth context checker wrapper
const AuthContextChecker = ({ children }: { children: React.ReactNode }) => {
  try {
    // Try to access auth context but don't use the result
    useAuth();
    // If we get here, auth context is available
    return <>{children}</>;
  } catch (error) {
    // If auth context is not available, show a fallback
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Authentication Error</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Unable to load authentication. Please refresh the page or try again later.
            </p>
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }
};

const MarketTrendsPage = () => {
  return (
    <AuthContextChecker>
      <MarketTrendsContent />
    </AuthContextChecker>
  );
};

// Separate the main component content to ensure useAuth is only called when context is available
const MarketTrendsContent = () => {
  const { user, profile } = useAuth();

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <MarketTrends user={user} profile={profile} />
        </div>
      </PageTransition>
    </Layout>
  );
};

export default MarketTrendsPage;
