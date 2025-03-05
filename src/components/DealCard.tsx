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
  
  console.log('Deal data in card:', deal);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={user ? onClick : () => navigate('/login')}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={deal.image_url}
          alt={deal.title}
          className="object-cover w-full h-full"
        />
        {!user && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Sign in to View</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white/75">
            {deal.property_type}
          </Badge>
          <Badge variant="secondary" className="bg-primary/90 text-white hover:bg-primary/75">
            {deal.deal_type}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div>
          <h3 className="text-lg font-semibold line-clamp-2 mb-2">{deal.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{deal.location}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {deal.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">{formatCurrency(deal.price)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-lg font-semibold text-emerald-500">
                {deal.roi_percentage}%
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Investment Term</p>
                <p className="font-medium">{deal.investment_term}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expected Returns</p>
                <p className="font-medium text-emerald-500">High Yield</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 