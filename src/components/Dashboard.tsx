import React from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Building2,
  Star,
  TrendingUp,
  PoundSterling,
  Users,
  Bitcoin,
} from "lucide-react";
import { getSavedProperties } from "../lib/properties";
import { PropertyCard } from "./PropertyCard";
import { supabase } from "../lib/supabase";
import { Layout } from "./Layout";
import { BitcoinPrice } from "./BitcoinPrice";
import { updateUserProfile, getAllUsers } from '../lib/users';
import { PropertyImporter } from './PropertyImporter';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = React.useState<any[]>([]);
  const [addedProperties, setAddedProperties] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [portfolioStats, setPortfolioStats] = React.useState({
    totalProperties: 0,
    totalValue: 0,
    averagePrice: 0,
    totalProfit: 0,
    monthlyIncome: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    if (!user || profile?.role !== "admin") return;
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  const handleUserUpdate = async (userId: string, updates: any) => {
    try {
      setIsLoading(true);
      console.log('Attempting to update user:', userId);
      console.log('Updates:', updates);

      const updatedProfile = await updateUserProfile(userId, updates);
      console.log('Update successful:', updatedProfile);

      // Refresh the users list
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      
      alert('User updated successfully');
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error.message || 'Failed to update user. Please check console for details.');
    } finally {
      setIsLoading(false);
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

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <PropertyImporter />
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

          {profile?.role === 'admin' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" /> User Management
                </h2>
              </div>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div key={user.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserUpdate(user.id, { role: e.target.value })}
                            className="border rounded p-1"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                          <select
                            value={user.subscription_tier}
                            onChange={(e) => handleUserUpdate(user.id, { subscription_tier: e.target.value })}
                            className="border rounded p-1"
                          >
                            <option value="free">Free</option>
                            <option value="basic">Basic</option>
                            <option value="pro">Pro</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    isSubscriber={profile?.subscription_tier !== 'free'}
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
                    isSubscriber={profile?.subscription_tier !== 'free'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
