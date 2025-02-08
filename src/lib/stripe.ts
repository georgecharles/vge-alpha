import { supabase } from "./supabase";
import { loadStripe } from "@stripe/stripe-js";

export const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: "Basic",
    price: "£9.99",
    priceId: "price_1QnikACOhalwhG2QDocCWbQj",
    features: [
      "Basic property search",
      "Save up to 5 properties",
      "Basic market trends",
      "Email support",
    ],
  },
  PRO: {
    name: "Pro",
    price: "£19.99",
    priceId: "price_1QnikPCOhalwhG2QVYfxwG5D",
    features: [
      "Advanced property search",
      "Save unlimited properties",
      "Detailed market analysis",
      "Premium property insights",
      "Priority support",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: "£49.99",
    priceId: "price_1QnikjCOhalwhG2QUgRtMAco",
    features: [
      "All Pro features",
      "AI-powered market predictions",
      "Portfolio analytics",
      "Investment ROI calculator",
      "Dedicated account manager",
      "24/7 phone support",
    ],
  },
};

export async function createCheckoutSession(priceId: string, userId: string) {
  try {
    const response = await fetch(
      "https://clever-chaplygin6-vbfae.dev.tempolabs.ai/.netlify/functions/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId,
        }),
      },
    );

    const { sessionId } = await response.json();
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function updateSubscription(userId: string, tier: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}
