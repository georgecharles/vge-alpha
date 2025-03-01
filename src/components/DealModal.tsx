import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Deal } from "../lib/deals";
import { Badge } from "./ui/badge";
import { formatCurrency } from "../lib/utils";
import { MapPin } from "lucide-react";
import { Carousel } from "./ui/carousel";

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  isSubscriber: boolean;
}

export const DealModal: React.FC<DealModalProps> = ({ isOpen, onClose, deal, isSubscriber }) => {
  if (!deal) return null;

  const locationDisplay = [
    deal.location?.address,
    deal.location?.city,
    deal.location?.postcode
  ].filter(Boolean).join(", ");

  const images = Array.isArray(deal.images) ? deal.images : [deal.images].filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-4">
            <span className="text-xl font-bold">{deal.title}</span>
            <div className="flex gap-2">
              <Badge>{deal.type}</Badge>
              <Badge 
                variant={
                  deal.status === 'available' ? 'success' : 
                  deal.status === 'under offer' ? 'warning' : 
                  'secondary'
                }
              >
                {deal.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Images Carousel */}
        <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
          <Carousel images={images} />
        </div>

        {/* Location */}
        {locationDisplay && (
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{locationDisplay}</span>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{deal.description}</p>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Original Price</h3>
            <p className="text-lg">{formatCurrency(deal.original_price)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Deal Price</h3>
            <p className="text-lg">{formatCurrency(deal.deal_price)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Potential Profit</h3>
            <p className="text-lg text-green-600">
              {formatCurrency(deal.potential_profit)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">ROI</h3>
            <p className="text-lg">{deal.roi_percentage}%</p>
          </div>
        </div>

        {/* Key Features */}
        {deal.key_features?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Key Features</h3>
            <div className="flex flex-wrap gap-2">
              {deal.key_features.map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 