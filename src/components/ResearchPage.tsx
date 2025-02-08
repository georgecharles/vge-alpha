import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { ResearchReports } from "./ResearchReports";
import { PageTransition } from "./ui/page-transition";
import { Button } from "./ui/button";
import { SubscriptionModal } from "./SubscriptionModal";

export default function ResearchPage() {
  const { user, profile } = useAuth();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    React.useState(false);

  const isPro =
    profile?.subscription_tier === "pro" ||
    profile?.subscription_tier === "premium";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={!!user} userProfile={profile || undefined} />
        <HeroSection
          title="Research & Reports"
          subtitle="Expert analysis and insights to inform your property investment decisions"
          backgroundImage="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Latest Research</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stay informed with our comprehensive research reports and expert
                analysis
              </p>
            </div>
            {isPro ? (
              <ResearchReports isPro={isPro} />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">
                  Pro Plan Required
                </h2>
                <p className="text-muted-foreground mb-6">
                  Access to research reports is available exclusively to Pro and
                  Premium subscribers.
                </p>
                <Button onClick={() => setIsSubscriptionModalOpen(true)}>
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </div>
        </main>

        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
        />
      </div>
    </PageTransition>
  );
}
