import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Newspaper, TrendingUp } from "lucide-react";
import {
  fetchPropertyNews,
  generateMarketInsights,
  getLatestMarketInsights,
  getRiskAssessment,
  getPersonalizedOpportunities,
  getPredictiveAnalytics,
} from "../lib/market-insights";
import { cn } from "../lib/utils";

interface MarketInsightsProps {
  className?: string;
}

export function MarketInsights({ className }: MarketInsightsProps) {
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

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              Failed to load market insights: {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <Card>
          <CardContent className="h-40" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-semibold">Market Analysis</h3>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">{insights}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Newspaper className="w-5 h-5" />
          <h3 className="font-semibold">Latest Property News</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.map((article, index) => (
              <div
                key={index}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <h4 className="font-medium mb-1">{article.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {article.description}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Read More
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Card */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Risk Assessment</h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{riskAssessment || "No data available."}</p>
        </CardContent>
      </Card>

      {/* Personalized Investment Opportunities Card */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Personalized Investment Opportunities</h3>
        </CardHeader>
        <CardContent>
          {personalizedOpportunities.length > 0 ? (
            <ul className="space-y-2">
              {personalizedOpportunities.map((opportunity, index) => (
                <li key={index} className="text-muted-foreground">
                  {opportunity.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No personalized opportunities available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
