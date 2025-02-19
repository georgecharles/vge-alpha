import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, TrendingUp, Home, PoundSterling, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

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
  // Sample data for charts
  const priceData = [
    { month: "Jan", price: 450000 },
    { month: "Feb", price: 455000 },
    { month: "Mar", price: 458000 },
    { month: "Apr", price: 462000 },
    { month: "May", price: 470000 },
    { month: "Jun", price: 475000 },
  ];

  const regionalData = [
    { region: "London", price: 500000, growth: 5.2 },
    { region: "Manchester", price: 250000, growth: 7.8 },
    { region: "Birmingham", price: 220000, growth: 6.5 },
    { region: "Leeds", price: 200000, growth: 8.1 },
    { region: "Liverpool", price: 180000, growth: 9.2 },
  ];

  return (
    <section className="w-full py-8 sm:py-16 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 mb-16">
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-2xl font-semibold">
              Real Estate Trends Visualization
            </h2>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 overflow-x-auto snap-start snap-mandatory">
                <TabsTrigger value="overview">Price Evolution</TabsTrigger>
                <TabsTrigger value="regional">Regional Comparison</TabsTrigger>
                <TabsTrigger value="heatmap">Growth Heatmap</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient
                        id="colorPrice"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="regional" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                    />
                    <Line
                      type="monotone"
                      dataKey="growth"
                      stroke="hsl(var(--chart-1))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent
                value="heatmap"
                className="h-[400px] flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <Map className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Interactive heat map coming soon
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Market Trends & Insights</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest real estate market trends and expert
            insights to make better property decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {trends.map((trend, index) => (
            <Card
              key={index}
              className={`bg-card border-border hover:scale-[1.02] transition-all duration-300 ${index === 0 ? "bg-gradient-to-r from-emerald-400/10 to-cyan-400/10" : ""}`}
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
              className={`bg-card border-border hover:scale-[1.02] transition-all duration-300 ${index === 0 ? "bg-gradient-to-r from-emerald-400/10 to-cyan-400/10" : ""}`}
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
