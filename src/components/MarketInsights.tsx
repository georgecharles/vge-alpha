import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  fetchPropertyNews,
  generateMarketInsights,
  getLatestMarketInsights,
  getRiskAssessment,
  getPersonalizedOpportunities,
  getPredictiveAnalytics,
} from "../lib/market-insights";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HeroSection from "./HeroSection";

interface MarketInsightsProps {
  user?: any;
  profile?: any;
  className?: string;
  showHero?: boolean;
}

export function MarketInsights({ user, profile, className, showHero = true }: MarketInsightsProps) {
  const [news, setNews] = React.useState<any[]>([]);
  const [insights, setInsights] = React.useState<string>("");
  const [riskAssessment, setRiskAssessment] = React.useState<string>("No risk assessment data available.");
  const [personalizedOpportunities, setPersonalizedOpportunities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch news
        const newsData = await fetchPropertyNews();
        setNews(newsData.slice(0, 5));

        // Get latest insights from Supabase
        const latestInsights = await getLatestMarketInsights();
        if (latestInsights) {
          setInsights(latestInsights.content);
        } else {
          // Generate new insights if none exist
          const newInsights = await generateMarketInsights(
            "Provide a concise analysis of the current UK property market trends, focusing on interest rates, price movements, and market sentiment. Include key statistics and recommendations for investors.",
          );
          setInsights(newInsights);
        }

        // Fetch risk assessment
        const riskData = await getRiskAssessment();
        setRiskAssessment(riskData);

        // Fetch personalized investment opportunities
        const opportunitiesData = await getPersonalizedOpportunities();
        setPersonalizedOpportunities(opportunitiesData);

        // Fetch predictive analytics
        const predictiveData = await getPredictiveAnalytics();
        // Handle predictive data as needed
      } catch (error) {
        console.error("Error loading market data:", error);
        setError("Failed to load market data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sample data for demonstration
  const priceData = [
    { month: 'Jan', price: 320000 },
    { month: 'Feb', price: 325000 },
    { month: 'Mar', price: 329000 },
    { month: 'Apr', price: 335000 },
    { month: 'May', price: 340000 },
    { month: 'Jun', price: 345000 },
  ];

  const regionalData = [
    { region: 'London', price: 500000 },
    { region: 'Manchester', price: 250000 },
    { region: 'Birmingham', price: 220000 },
    { region: 'Leeds', price: 200000 },
    { region: 'Liverpool', price: 180000 },
  ];

  return (
    <>
      {/* Only render hero if showHero prop is true */}
      {showHero && (
        <div className="w-full">
          <HeroSection
            title="Property Market Insights & Analysis"
            subtitle="Expert analysis, regional comparisons, and investment recommendations to guide your property decisions"
            showSearch={false}
            showStats={false}
            height="h-[400px]"
          />
        </div>
      )}

      {/* Content area */}
      <div className={cn("w-full", className)}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Price Trends</h2>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`£${value.toLocaleString()}`, 'Average Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Regional Comparison</h2>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`£${value.toLocaleString()}`, 'Average Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <h2 className="text-xl font-semibold">Market Analysis</h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The UK property market continues to show resilience despite economic challenges.
                Regional variations are significant, with some areas experiencing rapid growth
                while others see more moderate changes.
              </p>
              <p className="text-muted-foreground mb-4">
                Key factors influencing the current market include:
              </p>
              <ul className="list-disc pl-5 mb-4 text-muted-foreground">
                <li>Interest rate changes affecting mortgage affordability</li>
                <li>Supply constraints in high-demand areas</li>
                <li>Increasing preference for properties with outdoor space</li>
                <li>Remote work influencing location decisions</li>
              </ul>
              <Button>Download Full Report</Button>
            </CardContent>
          </Card>

          {/* Only show premium insights for premium subscribers */}
          {profile?.subscription_tier !== 'free' && (
            <Card className="mb-12 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center">
                  Premium Market Insights
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                    Premium
                  </span>
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Our exclusive analysis indicates emerging hotspots in the following areas:
                </p>
                <ul className="list-disc pl-5 mb-4 text-muted-foreground">
                  <li>Northwest Manchester - projected 8.3% growth over 12 months</li>
                  <li>East Birmingham suburbs - increasing demand from young professionals</li>
                  <li>Coastal towns in the Southwest - rising popularity for remote workers</li>
                </ul>
                <Button>View Detailed Forecast</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
