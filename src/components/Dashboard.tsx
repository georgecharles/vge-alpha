import React from "react";
    import { useAuth } from "../lib/auth";
    import { useNavigate } from "react-router-dom";
    import { Button } from "./ui/button";
    import { Card, CardContent, CardHeader } from "./ui/card";
    import {
      Building2,
      Star,
      Plus,
      TrendingUp,
      PoundSterling,
      Users,
      Crown,
      Bitcoin,
      MapIcon
    } from "lucide-react";
    import { getSavedProperties } from "../lib/properties";
    import { AddPropertyModal } from "./AddPropertyModal";
    import PropertyCard from "./PropertyCard";
    import { supabase } from "../lib/supabase";
    import { Layout } from "./Layout";
    import { BitcoinPrice } from "./BitcoinPrice";
    import {
      generateCashFlowAnalysis,
      generateCapRateAnalysis,
      generateROIForecasting,
    } from "../lib/market-insights"; // Import AI functions
    import InteractiveMap from "./InteractiveMap"; // Import InteractiveMap

    export default function Dashboard() {
      const { user, profile } = useAuth();
      const navigate = useNavigate();
      const [savedProperties, setSavedProperties] = React.useState<any[]>([]);
      const [addedProperties, setAddedProperties] = React.useState<any[]>([]);
      const [users, setUsers] = React.useState<any[]>([]);
      const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] =
        React.useState(false);
      const [portfolioStats, setPortfolioStats] = React.useState({
        totalProperties: 0,
        totalValue: 0,
        averagePrice: 0,
        totalProfit: 0,
        monthlyIncome: 0,
      });

      // States for Investment Analysis Dashboard
      const [cashFlowAnalysis, setCashFlowAnalysis] = React.useState<string | null>(null);
      const [capRateAnalysis, setCapRateAnalysis] = React.useState<string | null>(null);
      const [roiForecasting, setRoiForecasting] = React.useState<string | null>(null);
      const [analysisLoading, setAnalysisLoading] = React.useState(false);
      const [analysisError, setAnalysisError] = React.useState<string | null>(null);


      const loadUsers = React.useCallback(async () => {
        if (!user || profile?.role !== "admin") return;
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          setUsers(data || []);
        } catch (error) {
          console.error("Error loading users:", error);
        }
      }, [user, profile]);

      const updateUserSubscription = async (userId: string, tier: string) => {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_tier: tier,
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (error) throw error;
          loadUsers();
        } catch (error) {
          console.error("Error updating subscription:", error);
        }
      };

      const loadProperties = React.useCallback(async () => {
        if (!user) return;
        try {
          const [saved, { data: added }] = await Promise.all([
            getSavedProperties(user.id),
            supabase
              .from("properties")
              .select(
                `*,
                assigned_user:profiles!properties_assigned_user_id_fkey(full_name, email),
                author:profiles!properties_created_by_fkey(full_name, email)`,
              )
              .eq("created_by", user.id),
          ]);

          setAddedProperties(added || []);
          setSavedProperties(saved);

          // Calculate portfolio stats
          const totalProperties = (added || []).length + saved.length;
          const totalValue = [...(added || []), ...saved].reduce(
            (sum, prop) => sum + (prop.price || 0),
            0,
          );
          const averagePrice = totalValue / (totalProperties || 1);
          const totalProfit = [...(added || []), ...saved].reduce(
            (sum, prop) => sum + (prop.potential_profit || 0),
            0,
          );
          const monthlyIncome = [...(added || []), ...saved].reduce(
            (sum, prop) => sum + (prop.monthly_income || 0),
            0,
          );

          setPortfolioStats({
            totalProperties,
            totalValue,
            averagePrice,
            totalProfit,
            monthlyIncome,
          });
        } catch (error) {
          console.error("Error loading properties:", error);
        }
      }, [user]);

      React.useEffect(() => {
        if (!user) {
          navigate("/");
          return;
        }
        loadProperties();
        loadUsers();
      }, [user, navigate, loadProperties, loadUsers]);

      const handleInvestmentAnalysis = async (property: any) => {
        setAnalysisLoading(true);
        setAnalysisError(null);
        setCashFlowAnalysis(null);
        setCapRateAnalysis(null);
        setRoiForecasting(null);

        try {
          const cashFlowData = await generateCashFlowAnalysis(property);
          setCashFlowAnalysis(cashFlowData);

          const capRateData = await generateCapRateAnalysis(property);
          setCapRateAnalysis(capRateData);

          const roiData = await generateROIForecasting(property);
          setRoiForecasting(roiData);
        } catch (error: any) {
          console.error("Error generating investment analysis:", error);
          setAnalysisError("Failed to generate investment analysis. Please try again.");
          setCashFlowAnalysis(null);
          setCapRateAnalysis(null);
          setRoiForecasting(null);
        } finally {
          setAnalysisLoading(false);
        }
      };


      return (
        <Layout>
          <main className="container mx-auto px-4 py-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* ... Dashboard header and stats cards ... */}

              <Card> {/* Interactive Maps Card */}
                <CardHeader>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <MapIcon className="w-5 h-5" /> Interactive Maps
                  </h2>
                  <CardDescription>
                    Explore property surroundings and neighborhoods.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractiveMap />
                </CardContent>
              </Card>


              <Card> {/* Investment Analysis Dashboard Card */}
                <CardHeader>
                  <h2 className="text-2xl font-semibold">Investment Analysis Dashboard</h2>
                  <CardDescription>
                    AI-powered metrics to evaluate property investments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysisError && (
                    <p className="text-destructive text-sm">{analysisError}</p>
                  )}

                  <div className="space-y-4">
                    <Button onClick={() => handleInvestmentAnalysis({ /* Pass property details here, e.g., selected property or form data */ })} disabled={analysisLoading} className="w-full">
                      {analysisLoading ? "Generating Analysis..." : "Generate Analysis for Selected Property"}
                    </Button>
                    {cashFlowAnalysis && (
                      <div className="prose dark:prose-invert max-w-none">
                        <h3>Cash Flow Analysis</h3>
                        {cashFlowAnalysis.split("\n").map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    )}

                    {capRateAnalysis && (
                      <div className="prose dark:prose-invert max-w-none">
                        <h3>Cap Rate Analysis</h3>
                        {capRateAnalysis.split("\n").map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    )}

                    {roiForecasting && (
                      <div className="prose dark:prose-invert max-w-none">
                        <h3>ROI Forecasting (5-Year)</h3>
                        {roiForecasting.split("\n").map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ... Saved and Added Properties sections ... */}
              </div>
            </div>
          </main>

          <AddPropertyModal
            isOpen={isAddPropertyModalOpen}
            onClose={() => setIsAddPropertyModalOpen(false)}
            onSuccess={loadProperties}
          />
        </Layout>
      );
    }
