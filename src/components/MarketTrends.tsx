import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, TrendingUp, Home, PoundSterling, Map, RefreshCw } from "lucide-react";
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
import { getChatResponse, formatMessage, getPredictiveAnalytics, getInvestmentHotspots } from "../lib/chat";
import { formatCurrency } from "../lib/utils";

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

// Add this type for the heatmap data
interface RegionData {
  name: string;
  priceGrowth: number;
  averagePrice: number;
  transactions: number;
}

interface PredictiveData {
  region: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  growthFactors: string[];
}

interface HotspotData {
  area: string;
  score: number;
  factors: string[];
  predictedGrowth: number;
  investmentType: 'Residential' | 'Commercial' | 'Mixed';
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

  // Add this data near your other sample data
  const heatmapData: RegionData[] = [
    { name: "London", priceGrowth: 5.2, averagePrice: 500000, transactions: 1200 },
    { name: "South East", priceGrowth: 4.8, averagePrice: 375000, transactions: 950 },
    { name: "South West", priceGrowth: 4.5, averagePrice: 310000, transactions: 780 },
    { name: "East of England", priceGrowth: 4.2, averagePrice: 325000, transactions: 820 },
    { name: "West Midlands", priceGrowth: 6.1, averagePrice: 240000, transactions: 680 },
    { name: "East Midlands", priceGrowth: 5.8, averagePrice: 225000, transactions: 650 },
    { name: "Yorkshire", priceGrowth: 7.2, averagePrice: 195000, transactions: 720 },
    { name: "North West", priceGrowth: 8.1, averagePrice: 205000, transactions: 850 },
    { name: "North East", priceGrowth: 6.5, averagePrice: 155000, transactions: 480 },
    { name: "Wales", priceGrowth: 5.9, averagePrice: 185000, transactions: 520 },
    { name: "Scotland", priceGrowth: 5.4, averagePrice: 175000, transactions: 680 },
  ];

  // Add this SVG map component
  const UKMap = ({ data }: { data: RegionData[] }) => {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 500 800"
          className="w-full h-full max-h-[400px]"
          style={{ maxWidth: '300px' }}
        >
          {/* Simple UK regions - basic shapes for visualization */}
          {[
            { path: "M250,600 L300,550 L350,600 L300,650 Z", name: "London" },
            { path: "M200,500 L300,450 L350,500 L250,550 Z", name: "South East" },
            { path: "M150,450 L250,400 L300,450 L200,500 Z", name: "South West" },
            { path: "M300,450 L400,400 L450,450 L350,500 Z", name: "East of England" },
            { path: "M200,350 L300,300 L350,350 L250,400 Z", name: "West Midlands" },
            { path: "M300,350 L400,300 L450,350 L350,400 Z", name: "East Midlands" },
            { path: "M200,250 L300,200 L350,250 L250,300 Z", name: "Yorkshire" },
            { path: "M150,200 L250,150 L300,200 L200,250 Z", name: "North West" },
            { path: "M250,150 L350,100 L400,150 L300,200 Z", name: "North East" },
            { path: "M100,350 L200,300 L250,350 L150,400 Z", name: "Wales" },
            { path: "M150,100 L300,50 L350,100 L200,150 Z", name: "Scotland" },
          ].map((region) => {
            const regionData = data.find(d => d.name === region.name);
            const growth = regionData?.priceGrowth || 0;
            return (
              <g key={region.name}>
                <path
                  d={region.path}
                  fill={`hsl(${120 * (growth / 10)}, 70%, 50%)`}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-colors duration-300 hover:brightness-110 cursor-pointer"
                />
                <title>{`${region.name}: +${growth}%`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const [marketInsights, setMarketInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingInsights, setRefreshingInsights] = useState(false);

  const fetchMarketInsights = async () => {
    setIsLoading(true);
    try {
      const response = await getChatResponse(
        "Provide a brief market analysis of the current UK property market trends, focusing on price changes, regional variations, and investment opportunities. Format the response with proper headings and bullet points."
      );
      setMarketInsights(response);
    } catch (error) {
      console.error("Error fetching market insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [predictiveData, setPredictiveData] = useState<PredictiveData[]>([]);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<string>("");
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const [refreshingPredictions, setRefreshingPredictions] = useState(false);
  const [refreshingHotspots, setRefreshingHotspots] = useState(false);

  const fetchPredictiveAnalytics = async () => {
    setIsLoadingPredictions(true);
    try {
      const data = await getPredictiveAnalytics();
      setPredictiveData(data.regions || []);
    } catch (error) {
      console.error("Error fetching predictive analytics:", error);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  const fetchHotspots = async () => {
    setIsLoadingHotspots(true);
    try {
      const data = await getInvestmentHotspots();
      setHotspots(data.hotspots || []);
    } catch (error) {
      console.error("Error fetching hotspots:", error);
    } finally {
      setIsLoadingHotspots(false);
    }
  };

  const handleRefreshInsights = async () => {
    setRefreshingInsights(true);
    await fetchMarketInsights();
    setRefreshingInsights(false);
  };

  const handleRefreshPredictions = async () => {
    setRefreshingPredictions(true);
    await fetchPredictiveAnalytics();
    setRefreshingPredictions(false);
  };

  const handleRefreshHotspots = async () => {
    setRefreshingHotspots(true);
    await fetchHotspots();
    setRefreshingHotspots(false);
  };

  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bitcoinLoading, setBitcoinLoading] = useState(true);

  const fetchBitcoinPrice = async () => {
    try {
      setBitcoinLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin price');
      }

      const data = await response.json();
      setBitcoinPrice(data.bitcoin.gbp);
      setError(null);
    } catch (err) {
      console.error('Error fetching Bitcoin price:', err);
      setError('Failed to load Bitcoin price');
      setBitcoinPrice(null);
    } finally {
      setBitcoinLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketInsights();
    fetchPredictiveAnalytics();
    fetchHotspots();

    fetchBitcoinPrice();
    // Set up an interval to fetch the price every minute
    const interval = setInterval(fetchBitcoinPrice, 60000);

    return () => clearInterval(interval);
  }, []);

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
              <TabsList className="w-full mb-8">
                <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
                  <TabsTrigger value="overview" className="w-full">
                    Price Evolution
                  </TabsTrigger>
                  <TabsTrigger value="regional" className="w-full">
                    Regional Comparison
                  </TabsTrigger>
                  <TabsTrigger value="heatmap" className="w-full">
                    Growth Heatmap
                  </TabsTrigger>
                </div>
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
                className="h-[400px] overflow-y-auto"
              >
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4 min-h-[300px]">
                    <h3 className="font-semibold text-lg sticky top-0 bg-background border-b py-2 px-2 rounded-t-lg">
                      Regional Price Growth
                    </h3>
                    <div className="space-y-2 overflow-y-auto px-2">
                      {heatmapData
                        .sort((a, b) => b.priceGrowth - a.priceGrowth)
                        .map((region) => (
                          <div
                            key={region.name}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2 h-8 rounded-full"
                                style={{
                                  backgroundColor: `hsl(${
                                    120 * (region.priceGrowth / 10)
                                  }, 70%, 50%)`,
                                }}
                              />
                              <div>
                                <p className="font-medium">{region.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  £{region.averagePrice.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-500">
                                +{region.priceGrowth}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {region.transactions} sales
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="relative hidden lg:flex items-center justify-center bg-muted/30 rounded-xl min-h-[300px]">
                    <UKMap data={heatmapData} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 mb-16">
        <Card className="bg-card border-border relative ai-border-animation">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold">AI Market Analysis</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshInsights}
              className={`h-8 w-8 ${refreshingInsights ? 'animate-spin' : ''}`}
              disabled={refreshingInsights || isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatMessage(marketInsights) }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 mb-16 grid gap-6 md:grid-cols-2">
        {/* Predictive Analytics Card */}
        <Card className="bg-card border-border relative ai-border-animation">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold">Predictive Market Analytics</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshPredictions}
              className={`h-8 w-8 ${refreshingPredictions ? 'animate-spin' : ''}`}
              disabled={refreshingPredictions || isLoadingPredictions}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingPredictions ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {predictiveData.map((prediction, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{prediction.region}</h3>
                      <div className="text-sm font-medium text-emerald-500">
                        +{((prediction.predictedValue - prediction.currentValue) / prediction.currentValue * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1">
                        <div className="w-full bg-background rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${prediction.confidence}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Confidence: {prediction.confidence}%</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {prediction.growthFactors[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Hotspots Card */}
        <Card className="bg-card border-border relative ai-border-animation">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold">Emerging Investment Hotspots</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshHotspots}
              className={`h-8 w-8 ${refreshingHotspots ? 'animate-spin' : ''}`}
              disabled={refreshingHotspots || isLoadingHotspots}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingHotspots ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {hotspots.map((hotspot, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{hotspot.area}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        hotspot.investmentType === 'Residential' 
                          ? 'bg-blue-100 text-blue-700'
                          : hotspot.investmentType === 'Commercial'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {hotspot.investmentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1">
                        <div className="w-full bg-background rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${hotspot.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Investment Score: {hotspot.score}%</p>
                      </div>
                      <div className="text-sm font-medium text-emerald-500">
                        +{hotspot.predictedGrowth}%
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hotspot.factors[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

        <div className="container mx-auto px-4 mb-16 grid gap-6 md:grid-cols-3">
          {articles.map((article, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:scale-[1.02] transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{article.title}</h2>
                  <span className="text-sm text-muted-foreground">
                    {new Date(article.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
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

        <div className="w-full bg-muted/50 py-12">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <h2 className="text-2xl font-bold mb-6">Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Bitcoin Price (GBP)</h3>
                {bitcoinLoading ? (
                  <div className="animate-pulse h-8 bg-muted rounded" />
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : bitcoinPrice ? (
                  <p className="text-2xl font-bold">{formatCurrency(bitcoinPrice)}</p>
                ) : (
                  <p className="text-muted-foreground">Price unavailable</p>
                )}
              </Card>
              {/* Add other market trend cards here */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketTrends;

<style>
{`
  .ai-border-animation::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(90deg, #22c55e, #10b981, #059669, #22c55e);
    background-size: 400% 400%;
    z-index: -1;
    border-radius: calc(var(--radius) + 4px);
    animation: borderAnimation 3s ease infinite;
  }

  @keyframes borderAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`}
</style>
