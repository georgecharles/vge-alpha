import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Crown } from "lucide-react";
import { SUBSCRIPTION_TIERS } from "../lib/stripe";
import { useAuth } from "../lib/auth";

interface SubscriptionPlansProps {
  onSubscribe: (priceId: string) => void;
}

export function SubscriptionPlans({ onSubscribe }: SubscriptionPlansProps) {
  const { profile } = useAuth();
  const currentTier = profile?.subscription_tier || "free";

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your property investment journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
            <Card
              key={key}
              className={`relative ${key === "PRO" ? "border-primary shadow-lg scale-105 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10" : ""}`}
            >
              {key === "PRO" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-4 py-1 rounded-full text-sm font-medium border border-emerald-500/20 shadow-lg">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  {key === "PREMIUM" && (
                    <Crown className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={key === "PRO" ? "default" : "outline"}
                  onClick={() => onSubscribe(tier.priceId)}
                  disabled={currentTier === key.toLowerCase()}
                >
                  {currentTier === key.toLowerCase()
                    ? "Current Plan"
                    : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
