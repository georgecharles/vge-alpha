import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { formatCurrency, formatDate, formatNumber } from "../lib/utils";
import {
  Bed,
  Bath,
  Square,
  Home,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  PoundSterling,
  Building,
  Compass,
  FileText,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UserProfile } from "../lib/auth";
import { User as AuthUser } from "@supabase/supabase-js";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  currentUser?: AuthUser | null;
  userProfile?: UserProfile | null;
}

export function PropertyModal({
  isOpen,
  onClose,
  property,
  currentUser,
  userProfile
}: PropertyModalProps) {
  // Remove the useAuth hook
  // const { user } = useAuth();
  const isAuthenticated = !!currentUser;
  
  const isSubscriber = userProfile?.subscription_tier === "pro";

  if (!property) return null;

  // Format price for display
  const price = property.price
    ? formatCurrency(Number(property.price))
    : "Price on application";

  // Determine address components
  let address = property.location || property.address || "Address not available";
  let postcode = property.postcode || property.location?.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i)?.[0] || "";

  // Extract property details
  const propertyType = property.property_type || "Residential";
  const bedrooms = property.beds || property.bedrooms || 0;
  const bathrooms = property.baths || property.bathrooms || 0;
  const squareFootage = property.square_footage || property.sqft || 0;
  const tenure = property.tenure || "Freehold";
  const description = property.description || "No description available";

  // Sale history processing
  const saleHistory = property.sale_history || [];
  
  // Filter out sale history entries with invalid or undefined prices
  const validSaleHistory = saleHistory
    .filter((sale: any) => sale && sale.sale_price && !isNaN(Number(sale.sale_price)))
    .sort((a: any, b: any) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());

  // Calculate price growth percentage if there are multiple valid sales
  let priceGrowthPercentage = 0;
  if (validSaleHistory.length > 1) {
    const mostRecentPrice = Number(validSaleHistory[0].sale_price);
    const oldestPrice = Number(validSaleHistory[validSaleHistory.length - 1].sale_price);
    priceGrowthPercentage = ((mostRecentPrice - oldestPrice) / oldestPrice) * 100;
  }

  // Calculate mortgage estimates
  const calculateMortgage = (price: number, downPaymentPercent: number, interestRate: number, termYears: number) => {
    const loanAmount = price * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;
    
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return {
      monthlyPayment,
      totalInterest: (monthlyPayment * numPayments) - loanAmount,
      totalCost: monthlyPayment * numPayments,
    };
  };
  
  // Default mortgage calculation (assuming 20% down, 4.5% interest, 25 year term)
  const mortgage = calculateMortgage(
    Number(property.price) || 0,
    20,
    4.5,
    25
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative h-72 overflow-hidden">
          <img
            src={
              property.image_url ||
              `https://source.unsplash.com/random/1200x600?property,house&sig=${property.id}`
            }
            alt={address}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-primary text-white">
              {propertyType}
            </Badge>
            {property.status && (
              <Badge variant="secondary">{property.status}</Badge>
            )}
          </div>
          </div>

        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-bold">
                {price}
              </DialogTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Share
                </Button>
              </div>
            </div>
            <DialogDescription className="text-base font-medium text-foreground mt-1">
              {address}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="details">Property Details</TabsTrigger>
              <TabsTrigger value="investment">Investment Metrics</TabsTrigger>
              <TabsTrigger value="history">History & Area</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <Bed className="h-5 w-5 mb-1 text-muted-foreground" />
                  <span className="text-sm font-medium">{bedrooms} Bedrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <Bath className="h-5 w-5 mb-1 text-muted-foreground" />
                  <span className="text-sm font-medium">{bathrooms} Bathrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <Square className="h-5 w-5 mb-1 text-muted-foreground" />
                  <span className="text-sm font-medium">{formatNumber(squareFootage)} sq ft</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <Building className="h-5 w-5 mb-1 text-muted-foreground" />
                  <span className="text-sm font-medium">{tenure}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  Location
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm mb-1">
                    <span className="font-medium">Address:</span> {address}
                  </p>
                  {postcode && (
                    <p className="text-sm">
                      <span className="font-medium">Postcode:</span> {postcode}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                  Description
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-line">{description}</p>
              </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                  Property Documents
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm mb-2">
                    {isAuthenticated && isSubscriber ? (
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-primary underline cursor-pointer">
                            Energy Performance Certificate (EPC)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-primary underline cursor-pointer">
                            Floor Plan
                          </span>
                        </li>
                        <li className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-primary underline cursor-pointer">
                            Property Brochure
                          </span>
                        </li>
                      </ul>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-muted-foreground mb-2">
                          Upgrade to PRO to access property documents
                        </p>
                        <Button className="text-sm" size="sm">
                          Upgrade Now
                        </Button>
            </div>
                    )}
              </p>
            </div>
          </div>
            </TabsContent>

            <TabsContent value="investment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <PoundSterling className="h-5 w-5 mr-2 text-muted-foreground" />
                    Investment Metrics
                  </h3>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estimated Monthly Rent</span>
                      <span className="font-medium">
                        {formatCurrency(property.estimated_rent || property.price * 0.004)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rental Yield</span>
                      <span className="font-medium">
                        {property.rental_yield ? property.rental_yield.toFixed(2) : ((property.price * 0.004 * 12) / property.price * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estimated ROI (5yr)</span>
                      <span className="font-medium">
                        {property.roi ? property.roi.toFixed(2) : ((property.price * 0.25) / property.price * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Price per sq ft</span>
                      <span className="font-medium">
                        {squareFootage > 0 ? formatCurrency(property.price / squareFootage) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Compass className="h-5 w-5 mr-2 text-muted-foreground" />
                    Area Insights
                  </h3>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Area Price</span>
                      <span className="font-medium">
                        {formatCurrency(property.area_avg_price || property.price * 1.1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Price vs. Area Average</span>
                      <div className="flex items-center">
                        {property.price < (property.area_avg_price || property.price * 1.1) ? (
                          <>
                            <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-500 font-medium">
                              {(((property.area_avg_price || property.price * 1.1) - property.price) / (property.area_avg_price || property.price * 1.1) * 100).toFixed(1)}% below
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="text-amber-500 font-medium">
                              {((property.price - (property.area_avg_price || property.price * 0.9)) / (property.area_avg_price || property.price * 0.9) * 100).toFixed(1)}% above
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">12-month Price Trend</span>
                      <div className="flex items-center">
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+4.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <PoundSterling className="h-5 w-5 mr-2 text-muted-foreground" />
                  Mortgage Calculator
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm mb-1">Property Price</p>
                      <p className="text-lg font-medium">{formatCurrency(Number(property.price) || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1">Monthly Payment</p>
                      <p className="text-lg font-medium">{formatCurrency(mortgage.monthlyPayment)}</p>
                    </div>
                <div>
                      <p className="text-sm mb-1">Total Interest</p>
                      <p className="text-lg font-medium">{formatCurrency(mortgage.totalInterest)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Based on 20% down payment, 4.5% interest rate, 25-year term
                  </p>
                </div>
                </div>

                <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <PoundSterling className="h-5 w-5 mr-2 text-muted-foreground" />
                  Cash Flow Analysis
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Rental Income</span>
                      <span className="font-medium">
                        {formatCurrency(property.estimated_rent || property.price * 0.004)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mortgage Payment</span>
                      <span className="font-medium text-red-500">
                        -{formatCurrency(mortgage.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Est. Maintenance (10%)</span>
                      <span className="font-medium text-red-500">
                        -{formatCurrency((property.estimated_rent || property.price * 0.004) * 0.1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Est. Management (5%)</span>
                      <span className="font-medium text-red-500">
                        -{formatCurrency((property.estimated_rent || property.price * 0.004) * 0.05)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Cash Flow</span>
                      <span className="font-medium">
                        {formatCurrency(
                          (property.estimated_rent || property.price * 0.004) - 
                          mortgage.monthlyPayment - 
                          (property.estimated_rent || property.price * 0.004) * 0.15
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  Sale History
                </h3>
                {validSaleHistory.length > 0 ? (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="mb-4">
                      {priceGrowthPercentage !== 0 && (
                        <div className="mb-3 text-sm">
                          <span className="font-medium">Total price growth: </span>
                          <span className={priceGrowthPercentage >= 0 ? "text-green-500" : "text-red-500"}>
                            {priceGrowthPercentage >= 0 ? "+" : ""}{priceGrowthPercentage.toFixed(2)}%
                          </span>
                        </div>
                      )}
                      
                      {/* Sale History Chart */}
                      <div className="relative h-24 mt-6 mb-2">
                        {validSaleHistory.map((sale: any, index: number) => {
                          const maxPrice = Math.max(...validSaleHistory.map((s: any) => Number(s.sale_price)));
                          const height = (Number(sale.sale_price) / maxPrice) * 100;
                          const width = 100 / validSaleHistory.length;
                          const position = index * width;
                          
                          return (
                            <div 
                              key={index}
                              className="absolute bottom-0 bg-primary hover:bg-primary/80 rounded-t transition-all cursor-pointer group"
                              style={{
                                height: `${height}%`,
                                width: `${width - 5}%`,
                                left: `${position}%`
                              }}
                              title={`${formatDate(sale.sale_date)}: ${formatCurrency(Number(sale.sale_price))}`}
                            >
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background border p-2 rounded text-xs whitespace-nowrap z-10">
                                {formatDate(sale.sale_date)}: {formatCurrency(Number(sale.sale_price))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {validSaleHistory.map((sale: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{formatDate(sale.sale_date)}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(Number(sale.sale_price))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-muted-foreground">No sale history available</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-muted-foreground" />
                  Neighborhood Information
                </h3>
                {isAuthenticated && isSubscriber ? (
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Local Schools</span>
                      <Badge variant="outline">Good</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transport Links</span>
                      <Badge variant="outline">Excellent</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Local Amenities</span>
                      <Badge variant="outline">Good</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crime Rate</span>
                      <Badge variant="outline">Low</Badge>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        This property is located in a well-established residential area with good 
                        local schools and excellent transport links. The neighborhood has seen 
                        steady property value growth over the past 5 years.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-muted-foreground mb-2">
                      Upgrade to PRO to access detailed neighborhood information
                    </p>
                    <Button className="text-sm" size="sm">
                      Upgrade Now
                    </Button>
                  </div>
                )}
          </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 