import React, { useState } from 'react';
import { MarketInsights } from './MarketInsights';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { DataVisualization } from './DataVisualization';
import { useAuth } from '../lib/auth';
import HeroSection from './HeroSection';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import {
  Newspaper,
  LineChart,
  Building2,
  Globe2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import {
  fetchPropertyNews,
  generateMarketInsights,
  getLatestMarketInsights,
  storeMarketInsights,
  CREATE_MARKET_INSIGHTS_TABLE_SQL
} from "../lib/market-insights";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

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

export default function MarketInsightsPage() {
  const [activeTab, setActiveTab] = useState('insights');
  const { user, profile } = useAuth();

  return (
    <AuthContextChecker>
      <Layout>
        <PageTransition>
          <div className="flex flex-col w-full">
            {/* Hero section with responsive height */}
            <HeroSection
              title="Property Market Insights & Analysis"
              subtitle="Expert analysis, regional comparisons, and investment recommendations to guide your property decisions"
              showSearch={false}
              showStats={false}
              height="h-[300px] sm:h-[350px] md:h-[400px]"
            />

            {/* Container with proper padding for mobile */}
            <div className="container mx-auto px-4 py-4 sm:py-6">
              <Tabs 
                defaultValue="insights" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                {/* Responsive tabs list */}
                <TabsList className="w-full mb-4 sm:mb-6 grid grid-cols-2">
                  <TabsTrigger value="insights" className="text-sm sm:text-base">Market Insights</TabsTrigger>
                  <TabsTrigger value="visualization" className="text-sm sm:text-base">Data Visualization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="insights" className="mt-0">
                  <MarketInsights 
                    user={user} 
                    profile={profile} 
                    className="mt-0"
                    showHero={false}
                  />
                </TabsContent>
                
                <TabsContent value="visualization" className="mt-0">
                  <DataVisualization user={user} profile={profile} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </PageTransition>
      </Layout>
    </AuthContextChecker>
  );
}
