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

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // Store the selected price ID in localStorage
      localStorage.setItem("pending_subscription_price_id", priceId);

      // Trigger sign up modal
      const event = new CustomEvent("open-auth-modal", {
        detail: { mode: "signup" },
      });
      window.dispatchEvent(event);
      onClose();
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
