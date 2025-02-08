import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, TrendingUp, Home, PoundSterling } from "lucide-react";

interface MarketTrendsProps {
  trends?: Array<{
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
  }>;
  articles?: Array<{
    title: string;
    excerpt: string;
    date: string;
  }>;
}

const MarketTrends = ({
  trends = [
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
  ],
  articles = [
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
  ],
}: MarketTrendsProps) => {
  return (
    <section className="w-full py-8 sm:py-16 bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/50 backdrop-blur-[8px] z-0" />
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Market Trends & Insights
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest real estate market trends and expert
            insights to make better property decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {trends.map((trend, index) => (
            <Card
              key={index}
              className={`backdrop-blur-xl bg-card/40 hover:bg-card/60 transition-all duration-300 border border-border/50 hover:scale-[1.02] shadow-lg ${index === 0 ? "bg-gradient-to-r from-emerald-400/10 to-cyan-400/10" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-foreground/80">
                    {trend.title}
                  </h3>
                  {index === 0 ? (
                    <PoundSterling className="w-5 h-5 text-emerald-500" />
                  ) : index === 1 ? (
                    <Home className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Card
              key={index}
              className={`backdrop-blur-xl bg-card/40 hover:bg-card/60 transition-all duration-300 border border-border/50 hover:scale-[1.02] shadow-lg ${index === 0 ? "bg-gradient-to-r from-emerald-400/10 to-cyan-400/10" : ""}`}
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
                <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                <Button
                  variant="ghost"
                  className="group hover:text-emerald-500"
                  onClick={() => {
                    window.location.href = `/article/${encodeURIComponent(article.title)}`;
                  }}
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketTrends;
