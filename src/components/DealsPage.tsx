import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { getDeals } from "../lib/deals";
import type { Deal } from "../lib/deals";
import { DealCard } from "./DealCard";
import { DealModal } from "./DealModal";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import HeroSection from "./HeroSection";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { LogIn, UserPlus } from "lucide-react";

interface DealsPageProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export default function DealsPage({ onSignIn, onSignUp }: DealsPageProps) {
  const { user, profile, isLoading } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDeals() {
      try {
        const dealsData = await getDeals();
        if (mounted) {
          setDeals(dealsData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading deals:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDeals(); // Load deals regardless of auth state

    return () => {
      mounted = false;
    };
  }, []); // Remove user and isLoading from dependencies

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-screen bg-neutral">
          <HeroSection
            title="Property Deals"
            subtitle="Discover exclusive property investment opportunities"
            showSearch={true}
            showStats={false}
            height="h-[400px]"
            image="/deals-hero.jpg"
          />

          <main className="container mx-auto px-4 py-8">
            {loading ? (
              <div className="text-center py-8">Loading deals...</div>
            ) : !user ? (
              // Paywall for non-authenticated users
              <div className="max-w-4xl mx-auto">
                <Card className="p-8 text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Sign in to View Full Deal Details</h2>
                  <p className="text-muted-foreground mb-8">
                    Get access to exclusive property deals and investment opportunities. 
                    Create an account or sign in to view all available deals.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={onSignIn}
                      className="flex items-center gap-2"
                    >
                      <LogIn className="w-4 w-4" />
                      Sign In
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={onSignUp}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="w-4 w-4" />
                      Create Account
                    </Button>
                  </div>
                </Card>

                {/* Show preview of deals */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {deals.map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal}
                      isSubscriber={false}
                      onClick={onSignIn}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Full access for authenticated users
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => (
                  <DealCard 
                    key={deal.id} 
                    deal={deal}
                    isSubscriber={profile?.subscription_tier !== 'free'}
                    onClick={() => setSelectedDeal(deal)}
                  />
                ))}
              </div>
            )}
          </main>

          <DealModal
            isOpen={!!selectedDeal}
            onClose={() => setSelectedDeal(null)}
            deal={selectedDeal}
            isSubscriber={profile?.subscription_tier !== 'free'}
          />
        </div>
      </PageTransition>
    </Layout>
  );
} 