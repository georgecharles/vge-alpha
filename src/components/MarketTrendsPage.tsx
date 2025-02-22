import React from "react";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import MarketTrends from "./MarketTrends";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";

export default function MarketTrendsPage() {
  const { user: _, profile: __ } = useAuth();
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
        <MarketTrends />
      </Layout>
    </PageTransition>
  );
}
