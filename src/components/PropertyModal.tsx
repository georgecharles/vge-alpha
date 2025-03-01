import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { formatCurrency } from "../lib/utils";
import { Property } from "../lib/properties";
import { getPropertyAnalysis } from "../lib/ai-utils";
import { Loader2 } from "lucide-react";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    async function fetchAnalysis() {
      if (property) {
        setIsAnalyzing(true);
        try {
          const result = await getPropertyAnalysis(property);
          setAnalysis(result);
        } catch (error) {
          console.error("Error fetching property analysis:", error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    }

    if (isOpen && property) {
      fetchAnalysis();
    }
  }, [isOpen, property]);

  if (!property) return null;

  const imageUrl = Array.isArray(property.images) ? property.images[0] : property.images;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{property.address}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Property Image */}
          <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
            {imageUrl && !imageError && (
              <img
                src={imageUrl}
                alt={property.address}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            {/* Price and Type */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(property.price)}</p>
                <p className="text-muted-foreground">{property.property_type}</p>
              </div>
              {property.is_premium && (
                <Badge variant="premium">Premium Property</Badge>
              )}
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div>
                <p className="text-muted-foreground">Bedrooms</p>
                <p className="font-semibold">{property.bedroom}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bathrooms</p>
                <p className="font-semibold">{property.bathroom}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Square Footage</p>
                <p className="font-semibold">{property.square_footage} sq ft</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{property.description}</p>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">
                {property.address}, {property.city}, {property.postcode}
              </p>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              AI Property Analysis
              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
            </h3>

            {analysis && !isAnalyzing ? (
              <div className="space-y-4">
                {/* Market Value Analysis */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Market Value Analysis</h4>
                  <p className="mt-1">{analysis.market_value_analysis}</p>
                </div>

                {/* Investment Potential */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Investment Potential</h4>
                  <p className="mt-1">{analysis.investment_potential}</p>
                </div>

                {/* Key Advantages */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Key Advantages</h4>
                  <ul className="list-disc pl-4 mt-1">
                    {analysis.key_advantages.map((advantage: string, index: number) => (
                      <li key={index}>{advantage}</li>
                    ))}
                  </ul>
                </div>

                {/* Considerations */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Important Considerations</h4>
                  <ul className="list-disc pl-4 mt-1">
                    {analysis.considerations.map((consideration: string, index: number) => (
                      <li key={index}>{consideration}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommendation */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Recommendation</h4>
                  <p className="mt-1">{analysis.recommendation}</p>
                </div>
              </div>
            ) : !isAnalyzing ? (
              <p className="text-muted-foreground">Analysis not available</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 