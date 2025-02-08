import React from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Building2, Star, Plus, TrendingUp, PoundSterling } from "lucide-react";
import { getSavedProperties } from "../lib/properties";
import { AddPropertyModal } from "./AddPropertyModal";
import PropertyCard from "./PropertyCard";
import { supabase } from "../lib/supabase";
import { Layout } from "./Layout";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = React.useState([]);
  const [addedProperties, setAddedProperties] = React.useState([]);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] =
    React.useState(false);
  const [portfolioStats, setPortfolioStats] = React.useState({
    totalProperties: 0,
    totalValue: 0,
    averagePrice: 0,
    totalProfit: 0,
    monthlyIncome: 0,
  });

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
  }, [user, navigate, loadProperties]);

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={() => setIsAddPropertyModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Property
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Portfolio Value</h3>
                  <PoundSterling className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">
                  £{portfolioStats.totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {portfolioStats.totalProperties} properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Average Price</h3>
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">
                  £{portfolioStats.averagePrice.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Per property
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Total Profit</h3>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">
                  £{portfolioStats.totalProfit.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Estimated profit
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Star className="w-5 h-5" /> Saved Properties
              </h2>
              <div className="space-y-4">
                {savedProperties.map((saved: any) => (
                  <PropertyCard
                    key={saved.property.id}
                    {...saved.property}
                    isSubscriber={true}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Added Properties
              </h2>
              <div className="space-y-4">
                {addedProperties.map((property: any) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    isSubscriber={true}
                  />
                ))}
              </div>
            </div>
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
