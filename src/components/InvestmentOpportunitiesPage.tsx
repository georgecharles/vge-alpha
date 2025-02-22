import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import { Button } from "./ui/button";
import { getTailoredRecommendations, simulateInvestmentScenario } from "../lib/investment-api";

const investmentOpportunities = [
  {
    title: "High-Yield Student Housing",
    description: "Invest in modern student accommodations with guaranteed rental income.",
  },
  {
    title: "Commercial Property Development",
    description: "Participate in the development of prime commercial properties in growing urban areas.",
  },
  {
    title: "Sustainable Housing Projects",
    description: "Invest in eco-friendly housing projects with long-term growth potential.",
  },
];

export default function InvestmentOpportunitiesPage() {
  const [tailoredRecommendations, setTailoredRecommendations] = React.useState<any[]>([]);
  const [simulationResults, setSimulationResults] = React.useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = React.useState(true);
  const [loadingSimulation, setLoadingSimulation] = React.useState(false);

  React.useEffect(() => {
    const loadRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const recommendations = await getTailoredRecommendations();
        setTailoredRecommendations(recommendations);
      } catch (error) {
        console.error("Error fetching tailored recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleSimulateScenario = async () => {
    setLoadingSimulation(true);
    try {
      const result = await simulateInvestmentScenario({
        initialInvestment: 10000,
        duration: 5,
        riskLevel: "medium",
      });
      setSimulationResults(result);
    } catch (error) {
      console.error("Error simulating investment scenario:", error);
    } finally {
      setLoadingSimulation(false);
    }
  };

  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="Explore Investment Opportunities"
          subtitle="Discover a wide range of property investment opportunities tailored to your needs."
          backgroundImage="https://images.unsplash.com/photo-1505843516597-5c0a43e6ca02?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Unlock Your Investment Potential
              </h1>
              <p className="text-muted-foreground">
                Find the perfect property investment opportunity with our expert
                guidance.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Featured Opportunities</h2>
              <ul className="list-disc list-inside">
                {investmentOpportunities.map((opportunity, index) => (
                  <li key={index}>
                    <strong>{opportunity.title}</strong>: {opportunity.description}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Tailored Recommendations for Fractional Ownership</h2>
              {loadingRecommendations ? (
                <p>Loading recommendations...</p>
              ) : (
                <ul className="list-disc list-inside">
                  {tailoredRecommendations.length > 0 ? (
                    tailoredRecommendations.map((rec, index) => (
                      <li key={index}>
                        <strong>{rec.title}</strong>: {rec.description}
                      </li>
                    ))
                  ) : (
                    <p>No tailored recommendations available.</p>
                  )}
                </ul>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Scenario Modeling</h2>
              <p>
                Simulate different investment outcomes based on your preferences.
              </p>
              <Button onClick={handleSimulateScenario} disabled={loadingSimulation}>
                {loadingSimulation ? "Simulating..." : "Simulate Investment Scenario"}
              </Button>
              {simulationResults && (
                <div className="mt-4">
                  <h3 className="font-semibold">Simulation Results</h3>
                  <p>{JSON.stringify(simulationResults, null, 2)}</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Get Started Today</h2>
              <p>
                Browse our current investment opportunities and contact us to
                discuss your investment goals.
              </p>
              <Button>Explore Opportunities</Button>
            </section>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
