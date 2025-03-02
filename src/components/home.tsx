import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import PropertyCard from "./PropertyCard";
import MarketTrends from "./MarketTrends";
import { AuthModal } from "./AuthModal";
import { SubscriptionModal } from "./SubscriptionModal";
import { MessagesModal } from "./MessagesModal";
import { Footer } from "./Footer";
import { LegalDisclaimer } from "./LegalDisclaimer";
import { useAuth } from "../lib/auth";
import { searchProperties, getFeaturedProperties, Property } from "../lib/properties";
import { Marquee } from "./ui/Marquee";
import { cn } from "../lib/utils";
import { LiquidChrome } from "./LiquidChrome";
import { PropertyModal } from "./PropertyModal";
import { LoadingSpinner } from "./ui/loading-spinner";

type AuthMode = "signin" | "signup";

const reviews = [
  {
    name: "Savills",
    username: "@savills",
    body: "Leading the way in property investment and market analysis.",
    img: "https://avatar.vercel.sh/savills",
  },
  {
    name: "Knight Frank",
    username: "@knightfrank",
    body: "Exceptional platform for property investment insights.",
    img: "https://avatar.vercel.sh/knightfrank",
  },
  {
    name: "JLL",
    username: "@jll",
    body: "Revolutionary approach to property investment analytics.",
    img: "https://avatar.vercel.sh/jll",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);
const thirdRow = reviews.slice(0, reviews.length / 2);
const fourthRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-36 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

const Home = () => {
  const { user, profile, signOut } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [searchResults, setSearchResults] = React.useState<Property[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    React.useState(false);
  const [authMode, setAuthMode] = React.useState("signin");
  const [isMessagesModalOpen, setIsMessagesModalOpen] = React.useState(false);
  const [selectedReceiverId] = React.useState();
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const PROPERTIES_PER_PAGE = 6;
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = React.useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const loadingRef = React.useRef(false);

  const loadFeaturedProperties = async (pageNum = 1, isLoadingMore = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (!isLoadingMore) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      
      console.log('Fetching page:', pageNum);
      const properties = await getFeaturedProperties(pageNum, PROPERTIES_PER_PAGE);
      console.log('Received properties:', properties);
      
      if (pageNum === 1) {
        setSearchResults(properties);
      } else {
        setSearchResults(prev => [...prev, ...properties]);
      }
      
      setHasMore(properties.length === PROPERTIES_PER_PAGE);
      setPage(pageNum);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      loadingRef.current = false;
    }
  };

  React.useEffect(() => {
    if (isInitialLoad) {
      loadFeaturedProperties(1, false);
    }
  }, [isInitialLoad]);

  React.useEffect(() => {
    if (!observerTarget.current || isInitialLoad || isSearching) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadFeaturedProperties(page + 1, true);
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
      setSearchResults([]);
      setIsSearching(false);
      setPage(1);
      setHasMore(true);
      setIsLoading(true);
      try {
        const properties = await getFeaturedProperties(1, PROPERTIES_PER_PAGE);
        setSearchResults(properties);
        setHasMore(properties.length === PROPERTIES_PER_PAGE);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsSearching(true);
    setSearchResults([]); // Clear existing results before search
    try {
      const results = await searchProperties(term);
      // Map the results to match the Property interface
      const mappedResults = results.map(p => ({
        id: p.id,
        title: p.title,
        location: p.location,
        price: p.price,
        sqft: p.sqft,
        beds: p.beds,
        baths: p.baths,
        description: p.description,
        image_url: p.image_url,
        is_featured: p.is_featured,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
      
      setSearchResults(mappedResults);
      setHasMore(false); // Disable infinite scroll for search results
      setPage(1); // Reset page number
    } catch (error) {
      console.error("Error searching properties:", error);
      setSearchResults([]); // Clear results on error
    } finally {
      setIsSearching(false);
    }
  };

  // Render conditions
  const showLoading = isLoading;
  const showProperties = searchResults && searchResults.length > 0;
  console.log('Render state:', { 
    isLoading, 
    searchResultsLength: searchResults?.length,
    showLoading,
    showProperties 
  });

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
            <h2 className="text-2xl font-bold mb-6">
              {isSearching ? "Search Results" : "Featured Properties"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {showLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-[420px] bg-muted rounded-lg animate-pulse"
                  />
                ))
              ) : showProperties ? (
                searchResults.map((property) => (
                  <div 
                    key={property.id} 
                    onClick={() => {
                      setSelectedProperty(property);
                      setIsPropertyModalOpen(true);
                    }}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <PropertyCard
                      id={property.id}
                      address={property.location}
                      price={property.price}
                      squareFootage={property.sqft}
                      bedrooms={property.beds}
                      bathrooms={property.baths}
                      isPremium={property.is_featured}
                      propertyType="residential"
                      description={property.description}
                      createdAt={property.created_at}
                      images={property.image_url ? [property.image_url] : []}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No properties found
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
                    <p className="text-sm text-muted-foreground">Loading more properties...</p>
                  </div>
                ) : (
                  <div className="h-8" />
                )}
              </div>
            )}
          </div>
        </div>

        <MarketTrends />

            {/* Trusted by Industry Leaders Section */}
        <section className="w-full py-12 bg-background">
          <div className="container mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
  
          </div>
          <div className="relative flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
            <div
              className="flex flex-row items-center gap-4"
              style={{
                transform:
                  "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
              }}
            >
              <Marquee pauseOnHover vertical className="[--duration:20s]">
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
                {thirdRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee pauseOnHover className="[--duration:20s]" vertical>
                {fourthRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
          </div>
        </section>

        <div className="w-full bg-background py-8">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="mb-8">
              <LegalDisclaimer />
            </div>
          </div>
        </div>

        {(!profile || profile.subscription_tier === "free") && (
          <div className="w-full bg-background py-16">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
              <div className="relative w-full rounded-3xl overflow-hidden">
                {/* LiquidChrome Background */}
                <div className="absolute inset-0">
                  <LiquidChrome
                    baseColor={[0.1, 0.1, 0.1]}
                    speed={1}
                    amplitude={0.6}
                    interactive={true}
                  />
                </div>
                
                {/* Background Overlay with Blur */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[8px]" />
                
                {/* Content */}
                <div className="relative z-10 text-center py-12 px-8">
                  <h2 className="text-3xl font-bold mb-4 text-white">
                    Unlock Premium Property Insights
                  </h2>
                  <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    Get access to detailed property analysis, market comparisons, and investment metrics to make informed decisions.
                  </p>
                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="px-8 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode as AuthMode}
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

      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={selectedProperty}
      />
    </div>
  );
};

export default Home;
