import React, { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { ResearchReports } from "./ResearchReports";
import { PageTransition } from "./ui/page-transition";
import { Button } from "./ui/button";
import { SubscriptionModal } from "./SubscriptionModal";
import { getDeals } from '../lib/deals';
import { DealCard } from './DealCard';
import { useNavigate } from 'react-router-dom';
import type { Deal } from '../lib/deals';
import { Layout } from "./Layout";

export default function ResearchPage() {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    React.useState(false);

  // Remove the subscription check for now
  const isPro = true; // Temporarily allow access to all users

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

    // Only load deals if we have a user and they're not in a loading state
    if (user && !isLoading) {
      loadDeals();
    } else if (!isLoading && !user) {
      navigate('/login');
    }

    return () => {
      mounted = false;
    };
  }, [user, isLoading, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
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
            title="Research & Analysis"
            subtitle="Discover in-depth market insights and property analysis"
            showSearch={false}
            showStats={false}
            height="h-[400px]"
            image="/research-hero.jpg"
          />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-primary">Latest Research</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Stay informed with our comprehensive research reports and expert
                  analysis
                </p>
              </div>
              {isPro ? (
                <ResearchReports isPro={isPro} />
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-4 text-accent">
                    Pro Plan Required
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Access to research reports is available exclusively to Pro and
                    Premium subscribers.
                  </p>
                  <Button onClick={() => setIsSubscriptionModalOpen(true)} className="bg-primary text-white">
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">Loading deals...</div>
            ) : (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Latest Deals</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {deals.map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal}
                      isSubscriber={profile?.subscription_tier !== 'free'}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>

          <SubscriptionModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
          />
        </div>
      </PageTransition>
    </Layout>
  );
}
