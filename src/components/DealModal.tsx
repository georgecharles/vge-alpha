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
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <span className="text-lg sm:text-xl font-bold break-words pr-4">{deal.title}</span>
            <div className="flex gap-2 flex-wrap">
              <Badge className="text-xs">{deal.property_type}</Badge>
              <Badge variant="secondary" className="text-xs">{deal.deal_type}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="relative aspect-video mb-3 sm:mb-4 overflow-hidden rounded-lg">
          <img
            src={deal.image_url}
            alt={deal.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="break-words">{deal.location}</span>
        </div>

        {/* Description */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Description</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{deal.description}</p>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Price</h3>
            <p className="text-base sm:text-lg">{formatCurrency(deal.price)}</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">ROI</h3>
            <p className="text-base sm:text-lg text-emerald-500">{deal.roi_percentage}%</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Investment Term</h3>
            <p className="text-base sm:text-lg">{deal.investment_term}</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Property Type</h3>
            <p className="text-base sm:text-lg">{deal.property_type}</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Deal Type</h3>
            <Badge variant="outline" className="text-xs sm:text-sm">{deal.deal_type}</Badge>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Location</h3>
            <p className="text-xs sm:text-sm text-muted-foreground break-words">{deal.location}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 