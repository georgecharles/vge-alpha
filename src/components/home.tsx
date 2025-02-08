import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import PropertyCard from "./PropertyCard";
import MarketTrends from "./MarketTrends";
import { SubscriptionCTA } from "./SubscriptionCTA";
import { AuthModal } from "./AuthModal";
import { SubscriptionModal } from "./SubscriptionModal";
import { MessagesModal } from "./MessagesModal";
import { PageTransition } from "@/components/ui/page-transition";
import { Footer } from "./Footer";
import { LegalDisclaimer } from "./LegalDisclaimer";

import { useAuth } from "../lib/auth";
import { searchProperties, getFeaturedProperties } from "../lib/properties";

interface HomeProps {}

const Home = ({}: HomeProps) => {
  const { user, profile, signOut } = useAuth();
  const [searchResults, setSearchResults] = React.useState<
    Array<{
      id: string;
      address: string;
      price: number;
      squareFootage: number;
      isPremium: boolean;
    }>
  >([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");
  const [isMessagesModalOpen, setIsMessagesModalOpen] = React.useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = React.useState<string>();

  const loadFeaturedProperties = async () => {
    setIsSearching(true);
    try {
      const results = await getFeaturedProperties();
      setSearchResults(
        results.map((p: any) => ({
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

    const handleOpenAuthModal = (
      e: CustomEvent<{ mode: "signin" | "signup" }>,
    ) => {
      setAuthMode(e.detail.mode);
      setIsAuthModalOpen(true);
    };

    const handleOpenMessages = (e: CustomEvent<{ receiverId: string }>) => {
      setSelectedReceiverId(e.detail.receiverId);
      setIsMessagesModalOpen(true);
    };

    window.addEventListener(
      "open-auth-modal",
      handleOpenAuthModal as EventListener,
    );
    window.addEventListener(
      "open-messages",
      handleOpenMessages as EventListener,
    );

    return () => {
      window.removeEventListener(
        "open-auth-modal",
        handleOpenAuthModal as EventListener,
      );
      window.removeEventListener(
        "open-messages",
        handleOpenMessages as EventListener,
      );
    };
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
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

  const handleSubscribe = () => {
    setIsSubscriptionModalOpen(true);
  };

  return (
    <PageTransition>
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

          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background backdrop-blur-[2px]" />
            <div className="container relative mx-auto px-4 py-16">
              <div className="max-w-7xl mx-auto">
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
          </div>

          <MarketTrends />
          <div className="container mx-auto px-4 py-8">
            <LegalDisclaimer />
          </div>
          <div className="max-w-7xl mx-auto mb-16 prose dark:prose-invert backdrop-blur-sm bg-background/80 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">
              Your Gateway to Property Investment Success
            </h2>
            <p>
              Welcome to MyVGE, your comprehensive platform for property
              investment and market analysis in the UK. We combine cutting-edge
              technology with expert market insights to help investors make
              informed decisions in today's dynamic real estate market.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Why Choose MyVGE?
            </h3>
            <ul>
              <li>
                Access to premium property listings with detailed analytics
              </li>
              <li>Real-time market insights and trend analysis</li>
              <li>Advanced investment calculators and ROI projections</li>
              <li>Expert research reports and market commentary</li>
              <li>Comprehensive property portfolio management tools</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Market Overview
            </h3>
            <p>
              The UK property market continues to evolve, presenting both
              challenges and opportunities for investors. Our platform provides
              you with the tools and insights needed to navigate this landscape
              effectively, from detailed property analytics to comprehensive
              market research.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Investment Opportunities
            </h3>
            <p>
              Discover prime investment opportunities across the UK, with
              detailed analysis of emerging markets, yield potential, and growth
              forecasts. Our premium features help you identify properties that
              align with your investment strategy and goals.
            </p>
          </div>

          {(!profile || profile.subscription_tier === "free") && (
            <SubscriptionCTA
              onSubscribe={handleSubscribe}
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
    </PageTransition>
  );
};

export default Home;
