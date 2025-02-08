import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, FileText, TrendingUp, BarChart, Lock } from "lucide-react";

interface ResearchReportsProps {
  isPro?: boolean;
}

export function ResearchReports({ isPro = false }: ResearchReportsProps) {
  const articles = [
    {
      title: "UK Property Market Analysis Q1 2024",
      excerpt:
        "Comprehensive analysis of the UK property market performance in Q1 2024, including price trends, regional variations, and future projections.",
      category: "Market Analysis",
      date: "2024-03-20",
      readTime: "10 min read",
    },
    {
      title: "Investment Opportunities in Northern Cities",
      excerpt:
        "Detailed research on emerging property investment opportunities in northern UK cities, with focus on yield potential and growth areas.",
      category: "Investment Research",
      date: "2024-03-18",
      readTime: "8 min read",
    },
    {
      title: "Impact of Interest Rates on Property Market",
      excerpt:
        "Analysis of how recent interest rate changes are affecting the property market, mortgage rates, and buyer behavior.",
      category: "Economic Analysis",
      date: "2024-03-15",
      readTime: "12 min read",
    },
    {
      title: "Rental Market Trends 2024",
      excerpt:
        "Latest trends in the UK rental market, including demand patterns, yield analysis, and regulatory changes.",
      category: "Market Analysis",
      date: "2024-03-12",
      readTime: "7 min read",
    },
    {
      title: "Sustainable Property Investment Guide",
      excerpt:
        "Comprehensive guide to sustainable property investment, including EPC regulations, green mortgages, and future-proofing investments.",
      category: "Investment Research",
      date: "2024-03-10",
      readTime: "15 min read",
    },
    {
      title: "Regional Property Price Forecast",
      excerpt:
        "Detailed forecast of property prices across UK regions, with analysis of key growth drivers and market indicators.",
      category: "Market Analysis",
      date: "2024-03-08",
      readTime: "9 min read",
    },
  ];

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow relative overflow-hidden"
          >
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              {article.category === "Market Analysis" ? (
                <TrendingUp className="w-5 h-5 text-blue-500" />
              ) : article.category === "Investment Research" ? (
                <BarChart className="w-5 h-5 text-green-500" />
              ) : (
                <FileText className="w-5 h-5 text-purple-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {article.category}
              </span>
            </CardHeader>
            <CardContent className="relative">
              <div className={!isPro ? "blur-sm" : ""}>
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {new Date(article.date).toLocaleDateString()} ·{" "}
                    {article.readTime}
                  </div>
                  <Button
                    variant="ghost"
                    className="group hover:text-primary"
                    onClick={() => {
                      window.location.href = `/article/${encodeURIComponent(article.title)}`;
                    }}
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
              {!isPro && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
                  <div className="text-center p-6">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Pro to access research reports
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
