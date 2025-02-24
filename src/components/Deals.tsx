import React from "react";
import { Deal, getDeals } from "../lib/deals";
import { DealCard } from "./DealCard";
import { useAuth } from "../lib/auth";
import Header from "./Header";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";

export const Deals = () => {
  const { user, profile, signOut } = useAuth();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const DEALS_PER_PAGE = 6;

  const loadDeals = async (pageNum = 1) => {
    if (pageNum === 1) {
      setIsLoading(true);
    }
    
    try {
      const fetchedDeals = await getDeals(pageNum, DEALS_PER_PAGE);
      if (pageNum === 1) {
        setDeals(fetchedDeals);
      } else {
        setDeals(prev => [...prev, ...fetchedDeals]);
      }
      setHasMore(fetchedDeals.length === DEALS_PER_PAGE);
    } catch (error) {
      console.error("Error loading deals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    // Implement deal search functionality if needed
    console.log("Searching deals:", term);
  };

  React.useEffect(() => {
    loadDeals();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadDeals(nextPage);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={!!user}
        userProfile={profile || undefined}
        onSignIn={() => {
          // Implement sign in logic
        }}
        onSignUp={() => {
          // Implement sign up logic
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
        <HeroSection 
          onSearch={handleSearch}
          title="Investment Deals"
          subtitle="Discover exclusive property investment opportunities"
        />

        <div className="w-full bg-background py-8">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <h2 className="text-2xl font-bold mb-6">Featured Deals</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoading && page === 1 ? (
                Array(3).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-[420px] bg-muted rounded-lg animate-pulse"
                  />
                ))
              ) : (
                deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isSubscriber={profile?.subscription_tier !== "free"}
                  />
                ))
              )}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mb-16">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}; 