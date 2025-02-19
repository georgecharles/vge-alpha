import React from "react";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import {
  Newspaper,
  LineChart,
  Building2,
  Globe2,
  AlertTriangle,
} from "lucide-react";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import {
  fetchPropertyNews,
  generateMarketInsights,
  getLatestMarketInsights,
  storeMarketInsights,
} from "../lib/market-insights";

export default function MarketInsightsPage() {
  const { user: _, profile: __ } = useAuth();
  const [news, setNews] = React.useState<any[]>([]);
  const [insights, setInsights] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const prompt = `Analyze the current UK property regulatory landscape and provide insights on:

1. Latest Tax Law Changes
- Recent changes to property-related taxes
- Impact on investors and landlords
- Upcoming tax proposals

2. Landlord Regulations
- Current licensing requirements
- Tenant rights updates
- Property safety regulations

3. Government Policies
- Recent policy changes affecting property
- Proposed legislation
- Regional variations

4. Market Impact Analysis
- How these changes affect property values
- Impact on rental yields
- Investment strategy adjustments

Provide specific dates, numbers, and practical implications where possible.`;

        const [newsData, latestInsights] = await Promise.all([
          fetchPropertyNews(),
          getLatestMarketInsights(),
        ]);

        setNews(newsData.slice(0, 8));

        try {
          if (
            latestInsights &&
            new Date(latestInsights.generated_at).getTime() >
              Date.now() - 24 * 60 * 60 * 1000
          ) {
            setInsights(latestInsights.content);
          } else {
            const newInsights = await generateMarketInsights(prompt);
            setInsights(newInsights);
            await storeMarketInsights(newInsights);
          }
        } catch (error) {
          console.error("Error generating market insights:", error);
          setInsights(
            "Unable to load market insights at this time. Please try again later.",
          );
        }
      } catch (error) {
        console.error("Error loading market data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="Regulatory Updates & Market Insights"
          subtitle="Stay informed about the latest property regulations and policy changes"
          backgroundImage="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold">
                        Regulatory Updates
                      </h2>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-5/6" />
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        {insights.split("\n").map((line, index) => {
                          if (line.startsWith("## ")) {
                            return (
                              <h2
                                key={index}
                                className="text-xl font-semibold mt-6 mb-3"
                              >
                                {line.replace("## ", "")}
                              </h2>
                            );
                          } else if (line.startsWith("### ")) {
                            return (
                              <h3
                                key={index}
                                className="text-lg font-medium mt-4 mb-2"
                              >
                                {line.replace("### ", "")}
                              </h3>
                            );
                          } else if (line.startsWith("- ")) {
                            return (
                              <li key={index} className="ml-4">
                                {line.replace("- ", "")}
                              </li>
                            );
                          } else if (line.trim() !== "") {
                            return (
                              <p key={index} className="mb-3">
                                {line}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    <h2 className="text-xl font-semibold">Latest Updates</h2>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {news.map((article, index) => (
                          <div
                            key={index}
                            className="border-b last:border-0 pb-4 last:pb-0"
                          >
                            <h3 className="font-medium mb-1 line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {article.description}
                            </p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>
                                {new Date(
                                  article.publishedAt,
                                ).toLocaleDateString()}
                              </span>
                              <Button
                                variant="ghost"
                                className="group hover:text-primary"
                              >
                                Read More
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
