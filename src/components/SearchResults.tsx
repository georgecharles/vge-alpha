import React from "react";
import PropertyCard from "./PropertyCard";
import { Layout } from "./Layout";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { PageTransition } from "./ui/page-transition";
import { PropertyDetailsModal } from "./PropertyDetailsModal";

interface FeaturedPropertiesProps {
  results?: any[];
  isSubscriber?: boolean;
  isLoading?: boolean;
}

export async function getFeaturedDeals(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("deals", { schema: 'public' })
    .select(
      `
      *,
      assigned_user:profiles!deals_assigned_user_id_fkey(id, full_name, email),
      author:profiles!deals_created_by_fkey(id, full_name, email)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching featured deals:", error);
    throw error;
  }

  return data as Property[];
}

const FeaturedProperties = ({
  results,
  isSubscriber = false,
  isLoading: isLoadingProp = false, // rename prop to avoid conflict
}: FeaturedPropertiesProps = {}) => {
  const { user, profile } = useAuth();
  const [properties, setProperties] = React.useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(isLoadingProp); // use local state

  const handleMessageAuthor = (authorId: string) => {
    // Open the chat with the selected author
    const event = new CustomEvent("open-messages", {
      detail: { receiverId: authorId },
    });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    const loadDeals = async () => {
      setIsLoading(true);
      try {
        const data = await getFeaturedDeals();
        setProperties(data);
      } catch (error) {
        console.error("Error loading featured deals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeals();
  }, []);

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
                    address={property.property?.address || property.title}
                    price={property.deal_price || property.property?.price}
                    original_price={property.original_price}
                    squareFootage={property.property?.square_footage}
                    bedrooms={property.property?.bedrooms}
                    bathrooms={property.property?.bathrooms}
                    isPremium={property.is_premium}
                    isSubscriber={profile?.subscription_tier !== "free"}
                    author={property.author}
                    type="deal"
                    status={property.status}
                    potential_profit={property.potential_profit}
                    roi_percentage={property.roi_percentage}
                    images={[
                      property.images && typeof property.images === "string"
                        ? property.images
                        : Array.isArray(property.images) &&
                            property.images.length > 0
                          ? property.images[0]
                          : `https://source.unsplash.com/random/800x600?semi,detached&sig=${property.id}`,
                    ]}
                    onMessageAuthor={handleMessageAuthor}
                    onClick={() => setSelectedProperty(property)}
                  />
                ))}
              </div>
            )}

            {selectedProperty && (
              <PropertyDetailsModal
                isOpen={!!selectedProperty}
                onClose={() => setSelectedProperty(null)}
                property={selectedProperty}
                onMessageAuthor={handleMessageAuthor}
              />
            )}
          </div>
        </div>
      </Layout>
    </PageTransition>
  );
};

export default FeaturedProperties;
