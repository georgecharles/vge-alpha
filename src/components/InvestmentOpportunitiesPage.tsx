import React from "react";
    import Header from "./Header";
    import HeroSection from "./HeroSection";
    import { Layout } from "./Layout";
    import { PageTransition } from "./ui/page-transition";
    import { Button } from "./ui/button";
    import { Card, CardContent, CardHeader } from "./ui/card";
    import { generateInvestmentHotspots } from "../lib/market-insights";

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
      const [hotspots, setHotspots] = React.useState<string | null>(null); // State for hotspots
      const [hotspotsLoading, setHotspotsLoading] = React.useState(false); // Loading state for hotspots
      const [hotspotsError, setHotspotsError] = React.useState<string | null>(null); // Error state for hotspots


      const handleGenerateHotspots = async () => { // New function to generate hotspots
        setHotspotsLoading(true);
        setHotspotsError(null);
        try {
          const area = "UK"; // Define area for hotspot identification
          const hotspotsData = await generateInvestmentHotspots(area);
          setHotspots(hotspotsData);
        } catch (error: any) {
          console.error("Error generating investment hotspots:", error);
          setHotspotsError("Failed to generate hotspots. Please try again.");
          setHotspots(null);
        } finally {
          setHotspotsLoading(false);
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

                <Card> {/* Investment Hotspots Card */}
                  <CardHeader>
                    <h2 className="text-2xl font-semibold">Investment Hotspot Identification</h2>
                    <p className="text-sm text-muted-foreground">
                      Discover emerging high-growth neighborhoods in the UK.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={handleGenerateHotspots} disabled={hotspotsLoading} className="w-full">
                      {hotspotsLoading ? "Identifying Hotspots..." : "Identify UK Investment Hotspots"}
                    </Button>

                    {hotspotsError && (
                      <p className="text-destructive text-sm">{hotspotsError}</p>
                    )}

                    {hotspots && !hotspotsLoading && (
                      <div className="prose dark:prose-invert max-w-none">
                        {hotspots.split("\n").map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>


                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Investment Strategies</h2>
                  <p>
                    We offer a variety of investment strategies to suit your
                    individual goals and risk tolerance. Whether you're looking for
                    long-term capital appreciation or steady rental income, we have
                    the expertise to help you succeed.
                  </p>
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
