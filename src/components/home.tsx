import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import PropertyCard from "./PropertyCard";
import MarketTrends from "./MarketTrends";
import { SubscriptionCTA } from "./SubscriptionCTA";
import { AuthModal } from "./AuthModal";
import { SubscriptionModal } from "./SubscriptionModal";
import { MessagesModal } from "./MessagesModal";
import { Footer } from "./Footer";
import { LegalDisclaimer } from "./LegalDisclaimer";
import { PartnersCarousel } from "./PartnersCarousel";
import { useAuth } from "../lib/auth";
import { searchProperties, getFeaturedProperties } from "../lib/properties";

const Home = () => {
  const { user, profile, signOut } = useAuth();
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    React.useState(false);
  const [authMode, setAuthMode] = React.useState("signin");
  const [isMessagesModalOpen, setIsMessagesModalOpen] = React.useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = React.useState();

  const loadFeaturedProperties = async () => {
    setIsSearching(true);
    try {
      // Mock featured properties
      const mockProperties = [
        {
          id: "1",
          address: "123 Mayfair Gardens, London, W1K 1AA",
          price: 1250000,
          squareFootage: 1850,
          bedrooms: 3,
          bathrooms: 2,
          isPremium: true,
          images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          ],
          author: {
            id: "1",
            full_name: "Sarah Johnson",
            email: "sarah@myvge.co.uk",
          },
        },
        {
          id: "2",
          address: "45 Kensington Park Road, London, W11 3BQ",
          price: 2450000,
          squareFootage: 2400,
          bedrooms: 4,
          bathrooms: 3,
          isPremium: true,
          images: [
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          ],
          author: {
            id: "2",
            full_name: "James Wilson",
            email: "james@myvge.co.uk",
          },
        },
        {
          id: "3",
          address: "88 Notting Hill Gate, London, W11 3HT",
          price: 1850000,
          squareFootage: 1950,
          bedrooms: 3,
          bathrooms: 2,
          isPremium: false,
          images: [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          ],
          author: {
            id: "3",
            full_name: "Emma Davis",
            email: "emma@myvge.co.uk",
          },
        },
        {
          id: "4",
          address: "15 Chelsea Manor Street, London, SW3 5RP",
          price: 3250000,
          squareFootage: 2800,
          bedrooms: 5,
          bathrooms: 4,
          isPremium: true,
          images: [
            "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          ],
          author: {
            id: "4",
            full_name: "Michael Smith",
            email: "michael@myvge.co.uk",
          },
        },
        {
          id: "5",
          address: "92 Eaton Square, London, SW1W 9AN",
          price: 4750000,
          squareFootage: 3200,
          bedrooms: 6,
          bathrooms: 5,
          isPremium: true,
          images: [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          ],
          author: {
            id: "5",
            full_name: "Lisa Brown",
            email: "lisa@myvge.co.uk",
          },
        },
        {
          id: "6",
          address: "33 Belgrave Square, London, SW1X 8PB",
          price: 5500000,
          squareFootage: 3500,
          bedrooms: 7,
          bathrooms: 6,
          isPremium: true,
          images: [
            "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          ],
          author: {
            id: "6",
            full_name: "David Thompson",
            email: "david@myvge.co.uk",
          },
        },
      ];

      setSearchResults(mockProperties);
    } catch (error) {
      console.error("Error loading featured properties:", error);
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    loadFeaturedProperties();

    const handleOpenAuthModal = (e) => {
      setAuthMode(e.detail.mode);
      setIsAuthModalOpen(true);
    };

    const handleOpenMessages = (e) => {
      setSelectedReceiverId(e.detail.receiverId);
      setIsMessagesModalOpen(true);
    };

    window.addEventListener("open-auth-modal", handleOpenAuthModal);
    window.addEventListener("open-messages", handleOpenMessages);

    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuthModal);
      window.removeEventListener("open-messages", handleOpenMessages);
    };
  }, []);

  const handleSearch = async (term) => {
    setIsSearching(true);
    try {
      const results = await searchProperties(term);
      setSearchResults(
        results.map((p) => ({
          id: p.id,
          address: `${p.address}, ${p.city}, ${p.postcode}`,
          price: p.price,
          squareFootage: p.square_footage,
          isPremium: p.is_premium,
        })),
      );
    } catch (error) {
      console.error("Error searching properties:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={!!user}
        userProfile={profile || undefined}
        onSignIn={() => {
          setAuthMode("signin");
          setIsAuthModalOpen(true);
        }}
        onSignUp={() => {
          setAuthMode("signup");
          setIsAuthModalOpen(true);
        }}
        onSignOut={async () => {
          try {
            await signOut();
            window.location.href = "/";
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }}
      />

      <main>
        <HeroSection onSearch={handleSearch} />

        <div className="w-full bg-background py-8">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <h2 className="text-2xl font-bold mb-6">Featured Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {isSearching
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="w-full h-[420px] bg-muted rounded-lg animate-pulse"
                      />
                    ))
                : searchResults.map((property) => (
                    <PropertyCard
                      key={property.id}
                      address={property.address}
                      price={property.price}
                      squareFootage={property.squareFootage}
                      isPremium={property.isPremium}
                      isSubscriber={profile?.subscription_tier !== "free"}
                    />
                  ))}
            </div>
          </div>
        </div>

        <MarketTrends />

        <PartnersCarousel />

        <div className="w-full bg-background py-8">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="mb-8">
              <LegalDisclaimer />
            </div>
          </div>
        </div>

        {(!profile || profile.subscription_tier === "free") && (
          <SubscriptionCTA
            onSubscribe={() => setIsSubscriptionModalOpen(true)}
            title="Unlock Premium Property Insights"
            description="Get access to detailed property analysis, market comparisons, and investment metrics to make informed decisions."
          />
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <MessagesModal
        isOpen={isMessagesModalOpen}
        onClose={() => setIsMessagesModalOpen(false)}
        receiverId={selectedReceiverId}
      />
    </div>
  );
};

export default Home;
