import React from "react";
import { Deal } from "../lib/deals";
import { formatCurrency } from "../lib/utils";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

interface DealCardProps {
  deal: Deal;
  isSubscriber: boolean;
  onClick?: () => void;
}

export function DealCard({ deal, isSubscriber, onClick }: DealCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setImageError] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  console.log('Deal data in card:', deal); // Let's see what data we have
  
  const imageUrl = Array.isArray(deal.images) && deal.images.length > 0
    ? deal.images[currentImageIndex]
    : 'https://source.unsplash.com/random/800x600?property';

  console.log('Using image URL:', imageUrl); // Let's see which URL we're using

  const handleImageError = () => {
    console.error('Image load error for:', imageUrl);
    if (Array.isArray(deal.images) && currentImageIndex < deal.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  // Format location display
  const locationDisplay = [
    deal.location?.address,
    deal.location?.city,
    deal.location?.postcode
  ].filter(Boolean).join(", ");

  return (
    <div 
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={user ? onClick : () => navigate('/login')}
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={deal.title}
            className="object-cover w-full h-full"
            onError={handleImageError}
          />
          {!user && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Sign in to View</Badge>
            </div>
          )}
          {user && deal.is_premium && !isSubscriber && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="premium">Premium Deal</Badge>
            </div>
          )}
          <Badge 
            className="absolute top-2 right-2" 
            variant={deal.status === 'available' ? 'success' : 'warning'}
          >
            {deal.status}
          </Badge>
        </div>
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-semibold line-clamp-2">{deal.title}</h3>
            <Badge>{deal.type}</Badge>
          </div>
          {locationDisplay && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{locationDisplay}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

            {deal.key_features?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {deal.key_features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline">{feature}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 