import React from "react";
import { Deal, getDeals, searchDeals } from "../lib/deals";
import { DealCard } from "./DealCard";
import { useAuth } from "../lib/auth";
import Header from "./Header";
import { Footer } from "./Footer";
import HeroSection from "./HeroSection";
import { LoadingSpinner } from "./ui/loading-spinner";
import { DealModal } from "./DealModal";

export const Deals = () => {
  const { profile } = useAuth();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSearching, setIsSearching] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const loadingRef = React.useRef(false);
  const DEALS_PER_PAGE = 6;
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = React.useState(false);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  const loadDeals = async (pageNum = 1, isLoadingMore = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (!isLoadingMore) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      
      const fetchedDeals = await getDeals(pageNum, DEALS_PER_PAGE);
      
      if (pageNum === 1) {
        setDeals(fetchedDeals);
      } else {
        setDeals(prev => [...prev, ...fetchedDeals]);
      }
      
      setHasMore(fetchedDeals.length === DEALS_PER_PAGE);
      setPage(pageNum);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Error loading deals:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      loadingRef.current = false;
    }
  };

  // Initial load
  React.useEffect(() => {
    if (isInitialLoad) {
      loadDeals(1, false);
    }
  }, [isInitialLoad]);

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    if (!observerTarget.current || isInitialLoad || isSearching) return;

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
  }, [hasMore, page, isInitialLoad, isSearching]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      // Reset all states when clearing search
      setDeals([]);
      setIsSearching(false);
      setPage(1);
      setHasMore(true);
      loadDeals(1, false); // Use the existing loadDeals function
      return;
    }

    setIsSearching(true);
    setIsLoading(true); // Show loading state during search
    setDeals([]); // Clear existing results before search

    try {
      console.log('Searching for term:', term);
      const results = await searchDeals(term);
      console.log('Search results:', results);

      if (results.length === 0) {
        console.log('No results found');
      }

      setDeals(results);
      setHasMore(false); // Disable infinite scroll for search results
      setPage(1); // Reset page number
    } catch (error) {
      console.error("Error searching deals:", error);
      setDeals([]); // Clear results on error
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
                      setSelectedDeal(deal);
                      setIsDealModalOpen(true);
                    }}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <DealCard
                      deal={deal}
                      isSubscriber={profile?.subscription_tier !== "free"}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No deals found
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