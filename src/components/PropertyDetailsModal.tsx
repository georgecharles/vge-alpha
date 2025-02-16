import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { MessageCircle, TrendingUp, Home, PoundSterling } from "lucide-react";
import { BitcoinPrice } from "./BitcoinPrice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onMessageAuthor?: (authorId: string) => void;
}

export function PropertyDetailsModal({
  isOpen,
  onClose,
  property,
  onMessageAuthor,
}: PropertyDetailsModalProps) {
  // Generate 10-year prediction data
  const predictionData = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const basePrice = property.price || property.deal_price || 500000;
    const growthRate = 0.05; // 5% annual growth

    return Array.from({ length: 11 }, (_, i) => ({
      year: currentYear + i,
      value: Math.round(basePrice * Math.pow(1 + growthRate, i)),
    }));
  }, [property]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {property.title || property.address}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="aspect-video rounded-lg overflow-hidden mb-4">
              <img
                src={
                  property.images?.[0] ||
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa"
                }
                alt={property.title || "Property"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <PoundSterling className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">
                    £
                    {(
                      property.price ||
                      property.deal_price ||
                      0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <BitcoinPrice
                      amount={property.price || property.deal_price || 0}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Details
                    </span>
                    <Home className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    {property.bedrooms && (
                      <div className="text-sm">
                        {property.bedrooms} Bedrooms
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="text-sm">
                        {property.bathrooms} Bathrooms
                      </div>
                    )}
                    {property.square_footage && (
                      <div className="text-sm">
                        {property.square_footage} sq ft
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {property.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{property.description}</p>
              </div>
            )}

            {onMessageAuthor && property.author && (
              <Button
                className="w-full"
                onClick={() => onMessageAuthor(property.author.id)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Agent
              </Button>
            )}
          </div>

          <div>
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">10 Year Prediction</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictionData}>
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis
                        tickFormatter={(value) =>
                          `£${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value) => `£${value.toLocaleString()}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {property.type === "deal" && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Investment Details
                  </h3>
                  <div className="space-y-4">
                    {property.original_price && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Original Price
                        </span>
                        <span>£{property.original_price.toLocaleString()}</span>
                      </div>
                    )}
                    {property.potential_profit && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Potential Profit
                        </span>
                        <span className="text-emerald-500">
                          £{property.potential_profit.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {property.roi_percentage && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI</span>
                        <span className="text-emerald-500">
                          {property.roi_percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
