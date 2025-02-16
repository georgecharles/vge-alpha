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
      const results = await getFeaturedProperties();
      setSearchResults(
        results.map((p) => ({
          id: p.id,
          address: `${p.address}, ${p.city}, ${p.postcode}`,
          price: p.price,
          squareFootage: p.square_footage,
          isPremium: p.is_premium,
          assigned_user: p.assigned_user,
          author: p.author,
        })),
      );
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
