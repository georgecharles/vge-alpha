import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { getDeals } from "../lib/deals";
import type { Deal } from "../lib/deals";
import { DealCard } from "./DealCard";
import { DealModal } from "./DealModal";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import HeroSection from "./HeroSection";

export default function DealsPage() {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDeals() {
      if (!user) return;
      
      try {
        console.log('Loading deals for user:', user.id); // Debug log
        const dealsData = await getDeals();
        if (mounted) {
          console.log('Deals loaded:', dealsData); // Debug log
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

    if (!isLoading) {
      if (!user) {
        console.log('No user, redirecting to login'); // Debug log
        navigate('/login');
      } else {
        console.log('User authenticated, loading deals'); // Debug log
        loadDeals();
      }
    }

    return () => {
      mounted = false;
    };
  }, [user, isLoading, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  // If no user, don't render anything (navigation will handle redirect)
  if (!user) {
    return null;
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
            ) : (
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