import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { createCheckoutSession } from "../lib/stripe";
import { useAuth } from "../lib/auth";
import { useToast } from "./ui/use-toast";
import { supabase } from "../lib/supabase";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (tier: string) => {
    setIsLoading(true);
    try {
      // Create or update profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          subscription_tier: tier,
          updated_at: new Date().toISOString()
        })
        .select()
        .single(); // Add this to ensure single row

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // Show complete profile modal
      setShowCompleteProfile(true);
      onClose();

      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to ${tier}.`
      });
    } catch (error) {
      console.error('Error in subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that best suits your needs and unlock premium
            features.
          </DialogDescription>
        </DialogHeader>

        <SubscriptionPlans onSubscribe={handleSubscribe} />
      </DialogContent>
    </Dialog>
  );
}
