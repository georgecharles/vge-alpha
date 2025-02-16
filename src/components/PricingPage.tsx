import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { createCheckoutSession } from "../lib/stripe";
import { useAuth } from "../lib/auth";
import { useToast } from "./ui/use-toast";
import { LegalDisclaimer } from "./LegalDisclaimer";
import { Footer } from "./Footer";

export default function PricingPage() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCheckoutSession(priceId, user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={!!user}
        userProfile={profile || undefined}
        onSignIn={() => {
          window.location.href = "/";
        }}
        onSignUp={() => {
          window.location.href = "/";
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
      <HeroSection
        title="Choose Your Perfect Plan"
        subtitle="Select the perfect subscription plan to unlock premium features and detailed property insights"
        backgroundImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3"
        showSearch={false}
        showStats={false}
        height="h-[400px]"
      />
      <main>
        <SubscriptionPlans onSubscribe={handleSubscribe} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto prose dark:prose-invert mb-16">
            <h2 className="text-3xl font-bold mb-6">
              Investment Plans for Every Property Investor
            </h2>
            <p>
              Choose from our range of subscription plans designed to meet the
              needs of property investors at every level. From market analysis
              to detailed property insights, our plans provide the tools you
              need to make informed investment decisions.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Plan Benefits</h3>
            <ul>
              <li>
                Access to comprehensive property market data and analytics
              </li>
              <li>Real-time market insights and trend analysis</li>
              <li>Advanced property search and filtering capabilities</li>
              <li>Investment calculators and ROI projections</li>
              <li>Portfolio tracking and management tools</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Why Subscribe?</h3>
            <p>
              Our subscription plans give you access to premium features and
              insights that help you stay ahead in the property market. From
              basic market analysis to advanced AI-powered predictions, we
              provide the tools you need to make successful property
              investments.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Money-Back Guarantee
            </h3>
            <p>
              We're confident in the value our platform provides. If you're not
              satisfied with your subscription within the first 30 days, we'll
              provide a full refund, no questions asked.
            </p>
          </div>
          <LegalDisclaimer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
