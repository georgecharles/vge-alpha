import React from "react";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { Card, CardContent } from "./ui/card";
import { TrendingUp, Home, PoundSterling, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";

export default function MarketTrendsPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = React.useState(true);

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
            <div className="max-w-4xl mx-auto mb-16 prose dark:prose-invert">
              <h2 className="text-3xl font-bold mb-6">
                Understanding UK Property Market Trends
              </h2>
              <p>
                Stay informed with comprehensive analysis of the UK property
                market trends. Our expert insights help you understand market
                movements, identify opportunities, and make data-driven
                investment decisions.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">
                Current Market Dynamics
              </h3>
              <p>
                The UK property market is influenced by various factors
                including interest rates, supply-demand dynamics, and regional
                economic conditions. Our trend analysis helps you understand
                these factors and their impact on property values.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">
                Regional Analysis
              </h3>
              <p>
                Different regions of the UK show varying growth patterns and
                investment potential. Our detailed regional analysis helps you
                identify areas with strong growth prospects and attractive
                yields.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">
                Investment Implications
              </h3>
              <p>
                Understanding market trends is crucial for successful property
                investment. Our analysis helps you align your investment
                strategy with market movements and identify optimal timing for
                property transactions.
              </p>
            </div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Market Trends</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Track key market indicators and stay ahead of property market
                trends
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                          <div className="h-6 bg-muted rounded w-1/3" />
                        </CardContent>
                      </Card>
                    ))
                : trends.map((trend, index) => (
                    <Card
                      key={index}
                      className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all duration-300 border border-border/50 hover:scale-[1.02]"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-foreground/80">
                            {trend.title}
                          </h3>
                          {index === 0 ? (
                            <PoundSterling className="w-5 h-5 text-primary" />
                          ) : index === 1 ? (
                            <Home className="w-5 h-5 text-primary" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-foreground">
                            {trend.value}
                          </span>
                          <span
                            className={`flex items-center ${trend.isPositive ? "text-emerald-500" : "text-red-500"}`}
                          >
                            {trend.change}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {articles.map((article, index) => (
                <Card
                  key={index}
                  className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all duration-300 border border-border/50 hover:scale-[1.02]"
                >
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(article.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {article.excerpt}
                    </p>
                    <Button
                      variant="ghost"
                      className="group hover:text-primary"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
