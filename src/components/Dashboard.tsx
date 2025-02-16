import React from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Building2,
  Star,
  Plus,
  TrendingUp,
  PoundSterling,
  Users,
  Crown,
  Bitcoin,
} from "lucide-react";
import { getSavedProperties } from "../lib/properties";
import { AddPropertyModal } from "./AddPropertyModal";
import PropertyCard from "./PropertyCard";
import { supabase } from "../lib/supabase";
import { Layout } from "./Layout";
import { BitcoinPrice } from "./BitcoinPrice";

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">BTC Value</h3>
                  <Bitcoin className="w-5 h-5 text-[#F7931A]" />
                </div>
                <BitcoinPrice amount={portfolioStats.totalValue} />
                <p className="text-sm text-muted-foreground mt-2">
                  Portfolio in BTC
                </p>
              </CardContent>
            </Card>
          </div>

          {profile?.role === "admin" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" /> User Management
              </h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-primary" />
                          <select
                            value={user.subscription_tier}
                            onChange={(e) =>
                              updateUserSubscription(user.id, e.target.value)
                            }
                            className="bg-background border rounded px-2 py-1"
                          >
                            <option value="free">Free</option>
                            <option value="basic">Basic</option>
                            <option value="pro">Pro</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={async (e) => {
                              try {
                                const { error } = await supabase
                                  .from("profiles")
                                  .update({ role: e.target.value })
                                  .eq("id", user.id);
                                if (error) throw error;
                                loadUsers();
                              } catch (error) {
                                console.error("Error updating role:", error);
                              }
                            }}
                            className="bg-background border rounded px-2 py-1"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (
                              confirm(
                                "Are you sure you want to delete this user?",
                              )
                            ) {
                              try {
                                const { error } = await supabase
                                  .from("profiles")
                                  .delete()
                                  .eq("id", user.id);
                                if (error) throw error;
                                loadUsers();
                              } catch (error) {
                                console.error("Error deleting user:", error);
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const newPassword = prompt("Enter new password:");
                            if (newPassword) {
                              try {
                                const { error } =
                                  await supabase.auth.admin.updateUserById(
                                    user.id,
                                    { password: newPassword },
                                  );
                                if (error) throw error;
                                alert("Password updated successfully");
                              } catch (error) {
                                console.error(
                                  "Error resetting password:",
                                  error,
                                );
                                alert("Failed to reset password");
                              }
                            }
                          }}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
