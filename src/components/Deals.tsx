import React from "react";
import { Deal, getDeals, searchDeals } from "../lib/deals";
import { DealCard } from "./DealCard";
import { useAuth } from "../lib/auth";
import Header from "./Header";
import { Footer } from "./Footer";
import HeroSection from "./HeroSection";
import { LoadingSpinner } from "./ui/loading-spinner";
import { DealModal } from "./DealModal";
import { Alert } from "./ui/alert";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

// Auth context checker wrapper
const AuthContextChecker = ({ children }: { children: React.ReactNode }) => {
  try {
    // Try to access auth context but don't use the result
    useAuth();
    // If we get here, auth context is available
    return <>{children}</>;
  } catch (error) {
    // If auth context is not available, show a fallback
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Header />
        <Card className="p-6 max-w-md w-full my-8">
          <h2 className="text-xl font-bold mb-4 text-center">Authentication Error</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Unable to load authentication. Please refresh the page or try again later.
          </p>
          <Button 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Card>
        <Footer />
      </div>
    );
  }
};

export const Deals = () => {
  return (
    <AuthContextChecker>
      <DealsContent />
    </AuthContextChecker>
  );
};

const DealsContent = () => {
  const { profile, user } = useAuth();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = React.useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const loadingRef = React.useRef(false);
  const DEALS_PER_PAGE = 6;

  const loadDeals = async (pageNum = 1, isLoadingMore = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setError(null);

    try {
      if (!isLoadingMore) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      
      console.log('Fetching deals page:', pageNum);
      const fetchedDeals = await getDeals(pageNum, DEALS_PER_PAGE);
      console.log('Received deals:', fetchedDeals);
      
      if (pageNum === 1) {
        setDeals(fetchedDeals);
      } else {
        setDeals(prev => [...prev, ...fetchedDeals]);
      }
      
      setHasMore(fetchedDeals.length === DEALS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading deals:", error);
      setError(
        error instanceof Error 
          ? `Failed to load deals: ${error.message}` 
          : "Failed to load deals. Please try again later."
      );
      setDeals([]); // Clear deals on error
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      loadingRef.current = false;
    }
  };

  // Initial load with error boundary
  React.useEffect(() => {
    console.log('Initial load effect running');
    loadDeals(1, false).catch(error => {
      console.error('Effect error:', error);
      setError(
        error instanceof Error 
          ? `Failed to load deals: ${error.message}` 
          : "Failed to load deals. Please try again later."
      );
    });
  }, []);

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    if (!observerTarget.current || isSearching) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadDeals(page + 1, true);
        }
      },
      { 
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, page, isSearching]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setDeals([]);
      setIsSearching(false);
      setPage(1);
      setHasMore(true);
      loadDeals(1, false);
      return;
    }

    setIsSearching(true);
    setIsLoading(true);
    setDeals([]);

    try {
      console.log('Searching for term:', term);
      const results = await searchDeals(term);
      console.log('Search results:', results);
      setDeals(results);
      setHasMore(false);
      setPage(1);
    } catch (error) {
      console.error("Error searching deals:", error);
      setDeals([]);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection 
          onSearch={handleSearch}
          title="Exclusive Property Deals"
          subtitle="Discover below-market-value properties, development opportunities, and high-yield investments"
        />

        <div className="w-full bg-background py-8">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <h2 className="text-2xl font-bold mb-6">
              {isSearching ? "Search Results" : "Available Deals"}
            </h2>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <p>{error}</p>
                <button 
                  onClick={() => loadDeals(1, false)}
                  className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-[420px] bg-muted rounded-lg animate-pulse"
                  />
                ))
              ) : deals.length > 0 ? (
                deals.map((deal) => (
                  <div 
                    key={deal.id}
                    onClick={() => {
                      console.log('Deal clicked:', deal);
                      setSelectedDeal(deal);
                      setIsDealModalOpen(true);
                    }}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <DealCard
                      deal={deal}
                      isSubscriber={profile?.subscription_tier !== "free"}
                      user={user}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  {error ? (
                    <div>
                      <p>Error loading deals</p>
                      <p className="text-sm text-muted-foreground mt-2">{error}</p>
                    </div>
                  ) : (
                    'No deals found'
                  )}
                </div>
              )}
            </div>
            
            {hasMore && !isLoading && !isSearching && (
              <div 
                ref={observerTarget} 
                className="h-24 flex items-center justify-center my-8"
              >
                {isFetchingMore ? (
                  <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner />
                    <p className="text-sm text-muted-foreground">Loading more deals...</p>
                  </div>
                ) : (
                  <div className="h-8" />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        deal={selectedDeal}
        isSubscriber={profile?.subscription_tier !== 'free'}
      />
    </div>
  );
}; 