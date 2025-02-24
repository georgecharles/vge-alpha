import React from "react";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import HeroSection from "./HeroSection";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { 
  getInvestmentAnalysis, 
  getMarketPredictions, 
  getInvestmentStrategy 
} from "../lib/ai-utils";
import { Loader2, TrendingUp, Brain, BarChart3 } from "lucide-react";

export default function InvestmentOpportunitiesPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [propertyType, setPropertyType] = React.useState("residential");
  const [budget, setBudget] = React.useState(250000);
  const [location, setLocation] = React.useState("London");
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [predictions, setPredictions] = React.useState<any>(null);
  const [strategy, setStrategy] = React.useState<any>(null);

  const investorProfile = {
    experience: "intermediate",
    budget: budget,
    riskTolerance: "moderate"
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Execute each API call separately for better error handling
      const analysisData = await getInvestmentAnalysis(propertyType, budget);
      setAnalysis(analysisData);

      const predictionsData = await getMarketPredictions(location);
      setPredictions(predictionsData);

      const strategyData = await getInvestmentStrategy(investorProfile);
      setStrategy(strategyData);

    } catch (error) {
      console.error("Error in analysis:", error);
      setError(error instanceof Error ? error.message : "Failed to generate analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="AI-Powered Investment Analysis"
          subtitle="Make data-driven investment decisions with our advanced AI analytics"
          showSearch={false}
          height="h-[400px]"
          onSearch={() => {}}
        />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Analysis Controls */}
            <section className="bg-card p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Investment Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget: £{budget.toLocaleString()}</label>
                  <Slider
                    value={[budget]}
                    onValueChange={(value) => setBudget(value[0])}
                    min={100000}
                    max={1000000}
                    step={50000}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Investment Opportunity'
                )}
              </Button>
            </section>

            {/* Analysis Results */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                {error}
              </div>
            )}
            
            {analysis && predictions && strategy && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Market Analysis */}
                <Card>
                  <CardHeader>
                    <TrendingUp className="h-6 w-6 text-primary mb-2" />
                    <CardTitle>Market Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Analysis</h4>
                      <p className="text-sm text-muted-foreground">{analysis.analysis}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">ROI Range</h4>
                      <p className="text-sm text-muted-foreground">{analysis.roi_range}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Risks</h4>
                      <ul className="list-disc pl-4 text-sm text-muted-foreground">
                        {analysis.risks.map((risk: string, i: number) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Market Trends</h4>
                      <ul className="list-disc pl-4 text-sm text-muted-foreground">
                        {analysis.market_trends.map((trend: string, i: number) => (
                          <li key={i}>{trend}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Predictions */}
                <Card>
                  <CardHeader>
                    <Brain className="h-6 w-6 text-primary mb-2" />
                    <CardTitle>AI Predictions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <h4 className="font-semibold">Price Trend</h4>
                      <p>{predictions.price_prediction}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Demand Factors</h4>
                      <ul className="list-disc pl-4">
                        {predictions.demand_factors.map((factor: string, i: number) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Strategy */}
                <Card>
                  <CardHeader>
                    <BarChart3 className="h-6 w-6 text-primary mb-2" />
                    <CardTitle>Recommended Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <h4 className="font-semibold">Portfolio Allocation</h4>
                      <p>{strategy.portfolio_allocation}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Expected Returns</h4>
                      <p>{strategy.expected_returns}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Timeline</h4>
                      <p>{strategy.timeline}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
