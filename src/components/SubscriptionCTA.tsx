import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Crown, ArrowRight } from "lucide-react";

interface SubscriptionCTAProps {
  title?: string;
  description?: string;
  onSubscribe?: () => void;
}

export const SubscriptionCTA = ({
  title = "Unlock Premium Features",
  description = "Get access to detailed property analysis, portfolio tracking, and advanced metrics.",
  onSubscribe = () => console.log("Subscribe clicked"),
}: SubscriptionCTAProps) => {
  return (
    <div className="w-full bg-background p-4 sm:p-6 border-t">
      <Alert className="max-w-7xl mx-auto flex items-center justify-between bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 border-emerald-500/20">
        <div className="flex items-start gap-3">
          <Crown className="h-5 w-5 text-emerald-500 mt-1" />
          <div>
            <AlertTitle className="text-lg font-semibold text-foreground">
              {title}
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {description}
            </AlertDescription>
          </div>
        </div>
        <Button
          onClick={onSubscribe}
          className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hidden sm:flex items-center gap-2"
        >
          Subscribe Now
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSubscribe}
          className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 sm:hidden"
          size="sm"
        >
          Subscribe
        </Button>
      </Alert>
    </div>
  );
};

export default SubscriptionCTA;
