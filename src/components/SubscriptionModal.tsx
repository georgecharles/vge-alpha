import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { CheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../lib/auth";
import { User } from "@supabase/supabase-js";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
}

export function SubscriptionModal({ isOpen, onClose, currentUser, userProfile }: SubscriptionModalProps) {
  const navigate = useNavigate();

  const handleSubscribe = (tier: string) => {
    console.log(`Subscribing to ${tier} tier`);
    navigate(`/checkout?tier=${tier}`);
      onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Upgrade Your Experience
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="monthly" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly <span className="ml-2 text-emerald-500">Save 20%</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="grid gap-6 sm:grid-cols-2 mt-4">
              <div className="border rounded-lg p-6 space-y-4 relative overflow-hidden">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Basic</h3>
                  <p className="text-muted-foreground text-sm">
                    Essential property insights for casual investors.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">£9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Basic property data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">5 saved properties</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Limited market insights</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSubscribe("basic")}
                >
                  {userProfile?.subscription_tier === "basic" ? "Current Plan" : "Subscribe"}
                </Button>
              </div>

              <div className="border rounded-lg p-6 space-y-4 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  POPULAR
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Pro</h3>
                  <p className="text-muted-foreground text-sm">
                    Advanced tools for serious property investors.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">£29.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">
                      <span className="font-medium">Everything in Basic</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Detailed investment metrics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">50 saved properties</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Full market insights access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Priority customer support</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleSubscribe("pro")}
                >
                  {userProfile?.subscription_tier === "pro" ? "Current Plan" : "Subscribe"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="grid gap-6 sm:grid-cols-2 mt-4">
              <div className="border rounded-lg p-6 space-y-4 relative overflow-hidden">
                <div className="absolute -top-1 -right-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-3 py-1 text-xs font-medium transform rotate-12">
                  SAVE 20%
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Basic Annual</h3>
                  <p className="text-muted-foreground text-sm">
                    Essential property insights for casual investors.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">£95.90</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Equivalent to £7.99/month
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Basic property data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">5 saved properties</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Limited market insights</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSubscribe("basic-annual")}
                >
                  {userProfile?.subscription_tier === "basic" && userProfile?.subscription_status === "yearly" 
                    ? "Current Plan" 
                    : "Subscribe"}
                </Button>
              </div>

              <div className="border rounded-lg p-6 space-y-4 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  BEST VALUE
                </div>
                <div className="absolute -top-1 -right-12 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-3 py-1 text-xs font-medium transform rotate-12">
                  SAVE 20%
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Pro Annual</h3>
                  <p className="text-muted-foreground text-sm">
                    Advanced tools for serious property investors.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">£287.90</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Equivalent to £23.99/month
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">
                      <span className="font-medium">Everything in Basic</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Detailed investment metrics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">50 saved properties</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Full market insights access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">Priority customer support</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleSubscribe("pro-annual")}
                >
                  {userProfile?.subscription_tier === "pro" && userProfile?.subscription_status === "yearly" 
                    ? "Current Plan" 
                    : "Subscribe"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
