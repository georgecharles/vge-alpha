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
import { useAuth } from "../lib/auth";
import { searchProperties, getFeaturedProperties, Property } from "../lib/properties";
import { Marquee } from "./ui/Marquee";
import { cn } from "../lib/utils";

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
  const [searchResults, setSearchResults] = React.useState<Property[]>([]);
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
      const properties = await getFeaturedProperties();
      setSearchResults(properties.map(p => ({
        ...p,
        bedroom: p.bedrooms,
        bathroom: p.bathrooms,
        property_type: p.property_type
      })));
    } catch (error) {
      console.error("Error loading featured properties:", error);
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    loadFeaturedProperties();

    const handleOpenAuthModal = (e: CustomEvent<{mode: string}>) => {
      setAuthMode(e.detail.mode);
      setIsAuthModalOpen(true);
    };
    const handleOpenMessages = (e: CustomEvent<{receiverId: string}>) => {
      setSelectedReceiverId(e.detail.receiverId as any); // Type assertion to fix type error
      setIsMessagesModalOpen(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuthModal as EventListenerOrEventListenerObject);
    window.addEventListener("open-messages", handleOpenMessages as EventListenerOrEventListenerObject);

    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuthModal as EventListenerOrEventListenerObject);
      window.removeEventListener("open-messages", handleOpenMessages as EventListenerOrEventListenerObject);
    };
  }, []);

  const handleSearch = async (term: string) => {
    setIsSearching(true);
    try {
      const results = await searchProperties(term);
      setSearchResults(results.map(p => ({
        ...p,
        bedroom: p.bedrooms,
        bathroom: p.bathrooms,
        property_type: p.property_type
      })));
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
              {isSearching ? (
                Array(3).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-[420px] bg-muted rounded-lg animate-pulse"
                  />
                ))
              ) : (
                searchResults.map((property) => (
                  <PropertyCard
                    key={property.id}
                    address={`${property.address}, ${property.city}, ${property.postcode}`}
                    price={property.price}
                    squareFootage={property.square_footage}
                    isPremium={property.is_premium}
                    isSubscriber={profile?.subscription_tier !== "free"}
                    bedrooms={property.bedroom}
                    bathrooms={property.bathroom}
                    images={property.images}
                    description={property.description}
                    propertyType={property.property_type}
                    createdAt={property.created_at}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <MarketTrends />

            {/* Trusted by Industry Leaders Section */}
        <section className="w-full py-12 bg-background">
          <div className="container mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-muted-foreground">
              Join the leading property investment professionals who trust our platform
            </p>
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
    </div>
  );
};

export default Home;
