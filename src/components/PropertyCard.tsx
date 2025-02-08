import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Building2,
  PoundSterling,
  Maximize2,
  Lock,
  MessageCircle,
  MessagesSquare,
  X,
} from "lucide-react";
import { PropertyComments } from "./PropertyComments";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuth } from "../lib/auth";

interface PropertyCardProps {
  id?: string;
  address?: string;
  price?: number;
  original_price?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  isPremium?: boolean;
  isSubscriber?: boolean;
  assignedUser?: {
    full_name: string;
    email: string;
  };
  author?: {
    full_name: string;
    email: string;
  };
  type?: string;
  status?: string;
  potential_profit?: number;
  roi_percentage?: number;
  images?: string[];
}

const PropertyCard = ({
  id = "1",
  address = "123 Example Street, City, State 12345",
  price = 500000,
  squareFootage = 2000,
  bedrooms = 3,
  bathrooms = 2,
  isPremium = true,
  isSubscriber = false,
  assignedUser,
  author,
  type,
  status,
  potential_profit,
  roi_percentage,
  images = [],
}: PropertyCardProps) => {
  const [showComments, setShowComments] = React.useState(false);
  const { user } = useAuth();

  const getInvestmentStrategies = () => {
    const strategies = [];

    // Basic strategies visible to all
    if (squareFootage > 1000)
      strategies.push("Serviced Accommodation (Possible)");
    if (price < 300000) strategies.push("Buy-to-Let (Consider)");

    // Premium strategies only visible to subscribers
    if (isSubscriber) {
      if (squareFootage > 1500)
        strategies.push("HMO Conversion (High Potential)");
      if (price < 200000)
        strategies.push("Below Market Value (20-30% discount)");
      if (price / squareFootage < 200)
        strategies.push("High Yield Potential (8-12%)");
    }

    return strategies;
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="w-full max-w-[380px] overflow-hidden group hover:shadow-xl transition-all duration-300 backdrop-blur-xl bg-background/60 hover:bg-background/80 border border-border/50 dark:bg-gray-900/40 dark:hover:bg-gray-900/60">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-gray-200 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
            <img
              src={
                (images && images.length > 0 && images[0]) ||
                `https://images.unsplash.com/photo-${Math.floor(Math.random() * 10) + 1}-house?auto=format&fit=crop&q=80&w=800&h=600`
              }
              alt="Property"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      variant="secondary"
                      className="bg-background/95 backdrop-blur-md border border-border/50 shadow-sm cursor-help"
                    >
                      {isPremium ? "BMV Deal" : "For Sale"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4">
                    <p className="font-medium mb-2">
                      {isPremium
                        ? "Below Market Value Deal"
                        : "Investment Opportunity"}
                    </p>
                    <ul className="text-sm space-y-1">
                      {isPremium ? (
                        <>
                          <li>• Significant discount to market value</li>
                          <li>• Motivated seller opportunity</li>
                          <li>• Quick completion possible</li>
                        </>
                      ) : (
                        <>
                          <li>• Good rental yield potential</li>
                          <li>• Strong capital growth area</li>
                          <li>• Multiple strategy options</li>
                        </>
                      )}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {address}
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <PoundSterling className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {price.toLocaleString("en-GB", {
                  style: "currency",
                  currency: "GBP",
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2 cursor-help">
                  <Maximize2 className="w-4 h-4 text-gray-500" />
                  <span>{squareFootage.toLocaleString()} sqft</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] p-4">
                  <p className="font-medium mb-2">Investment Strategies</p>
                  <ul className="text-sm space-y-1">
                    {getInvestmentStrategies().map((strategy, index) => (
                      <li key={index}>• {strategy}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2 relative">
            <div className={!isSubscriber && isPremium ? "blur-sm" : ""}>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span>
                  {bedrooms} beds • {bathrooms} baths
                </span>
              </div>
              {author && (
                <div className="flex items-center gap-2 mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2 cursor-help">
                        <span className="text-sm text-muted-foreground">
                          Listed by:
                        </span>
                        <span className="text-sm font-medium hover:text-primary transition-colors">
                          {author.full_name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Contact the property owner for more details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {assignedUser && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Assigned to:
                  </span>
                  <span className="text-sm font-medium">
                    {assignedUser.full_name}
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {isPremium ? "Premium Property" : "Standard Listing"} • Added{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
            {!isSubscriber && isPremium && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm z-10">
                <Lock className="w-8 h-8 text-primary" />
                <p className="text-sm font-medium text-center px-4">
                  Subscribe to Pro plan to view premium properties
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => (window.location.href = "/pricing")}
                >
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <div className="flex flex-col w-full gap-4">
            <div className="flex items-center justify-between">
              {!user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const event = new CustomEvent("open-auth-modal", {
                      detail: { mode: "signin" },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Sign in to view comments
                </Button>
              ) : !isSubscriber ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => (window.location.href = "/pricing")}
                >
                  <Lock className="h-4 w-4" />
                  Subscribe to view comments
                </Button>
              ) : (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  View all comments
                </button>
              )}
              {assignedUser && isSubscriber && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex gap-2"
                  onClick={() => {
                    const event = new CustomEvent("open-messages", {
                      detail: { receiverId: assignedUser.id },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  <MessagesSquare className="h-4 w-4" />
                  Message
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showComments && isSubscriber && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:relative md:inset-auto md:bg-transparent md:backdrop-blur-none"
                >
                  <div className="relative h-full md:h-auto">
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border/50 shadow-xl md:relative md:inset-auto md:border md:rounded-lg md:shadow-lg">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold">Comments</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setShowComments(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 max-h-[calc(100vh-4rem)] md:max-h-[400px] overflow-y-auto">
                        <PropertyComments propertyId={id} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PropertyCard;
