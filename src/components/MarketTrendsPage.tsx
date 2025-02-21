import React from "react";
    import HeroSection from "./HeroSection";
    import { useAuth } from "../lib/auth";
    import MarketTrends from "./MarketTrends";
    import { Layout } from "./Layout";
    import { PageTransition } from "./ui/page-transition";
    import { Card, CardContent, CardHeader } from "./ui/card";
    import { generatePriceForecast } from "../lib/market-insights"; // Import function
    import { Button } from "./ui/button";
    import { ArrowRight } from "lucide-react";

    export default function MarketTrendsPage() {
      const { user: _, profile: __ } = useAuth();
      const [loading, setLoading] = React.useState(true);
      const [forecast, setForecast] = React.useState<string | null>(null); // State for forecast
      const [forecastLoading, setForecastLoading] = React.useState(false); // Loading state for forecast
      const [forecastError, setForecastError] = React.useState<string | null>(null); // Error state for forecast

      const trends = [
        {
          title: "Average Home Price",
          value: "£450,000",
          change: "+5.2%",
          isPositive: true,
        },
        {
          title: "Days on Market",
          value: "28",
          change: "-12%",
          isPositive: true,
        },
        {
          title: "Available Listings",
          value: "1,234",
          change: "-3.1%",
          isPositive: false,
        },
        {
          title: "Mortgage Rates",
          value: "4.5%",
          change: "+0.25%",
          isPositive: false,
        },
        {
          title: "Price per Sq Ft",
          value: "£375",
          change: "+2.8%",
          isPositive: true,
        },
        {
          title: "New Listings",
          value: "458",
          change: "+15%",
          isPositive: true,
        },
      ];

      const articles = [
        {
          title: "Understanding the Current Real Estate Market",
          excerpt:
            "Get insights into the latest trends and what they mean for buyers and sellers.",
          date: "2024-03-15",
        },
        {
          title: "Top 5 Investment Opportunities in Real Estate",
          excerpt:
            "Discover the most promising areas for property investment in the current market.",
          date: "2024-03-10",
        },
        {
          title: "Real Estate Market Forecast 2024",
          excerpt:
            "Expert predictions and analysis for the upcoming year in real estate.",
          date: "2024-03-05",
        },
      ];

      React.useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 1000);
      }, []);

      const handleGenerateForecast = async () => { // Function to generate forecast
        setForecastLoading(true);
        setForecastError(null);
        try {
          const area = "London"; // Example area, can be dynamic
          const forecastData = await generatePriceForecast(area);
          setForecast(forecastData);
        } catch (error: any) {
          console.error("Error generating forecast:", error);
          setForecastError("Failed to generate forecast. Please try again.");
          setForecast(null);
        } finally {
          setForecastLoading(false);
        }
      };

      return (
        <PageTransition>
          <Layout>
            <HeroSection
              title="Market Trends & Statistics"
              subtitle="Track key market indicators and stay ahead of property market movements"
              backgroundImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3"
              showSearch={false}
              showStats={false}
              height="h-[400px]"
            />
            <main className="container mx-auto px-4 py-8">
              <div className="max-w-7xl mx-auto space-y-8">
                <MarketTrends trends={trends} articles={articles} />

                <Card> {/* Forecast Card */}
                  <CardHeader>
                    <h2 className="text-2xl font-semibold">Predictive Price Forecasting</h2>
                    <p className="text-sm text-muted-foreground">
                      Get AI-powered property price predictions.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={handleGenerateForecast} disabled={forecastLoading} className="w-full">
                      {forecastLoading ? "Generating Forecast..." : "Generate Forecast for London"}
                    </Button>

                    {forecastError && (
                      <p className="text-destructive text-sm">{forecastError}</p>
                    )}

                    {forecast && !forecastLoading && (
                      <div className="prose dark:prose-invert max-w-none">
                        {forecast.split("\n").map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </Layout>
        </PageTransition>
      );
    }
