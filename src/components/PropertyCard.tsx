import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { MessageCircle, Lock } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { useAuth } from '../lib/auth';

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
  address?: string;
  price?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  isPremium?: boolean;
  assignedUser?: any;
  author?: any;
  type?: string;
  status?: string;
  potential_profit?: number;
  roi_percentage?: number;
  investment_term?: string;
  deal_type?: string;
  isDeal?: boolean;
  images?: string[];
  onMessageAuthor?: (authorId: string) => void;
  onClick?: () => void;
  description: string;
  propertyType: string;
  createdAt: string;
}

const PropertyCard = ({
  id = '',
  address = 'Location not available',
  price = 0,
  squareFootage = 0,
  bedrooms = 0,
  bathrooms = 0,
  isPremium = false,
  author,
  type = "property",
  potential_profit,
  roi_percentage,
  investment_term,
  deal_type,
  isDeal = false,
  images = [],
  onMessageAuthor,
  onClick,
  description = '',
  propertyType = 'residential',
  createdAt,
}: PropertyCardProps) => {
  const { profile } = useAuth();
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const { btcEquivalent, error: btcError, isLoading: isLoadingBtc } = useBitcoinPrice(price);

  // Add debug logging
  console.log('Profile in PropertyCard:', profile);
  console.log('Subscription tier:', profile?.subscription_tier);
  
  // More defensive check
  const hasPremiumAccess = profile?.subscription_tier === 'premium' || false;

  const fallbackImage = React.useMemo(() => {
    const fallbackImages =
      type === "deal" ? DEAL_FALLBACK_IMAGES : PROPERTY_FALLBACK_IMAGES;
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [type]);

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 bg-muted">
        {isImageLoading && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={
            (images &&
              Array.isArray(images) &&
              images.length > 0 &&
              images[0]) ||
            fallbackImage
          }
          alt="Property"
          className={`w-full h-full object-cover transition-opacity duration-200 ${isImageLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsImageLoading(false)}
        />
        {isPremium && !hasPremiumAccess && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
            <div className="text-center p-6">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Subscribe to view premium properties
              </p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-4">
          <h3 className="font-semibold mb-1 line-clamp-1">{address}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {formatCurrency(price)}
              {btcEquivalent && !isLoadingBtc && !btcError && (
                <span className="text-sm text-muted-foreground ml-2">
                  ≈ {btcEquivalent.toFixed(2)} BTC
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="block text-muted-foreground">Beds</span>
            <span className="font-medium">{bedrooms}</span>
          </div>
          <div>
            <span className="block text-muted-foreground">Baths</span>
            <span className="font-medium">{bathrooms}</span>
          </div>
          <div>
            <span className="block text-muted-foreground">Sq Ft</span>
            <span className="font-medium">{squareFootage}</span>
          </div>
        </div>

        {isDeal && (
          <div className="space-y-2 mb-4">
            {roi_percentage && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ROI:</span>
                <span className="font-medium text-emerald-500">
                  {roi_percentage}%
                </span>
              </div>
            )}
            {investment_term && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Investment Term:</span>
                <span className="font-medium">
                  {investment_term}
                </span>
              </div>
            )}
            {deal_type && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deal Type:</span>
                <span className="font-medium">
                  {deal_type}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{propertyType}</span>
          <span>{bedrooms} beds</span>
          <span>{bathrooms} baths</span>
          <span>{squareFootage} sq ft</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <p className="text-xs text-muted-foreground">
          Listed {new Date(createdAt).toLocaleDateString()}
        </p>

        {author && onMessageAuthor && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onMessageAuthor(author.id)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Agent
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
