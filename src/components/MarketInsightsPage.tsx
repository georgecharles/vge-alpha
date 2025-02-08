import React from "react";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Newspaper, LineChart, Building2, Globe2 } from "lucide-react";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import {
  fetchPropertyNews,
  generateMarketInsights,
  getLatestMarketInsights,
  storeMarketInsights,
} from "../lib/market-insights";
import {
  getOverseasCompanyProperties,
  getUKCompanyProperties,
} from "../lib/land-registry";

export default function MarketInsightsPage() {
  const { user, profile } = useAuth();
  const [news, setNews] = React.useState<any[]>([]);
  const [insights, setInsights] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [ukProperties, setUkProperties] = React.useState<any[]>([]);
  const [overseasProperties, setOverseasProperties] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const [newsData, latestInsights, ukData, overseasData] =
        await Promise.all([
          fetchPropertyNews(),
          getLatestMarketInsights(),
          getUKCompanyProperties(),
          getOverseasCompanyProperties(),
        ]);

      setUkProperties(ukData);
      setOverseasProperties(overseasData);
      try {
        const [newsData, latestInsights] = await Promise.all([
          fetchPropertyNews(),
          getLatestMarketInsights(),
        ]);

        setNews(newsData.slice(0, 8));

        const prompt = `Analyze the current UK property market with the following structure:

1. Executive Summary
- Current market state
- Key trends and changes

2. Interest Rates & Mortgages
- Current rates and recent changes
- Impact on buyers and market

3. Regional Price Analysis
- London market performance
- Regional variations and hotspots
- Price growth rates

4. Market Sentiment
- Buyer confidence
- Seller behavior
- Industry expert opinions

5. Investment Opportunities
- High-yield areas
- Emerging markets
- Risk assessment

Provide specific data points, percentages, and recent statistics where possible.`;

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
          title="Market Insights & Analysis"
          subtitle="Stay informed with comprehensive market analysis and expert insights"
          backgroundImage="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-4xl mx-auto mb-16 prose dark:prose-invert">
              <h2 className="text-3xl font-bold mb-6">
                Expert Property Market Insights
              </h2>
              <p>
                Access in-depth analysis and expert insights into the UK
                property market. Our comprehensive market insights help
                investors understand market dynamics, identify trends, and make
                informed investment decisions.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">
                Market Analysis
              </h3>
              <p>
                Our expert analysts provide detailed market analysis covering
                key aspects of the UK property market, including price trends,
                rental yields, and market forecasts. Stay informed about market
                movements and their implications for property investment.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">
                Investment Strategy
              </h3>
              <p>
                Develop effective investment strategies based on expert insights
                and market analysis. Our platform provides guidance on portfolio
                diversification, risk management, and opportunity identification
                in the property market.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">
                Economic Impact
              </h3>
              <p>
                Understand how broader economic factors affect the property
                market. Our insights cover interest rates, inflation, policy
                changes, and their impact on property investment decisions.
              </p>
            </div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Market Insights</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stay informed with the latest property market analysis and news
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    <h2 className="text-2xl font-semibold">Market Analysis</h2>
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
                        {insights.split("\n").map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    <h2 className="text-xl font-semibold">Latest News</h2>
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
                            <div className="text-xs text-muted-foreground">
                              <span>
                                {new Date(
                                  article.publishedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">
                    UK Company Properties
                  </h2>
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
                    <div className="space-y-4">
                      {ukProperties.slice(0, 5).map((property, index) => (
                        <div
                          key={index}
                          className="border-b last:border-0 pb-4 last:pb-0"
                        >
                          <h3 className="font-medium mb-1">
                            {property.company_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {property.property_address}
                          </p>
                          {property.price_paid && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Price: £{property.price_paid.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Globe2 className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">
                    Overseas Company Properties
                  </h2>
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
                    <div className="space-y-4">
                      {overseasProperties.slice(0, 5).map((property, index) => (
                        <div
                          key={index}
                          className="border-b last:border-0 pb-4 last:pb-0"
                        >
                          <h3 className="font-medium mb-1">
                            {property.company_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {property.property_address}
                          </p>
                          {property.price_paid && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Price: £{property.price_paid.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
