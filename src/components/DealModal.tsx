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

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  isSubscriber: boolean;
}

export const DealModal: React.FC<DealModalProps> = ({ isOpen, onClose, deal, isSubscriber }) => {
  if (!deal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-4">
            <span className="text-xl font-bold">{deal.title}</span>
            <div className="flex gap-2">
              <Badge>{deal.property_type}</Badge>
              <Badge variant="secondary">{deal.deal_type}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
          <img
            src={deal.image_url}
            alt={deal.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{deal.location}</span>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{deal.description}</p>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Price</h3>
            <p className="text-lg">{formatCurrency(deal.price)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">ROI</h3>
            <p className="text-lg text-emerald-500">{deal.roi_percentage}%</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Investment Term</h3>
            <p className="text-lg">{deal.investment_term}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Property Type</h3>
            <p className="text-lg">{deal.property_type}</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Deal Type</h3>
            <Badge variant="outline">{deal.deal_type}</Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-muted-foreground">{deal.location}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 