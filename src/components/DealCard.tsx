import React from "react";
import { Deal } from "../lib/deals";
import { formatCurrency } from "../lib/utils";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface DealCardProps {
  deal: Deal;
  isSubscriber: boolean;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, isSubscriber }) => {
  const [imageError, setImageError] = React.useState(false);
  
  // Get the image URL from the deal
  const imageUrl = typeof deal.images === 'string' 
    ? deal.images.replace(/["\\]/g, '') // Remove quotes and backslashes
    : Array.isArray(deal.images) 
      ? deal.images[0]
      : null;

  console.log('Deal in card:', deal);
  console.log('Images in card:', deal.images);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {imageUrl && !imageError && (
          <img
            src={imageUrl}
            alt={deal.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              console.error('Image load error:', e);
              setImageError(true);
            }}
          />
        )}
        {deal.is_premium && !isSubscriber && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="premium">Premium Deal</Badge>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{deal.title}</h3>
          <Badge>{deal.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{deal.description}</p>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Original Price</p>
              <p className="font-semibold">{formatCurrency(deal.original_price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deal Price</p>
              <p className="font-semibold">{formatCurrency(deal.deal_price)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Potential Profit</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(deal.potential_profit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="font-semibold">{deal.roi_percentage}%</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {deal.key_features?.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline">{feature}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 