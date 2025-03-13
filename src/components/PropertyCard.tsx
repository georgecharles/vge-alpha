import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatCurrency, formatDate, formatNumber } from "../lib/utils";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Share } from "lucide-react";
import { UserProfile, User } from "../lib/auth";

const PROPERTY_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
];

const DEAL_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
];

interface PropertyCardProps {
  id?: string;
  address: string;
  price: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  isPremium?: boolean;
  description?: string;
  propertyType?: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  original_price?: number;
  potential_profit?: number;
  roi_percentage?: number;
  deal_price?: number;
  deal_type?: string;
  property?: any;
  status?: string;
  type?: "listing" | "deal";
  isSubscriber?: boolean;
  investment_term?: string;
  onClick?: () => void;
  onMessageAuthor?: (authorId: string) => void;
  isDeal?: boolean;
  images?: string[];
  currentUser?: User | null;
  userProfile?: UserProfile | null;
}

export function PropertyCard({
  id,
  address,
  price,
  squareFootage,
  bedrooms,
  bathrooms,
  isPremium = false,
  propertyType = "residential",
  description,
  createdAt,
  author,
  original_price,
  roi_percentage,
  investment_term,
  deal_type,
  isSubscriber = false,
  type = "listing",
  isDeal = false,
  images = [],
  onClick,
  onMessageAuthor,
  currentUser,
  userProfile
}: PropertyCardProps) {
  const isAuthenticated = !!currentUser;
  
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Share property:", id);
  };

  const handleMessageAuthor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author && onMessageAuthor) {
      onMessageAuthor(author.id);
    }
  };

  const imageUrl = images && images.length > 0 
    ? images[0] 
    : `https://source.unsplash.com/random/800x600?property,house&sig=${id}`;

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={address}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {isPremium && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Featured
            </Badge>
          </div>
        )}
        {isDeal && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-600">
              Investment Deal
            </Badge>
          </div>
        )}
        {roi_percentage && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-emerald-500 text-white">
              {roi_percentage}% ROI
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{formatCurrency(price)}</h3>
          {original_price && (
            <div className="text-sm text-muted-foreground line-through">
              {formatCurrency(original_price)}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">{address}</p>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {(bedrooms || bathrooms || squareFootage) && (
          <div className="flex justify-between mb-3 text-sm">
            {bedrooms !== undefined && (
              <div>
                <span className="font-medium">{bedrooms}</span>{" "}
                <span className="text-muted-foreground">
                  {bedrooms === 1 ? "Bed" : "Beds"}
                </span>
              </div>
            )}
            {bathrooms !== undefined && (
              <div>
                <span className="font-medium">{bathrooms}</span>{" "}
                <span className="text-muted-foreground">
                  {bathrooms === 1 ? "Bath" : "Baths"}
                </span>
              </div>
            )}
            {squareFootage !== undefined && (
              <div>
                <span className="font-medium">{formatNumber(squareFootage)}</span>{" "}
                <span className="text-muted-foreground">sq ft</span>
              </div>
            )}
          </div>
        )}

        {investment_term && (
          <div className="mb-3">
            <span className="text-sm text-muted-foreground">Investment Term: </span>
            <span className="text-sm font-medium">{investment_term}</span>
          </div>
        )}

        {deal_type && (
          <div className="mb-3">
            <span className="text-sm text-muted-foreground">Deal Type: </span>
            <span className="text-sm font-medium">{deal_type}</span>
          </div>
        )}

        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-muted-foreground">
            {formatDate(createdAt)}
          </div>
          <div className="flex space-x-1">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSaveToggle}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isSaved ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                {author && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleMessageAuthor}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
