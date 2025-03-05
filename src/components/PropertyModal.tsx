import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { formatCurrency } from "../lib/utils";
import { Property, Deal } from "../lib/properties";
import { useAIAnalysis } from "../hooks/useAIAnalysis";
import { LoadingSpinner } from "./ui/loading-spinner";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: (Property | Deal) | null;
}

export function PropertyModal({ isOpen, onClose, property }: PropertyModalProps) {
  const isDeal = 'roi_percentage' in (property || {});
  const { data: analysis, isLoading: isLoadingAnalysis } = useAIAnalysis(property);

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{property.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <img
              src={property.image_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Location</h3>
              <p>{property.location}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Price</h3>
              <p className="text-2xl font-bold">{formatCurrency(property.price)}</p>
            </div>

            {!isDeal && 'beds' in property && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm text-muted-foreground">Beds</h4>
                  <p className="font-medium">{property.beds}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Baths</h4>
                  <p className="font-medium">{property.baths}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Sq Ft</h4>
                  <p className="font-medium">{property.sqft}</p>
                </div>
              </div>
            )}

            {isDeal && 'roi_percentage' in property && (
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm text-muted-foreground">ROI</h4>
                  <p className="font-medium text-emerald-500">{property.roi_percentage}%</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Investment Term</h4>
                  <p className="font-medium">{property.investment_term}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Deal Type</h4>
                  <p className="font-medium">{property.deal_type}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Property Type</h4>
                  <p className="font-medium">{property.property_type}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground">{property.description}</p>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">AI Investment Analysis</h3>
          {isLoadingAnalysis ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {analysis?.map((section, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">{section.title}</h4>
                  <p className="text-muted-foreground">{section.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 