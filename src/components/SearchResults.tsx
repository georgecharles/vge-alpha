import React from "react";
import PropertyCard from "./PropertyCard";
import { Layout } from "./Layout";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { PageTransition } from "./ui/page-transition";

interface FeaturedPropertiesProps {
  results?: any[];
  isSubscriber?: boolean;
  isLoading?: boolean;
}

const FeaturedProperties = ({
  results,
  isSubscriber = false,
  isLoading = false,
}: FeaturedPropertiesProps = {}) => {
  const { user, profile } = useAuth();
  const [properties, setProperties] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (results) {
      setProperties(results);
    } else {
      const loadDeals = async () => {
        try {
          const { data, error } = await supabase
            .from("deals")
            .select(
              `
              id,
              title,
              description,
              property_id,
              type,
              status,
              original_price,
              deal_price,
              potential_profit,
              roi_percentage,
              created_by,
              created_at,
              updated_at,
              is_premium,
              images,
              location,
              key_features,
              created_by:profiles!deals_created_by_fkey(full_name, email)
            `,
            )
            .order("created_at", { ascending: false });

          if (error) throw error;
          setProperties(
            data?.map((deal) => ({
              id: deal.id,
              address: deal.title || "No Title",
              price: deal.deal_price || 0,
              original_price: deal.original_price || 0,
              squareFootage: 0,
              bedrooms: 0,
              bathrooms: 0,
              isPremium: deal.is_premium || false,
              author: deal.created_by,
              type: deal.type || "Unknown",
              status: deal.status || "Available",
              potential_profit: deal.potential_profit || 0,
              roi_percentage: deal.roi_percentage || 0,
              images: deal.images || [],
              location: deal.location || "",
              key_features: deal.key_features || [],
            })) || [],
          );
        } catch (error) {
          console.error("Error loading deals:", error);
        }
      };
      loadDeals();
    }
  }, [results]);

  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="Investment Deals"
          subtitle="Discover exclusive property investment opportunities"
          backgroundImage="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3"
          showSearch={true}
          showStats={false}
          height="h-[400px]"
        />
        <div className="w-full min-h-[600px] bg-background p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Available Deals</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full h-[420px] bg-muted rounded-lg"
                  />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  No Available Deals
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Check back later for new investment opportunities
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    address={property.address}
                    price={property.price}
                    original_price={property.original_price}
                    squareFootage={property.squareFootage}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    isPremium={property.isPremium}
                    isSubscriber={profile?.subscription_tier !== "free"}
                    author={property.author}
                    type={property.type}
                    status={property.status}
                    potential_profit={property.potential_profit}
                    roi_percentage={property.roi_percentage}
                    images={property.images}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </PageTransition>
  );
};

export default FeaturedProperties;
