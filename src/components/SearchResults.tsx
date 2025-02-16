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

const FeaturedProperties = ({
  results,
  isSubscriber = false,
  isLoading = false,
}: FeaturedPropertiesProps = {}) => {
  const { user, profile } = useAuth();
  const [properties, setProperties] = React.useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);

  const handleMessageAuthor = (authorId: string) => {
    // Open the chat with the selected author
    const event = new CustomEvent("open-messages", {
      detail: { receiverId: authorId },
    });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    if (results) {
      setProperties(results);
    } else {
      // Mock data for deals
      const mockDeals = [
        {
          id: "1",
          title: "High-Yield Student Housing Investment",
          deal_price: 450000,
          original_price: 500000,
          potential_profit: 150000,
          roi_percentage: 33.3,
          author: {
            id: "1",
            full_name: "Sarah Johnson",
            email: "sarah@example.com",
          },
          images: [
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
          ],
        },
        {
          id: "2",
          title: "Commercial Property Development Opportunity",
          deal_price: 850000,
          original_price: 950000,
          potential_profit: 300000,
          roi_percentage: 35.3,
          author: {
            id: "2",
            full_name: "Michael Smith",
            email: "michael@example.com",
          },
          images: [
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
          ],
        },
        {
          id: "3",
          title: "City Center Apartment Block",
          deal_price: 1200000,
          original_price: 1400000,
          potential_profit: 400000,
          roi_percentage: 33.3,
          author: {
            id: "3",
            full_name: "Emma Davis",
            email: "emma@example.com",
          },
          images: [
            "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8",
          ],
        },
        {
          id: "4",
          title: "Mixed-Use Development Site",
          deal_price: 2500000,
          original_price: 2800000,
          potential_profit: 900000,
          roi_percentage: 36,
          author: {
            id: "4",
            full_name: "James Wilson",
            email: "james@example.com",
          },
          images: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c",
          ],
        },
        {
          id: "5",
          title: "Retail Park Investment",
          deal_price: 3500000,
          original_price: 4000000,
          potential_profit: 1200000,
          roi_percentage: 34.3,
          author: {
            id: "5",
            full_name: "Lisa Brown",
            email: "lisa@example.com",
          },
          images: [
            "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
          ],
        },
      ];
      setProperties(mockDeals);
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
