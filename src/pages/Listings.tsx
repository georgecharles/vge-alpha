import React from 'react';
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { useToast } from "../components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { formatCurrency, cn } from "../lib/utils";
import { HeroSection } from "../components/HeroSection";
import EnvironmentDebug from "../components/EnvironmentDebug";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  searchRightmoveProperties, 
  getPropertyDetails,
  checkPropertyActiveStatus,
  type RightmoveProperty,
  type SearchFilters,
  ensureScraperCacheTableExists
} from "../lib/apifyRightmoveScraper";
import { testSupabaseConnection } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import { 
  PropertyInvestmentAnalysis,
  analyzePropertyInvestment 
} from "../lib/geminiService";

interface AskingPricesData {
  postcode: string;
  data?: {
    mean: number;
    median: number;
  };
}

type PropertyType = 'flat' | 'terraced' | 'semi-detached' | 'detached' | 'bungalow' | 'any';
type PropertyTenure = 'freehold' | 'leasehold' | 'any';

interface Filters {
  propertyType: PropertyType;
  tenure: PropertyTenure;
  minBeds: string;
  radius: number;
  page: number;
  limit: number;
  newBuild: boolean;
  maxAgeMonths: number;
  sortBy: 'most_recent_sale_date' | 'distance';
  minPrice?: number;
  maxPrice?: number;
}

interface AreaInsights {
  postcode: string;
  averagePrice: number;
  priceGrowth1Year: number;
  priceGrowth5Years: number;
  crimeRate: number;
  schoolsRating: number;
  transportRating: number;
}

interface PropertySaleHistory {
  date: string;
  price: number;
}

interface PropertyModalProps {
  property: RightmoveProperty;
  onClose: () => void;
  saleHistoryData?: PropertySaleHistory[];
  areaInsights?: AreaInsights;
  investmentAnalysis?: PropertyInvestmentAnalysis | null;
}

// Define a proper interface for the search details
interface SearchDetails {
  originalLocation: string;
  formattedLocation: string;
  isOutcode: boolean;
  timestamp: string;
  cacheBustLocation?: string;
  searchDurationMs?: number;
  propertiesFound?: number;
  zeroPriceCount?: number;
  missingAddressCount?: number;
}

// Add these styles at the top of the file, after the imports
const animationStyles = `
  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .animate-fadein {
    animation: fadein 0.5s ease-in;
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

const PropertyModal = ({ 
  property, 
  onClose, 
  saleHistoryData = [], 
  areaInsights,
  investmentAnalysis 
}: PropertyModalProps) => {
  // Safety check - if property is undefined or null, render fallback UI
  if (!property) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Error Loading Property</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p className="text-red-600 mb-4">There was an error loading this property. Please try again.</p>
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Use React.useState to store a stable copy of the property data
  const [stableProperty, setStableProperty] = React.useState(property);
  
  // Update the stable property when property id changes
  React.useEffect(() => {
    if (property && property.id !== stableProperty?.id) {
      setStableProperty(property);
    }
  }, [property, stableProperty?.id]);
  
  // Use React.useMemo to stabilize and prevent unnecessary re-renders
  const memoizedProperty = React.useMemo(() => stableProperty, [stableProperty?.id]);
  
  // Stabilize price display to prevent flickering
  const formattedPrice = React.useMemo(() => 
    formatCurrency(memoizedProperty?.price || 0), 
    [memoizedProperty?.price]
  );
  
  // Safe getters for investment metrics with proper error handling
  const getMetric = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(1) + '%';
  };
  
  const getCashFlow = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    return formatCurrency(value);
  };
  
  const calculateTotalPriceGrowth = React.useCallback(() => {
    if (!saleHistoryData || saleHistoryData.length < 2) return 0;
    
    try {
      const firstSale = saleHistoryData[0];
      const lastSale = saleHistoryData[saleHistoryData.length - 1];
      
      if (!firstSale.price || !lastSale.price) return 0;
      
      return ((lastSale.price - firstSale.price) / firstSale.price) * 100;
    } catch (error) {
      console.error('Error calculating total price growth:', error);
      return 0;
    }
  }, [saleHistoryData]);
  
  // Pre-calculate derived values to prevent recalculation during renders
  const calculateAnnualGrowth = React.useCallback(() => {
    if (!saleHistoryData || saleHistoryData.length < 2) return 0;
    
    try {
      const firstSale = saleHistoryData[0];
      const lastSale = saleHistoryData[saleHistoryData.length - 1];
      
      if (!firstSale.date || !lastSale.date || !firstSale.price || !lastSale.price) return 0;
      
      const firstDate = new Date(firstSale.date);
      const lastDate = new Date(lastSale.date);
      
      const yearsDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      if (yearsDiff < 0.5) return 0;
      
      const totalGrowthRate = (lastSale.price - firstSale.price) / firstSale.price;
      const annualGrowthRate = Math.pow(1 + totalGrowthRate, 1 / yearsDiff) - 1;
      
      return annualGrowthRate * 100;
    } catch (error) {
      console.error('Error calculating annual growth:', error);
      return 0;
    }
  }, [saleHistoryData]);

  const calculatePricePerSqft = React.useCallback(() => {
    try {
      if (memoizedProperty.floor_area?.size && memoizedProperty.floor_area.size > 0 && 
          memoizedProperty.price && memoizedProperty.price > 0) {
        return memoizedProperty.price / memoizedProperty.floor_area.size;
      }
      return null;
    } catch (error) {
      console.error('Error calculating price per sqft:', error);
      return null;
    }
  }, [memoizedProperty.price, memoizedProperty.floor_area]);

  const pricePerSqft = React.useMemo(() => calculatePricePerSqft(), [calculatePricePerSqft]);
  const annualGrowthRate = React.useMemo(() => calculateAnnualGrowth(), [calculateAnnualGrowth]);
  const totalPriceGrowth = React.useMemo(() => calculateTotalPriceGrowth(), [calculateTotalPriceGrowth]);
  
  // Add debug mode toggle for development
  const showDebug = import.meta.env.DEV;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex justify-between">
          <h2 className="text-2xl font-bold">{memoizedProperty.address || 'Property Details'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Add debug panel in development mode */}
        {showDebug && (
          <div className="mb-4 p-3 bg-gray-100 rounded-md border border-gray-300 text-xs font-mono">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div>
              <div>Property ID: <span className="font-bold">{memoizedProperty.id}</span></div>
              <div>Raw Price: <span className="font-bold">{memoizedProperty.price}</span></div>
              <div>Formatted Price: <span className="font-bold">{formattedPrice}</span></div>
              <div>Agent Name: <span className="font-bold">{memoizedProperty.agent.name}</span></div>
              <div>Agent Phone: <span className="font-bold">{memoizedProperty.agent.phone || 'Not available'}</span></div>
              <div>Agent Logo URL: <span className="font-bold">{memoizedProperty.agent.logo_url || 'Not available'}</span></div>
              <div>Raw property data: <pre className="mt-2 overflow-auto max-h-20">{JSON.stringify(memoizedProperty, null, 2)}</pre></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            {memoizedProperty.main_image_url && (
              <img 
                src={memoizedProperty.main_image_url} 
                alt={memoizedProperty.address} 
                className="mb-4 h-64 w-full rounded-lg object-cover" 
              />
            )}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-100 p-3">
                <h3 className="font-medium text-gray-500">Price</h3>
                <p className="text-lg font-bold">{formattedPrice}</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-3">
                <h3 className="font-medium text-gray-500">Property Type</h3>
                <p className="text-lg font-bold">{memoizedProperty.property_type}</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-3">
                <h3 className="font-medium text-gray-500">Bedrooms</h3>
                <p className="text-lg font-bold">{property.bedrooms}</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-3">
                <h3 className="font-medium text-gray-500">Bathrooms</h3>
                <p className="text-lg font-bold">{property.bathrooms || "N/A"}</p>
              </div>
              {pricePerSqft && (
                <div className="rounded-lg bg-gray-100 p-3">
                  <h3 className="font-medium text-gray-500">Price per sq.ft</h3>
                  <p className="text-lg font-bold">{formatCurrency(pricePerSqft)}</p>
                </div>
              )}
              {property.tenure && (
                <div className="rounded-lg bg-gray-100 p-3">
                  <h3 className="font-medium text-gray-500">Tenure</h3>
                  <p className="text-lg font-bold">{property.tenure}</p>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="mb-2 text-xl font-bold">Description</h3>
              <p className="text-gray-700">{property.description}</p>
            </div>
            
            {property.features && property.features.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-xl font-bold">Features</h3>
                <ul className="list-inside list-disc">
                  {property.features.map((feature: string, index: number) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <Tabs defaultValue="investment">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="investment">Investment</TabsTrigger>
                <TabsTrigger value="area">Area Insights</TabsTrigger>
                <TabsTrigger value="history">Sale History</TabsTrigger>
                <TabsTrigger value="agent">Agent Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="investment" className="mt-4">
                {investmentAnalysis ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Investment Analysis</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <h4 className="text-sm text-blue-700">Rental Yield</h4>
                        <p className="text-xl font-bold">{getMetric(investmentAnalysis.estimatedRentalYield)}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md">
                        <h4 className="text-sm text-green-700">Return on Investment</h4>
                        <p className="text-xl font-bold">{getMetric(investmentAnalysis.estimatedROI)}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md">
                        <h4 className="text-sm text-purple-700">Monthly Cash Flow</h4>
                        <p className="text-xl font-bold">{getCashFlow(investmentAnalysis.estimatedCashFlow)}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-md">
                        <h4 className="text-sm text-amber-700">Annual Profit</h4>
                        <p className="text-xl font-bold">{getCashFlow(investmentAnalysis.estimatedAnnualProfit)}</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-md">
                        <h4 className="text-sm text-indigo-700">Cap Rate</h4>
                        <p className="text-xl font-bold">{getMetric(investmentAnalysis.estimatedCapRate)}</p>
                      </div>
                      <div className="bg-rose-50 p-3 rounded-md">
                        <h4 className="text-sm text-rose-700">Area Growth Potential</h4>
                        <p className="text-xl font-bold">{getMetric(investmentAnalysis.areaGrowthPotential)}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Top Investment Strategies</h4>
                      <div className="space-y-3">
                        {investmentAnalysis.strategyRecommendations && 
                         investmentAnalysis.strategyRecommendations.slice(0, 3).map((strategy, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{strategy.strategy}</span>
                              <span className={`px-2 py-0.5 rounded text-sm ${
                                strategy.score >= 8 ? 'bg-green-100 text-green-800' : 
                                strategy.score >= 6 ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                Score: {strategy.score?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{strategy.reasoning}</p>
                          </div>
                        ))}
                        
                        {(!investmentAnalysis.strategyRecommendations || 
                          investmentAnalysis.strategyRecommendations.length === 0) && (
                          <p className="text-gray-500">No strategy recommendations available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold mb-2">Property Potential</h4>
                        <p className="text-gray-700">{investmentAnalysis.propertyPotential || 'No data available'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Renovation Opportunities</h4>
                        <p className="text-gray-700">{investmentAnalysis.renovationOpportunities || 'No data available'}</p>
                        {investmentAnalysis.estimatedRenovationCost > 0 && (
                          <p className="mt-2 font-medium">Estimated Cost: {getCashFlow(investmentAnalysis.estimatedRenovationCost)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Risk Assessment</h4>
                        <p className="text-gray-700">{investmentAnalysis.riskAssessment || 'No data available'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Market Trends</h4>
                        <p className="text-gray-700">{investmentAnalysis.marketTrends || 'No data available'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="animate-spin mx-auto mb-4 h-8 w-8 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-500">Analyzing investment potential...</p>
                    <p className="text-sm text-gray-400 mt-2">This may take a moment as we calculate metrics for this property.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="area" className="mt-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 text-xl font-bold">Area Insights</h3>
                  {areaInsights ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-500">Average Property Price</h4>
                        <p className="text-lg font-bold">{formatCurrency(areaInsights.averagePrice)}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">Price Growth (1 Year)</h4>
                        <p className="text-lg font-bold">{areaInsights.priceGrowth1Year.toFixed(1)}%</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">Price Growth (5 Years)</h4>
                        <p className="text-lg font-bold">{areaInsights.priceGrowth5Years.toFixed(1)}%</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">Crime Rate</h4>
                        <p className="text-lg font-bold">{areaInsights.crimeRate} (per 1,000 people)</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">Schools Rating</h4>
                        <p className="text-lg font-bold">{areaInsights.schoolsRating}/10</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">Transport Rating</h4>
                        <p className="text-lg font-bold">{areaInsights.transportRating}/10</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Area insights not available for this location.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 text-xl font-bold">Sale History</h3>
                  {saleHistoryData && saleHistoryData.length > 0 ? (
                    <div>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-500">Total Price Growth</h4>
                        <p className="text-lg font-bold">{totalPriceGrowth.toFixed(1)}%</p>
                      </div>
                      {annualGrowthRate > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-500">Annual Growth Rate</h4>
                          <p className="text-lg font-bold">{annualGrowthRate.toFixed(1)}%</p>
                        </div>
                      )}
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left">Date</th>
                            <th className="text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {saleHistoryData.map((sale, index) => (
                            <tr key={index} className="border-t">
                              <td className="py-2">{new Date(sale.date).toLocaleDateString()}</td>
                              <td className="py-2 text-right">{formatCurrency(sale.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                </div>
                ) : (
                  <p className="text-gray-500">No sale history available for this property.</p>
                )}
                </div>
              </TabsContent>
              
              <TabsContent value="agent">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 text-xl font-bold">Agent Details</h3>
                  <div className="flex items-center space-x-4">
                    {property.agent.logo_url && (
                      <img 
                        src={property.agent.logo_url} 
                        alt={property.agent.name} 
                        className="h-16 w-16 rounded-lg object-contain" 
                      />
                    )}
                    <div>
                      <p className="text-lg font-bold">{property.agent.name}</p>
                      {property.agent.phone && (
                        <p className="text-gray-700">{property.agent.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <a 
                      href={property.rightmove_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      View on Rightmove
                    </a>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the SearchDebugPanel component with the proper type
const SearchDebugPanel = ({ 
  searchDetails, 
  properties 
}: { 
  searchDetails: SearchDetails; 
  properties: RightmoveProperty[] 
}) => {
  // Calculate property statistics
  const validProperties = properties.filter(p => p.price > 0);
  const validPricesCount = validProperties.length;
  const zeroPriceCount = properties.filter(p => p.price === 0).length;
  const missingAddressCount = properties.filter(p => !p.address).length;
  
  // Calculate price statistics
  const prices = validProperties.map(p => p.price).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  
  // Get the first property for inspection
  const firstProperty = properties.length > 0 ? properties[0] : null;
  
  return (
    <div className="mb-4 text-xs p-3 bg-gray-100 rounded border border-gray-300">
      <h3 className="font-bold mb-2">Search Debug Panel</h3>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
        <div>Original Location: <span className="font-medium">{searchDetails.originalLocation}</span></div>
        <div>Formatted Location: <span className="font-medium">{searchDetails.formattedLocation}</span></div>
        <div>Is Outcode: <span className="font-medium">{searchDetails.isOutcode ? 'Yes' : 'No'}</span></div>
        <div>Properties Found: <span className="font-medium">{properties.length}</span></div>
        <div>Search Duration: <span className="font-medium">{searchDetails.searchDurationMs?.toFixed(2) || 'N/A'} ms</span></div>
      </div>
      
      <h4 className="font-bold mt-3 mb-1">Property Statistics:</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
        <div>Valid Prices: <span className={`font-medium ${validPricesCount === 0 ? 'text-red-600' : ''}`}>
          {validPricesCount} / {properties.length}
        </span></div>
        <div>Zero Prices: <span className={`font-medium ${zeroPriceCount > 0 ? 'text-red-600' : ''}`}>
          {zeroPriceCount}
        </span></div>
        <div>Missing Addresses: <span className={`font-medium ${missingAddressCount > 0 ? 'text-red-600' : ''}`}>
          {missingAddressCount}
        </span></div>
        <div>Min Price: <span className="font-medium">{formatCurrency(minPrice)}</span></div>
        <div>Max Price: <span className="font-medium">{formatCurrency(maxPrice)}</span></div>
        <div>Avg Price: <span className="font-medium">{formatCurrency(avgPrice)}</span></div>
      </div>
      
      {firstProperty && (
        <>
          <h4 className="font-bold mt-3 mb-1">First Property Data:</h4>
          <div className="bg-gray-200 p-2 rounded overflow-auto max-h-60">
            <pre className="text-xs">{JSON.stringify({
              id: firstProperty.id,
              address: firstProperty.address,
              price: typeof firstProperty.price === 'number' 
                ? firstProperty.price.toString() 
                : firstProperty.price,
              formattedPrice: formatCurrency(firstProperty.price),
              agent: firstProperty.agent
            }, null, 2)}</pre>
          </div>
          
          <h4 className="font-bold mt-3 mb-1">Raw First Property Data (For Debugging):</h4>
          <div className="bg-gray-200 p-2 rounded overflow-auto max-h-60">
            <pre className="text-xs">{JSON.stringify(firstProperty, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
};

// Add a memoized property card component for better performance
const MemoizedPropertyCard = React.memo(
  ({ 
    property, 
    onSelect, 
    analyzingProperties, 
    propertyAnalysis 
  }: { 
    property: RightmoveProperty; 
    onSelect: (property: RightmoveProperty) => void;
    analyzingProperties: string[];
    propertyAnalysis: Record<string, PropertyInvestmentAnalysis>;
  }) => {
    // Safety check for property
    if (!property || !property.id) {
      console.error('Cannot render property card: Invalid property data', property);
      return null;
    }
    
    // Get from props now
    const isAnalyzing = analyzingProperties.includes(property.id);
    const analysis = propertyAnalysis[property.id];
    
    // Safe getters for investment metrics to avoid NaN values
    const getMetric = (value: number | undefined | null): string => {
      if (value === undefined || value === null || isNaN(value)) {
        return 'N/A';
      }
      return value.toFixed(1) + '%';
    };
    
    const getCashFlow = (value: number | undefined | null): string => {
      if (value === undefined || value === null || isNaN(value)) {
        return 'N/A';
      }
      return formatCurrency(value);
    };

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-video relative bg-gray-200">
          {property.main_image_url ? (
            <img 
              src={property.main_image_url} 
              alt={property.address || 'Property'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">No Image Available</span>
            </div>
          )}
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-semibold">
            {formatCurrency(property.price || 0)}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-1">
            {property.address || 'Property Address Unavailable'}
          </h3>
          
          <div className="flex justify-between mb-3">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>{property.property_type || 'Unknown'}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span>{property.bedrooms || 0} beds</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 00-3.495 3.334L2 5.5v9A3.5 3.5 0 005.5 18h9a3.5 3.5 0 003.5-3.5v-9A3.5 3.5 0 0014.5 2h-9zM4 5.5a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 14.5v-9z" clipRule="evenodd" />
              </svg>
              <span>{property.bathrooms || 1} bath</span>
            </div>
          </div>
          
          {/* Investment analysis section */}
          {analysis ? (
            <div className="border-t pt-3 mt-2">
              <h4 className="text-sm font-semibold mb-2 text-blue-600">Investment Highlights</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">ROI:</span> <span className="font-medium">{getMetric(analysis.estimatedROI)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Yield:</span> <span className="font-medium">{getMetric(analysis.estimatedRentalYield)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Monthly:</span> <span className="font-medium">{getCashFlow(analysis.estimatedCashFlow)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Best Strategy:</span> <span className="font-medium">
                    {analysis.strategyRecommendations && analysis.strategyRecommendations.length > 0 
                      ? analysis.strategyRecommendations[0].strategy 
                      : 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Area Growth:</span> <span className="font-medium">{getMetric(analysis.areaGrowthPotential)}</span>
                </div>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="border-t pt-3 mt-2">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing investment potential...
              </div>
            </div>
          ) : null}
          
          <button 
            onClick={() => onSelect(property)} 
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-300"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }
);

export default function Listings() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [properties, setProperties] = React.useState<RightmoveProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = React.useState<RightmoveProperty | null>(null);
  const [selectedPropertySaleHistory, setSelectedPropertySaleHistory] = React.useState<PropertySaleHistory[]>([]);
  const [selectedPropertyAreaInsights, setSelectedPropertyAreaInsights] = React.useState<AreaInsights | undefined>(undefined);
  const [selectedPropertyAnalysis, setSelectedPropertyAnalysis] = React.useState<PropertyInvestmentAnalysis | null>(null);
  const [location, setLocation] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [minBeds, setMinBeds] = React.useState("");
  const [maxBeds, setMaxBeds] = React.useState("");
  const [propertyType, setPropertyType] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalResults, setTotalResults] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [isMockData, setIsMockData] = React.useState<boolean>(false);
  const [initializing, setInitializing] = React.useState(false);
  const [isTableReady, setIsTableReady] = React.useState(false);
  const [dbDiagnostics, setDbDiagnostics] = React.useState<any>(null);
  const [runningDiagnostics, setRunningDiagnostics] = React.useState(false);
  const [scraperError, setScraperError] = React.useState<string | null>(null);
  const [directPropertyId, setDirectPropertyId] = React.useState<string>("");
  const [isDirectPropertyLoading, setIsDirectPropertyLoading] = React.useState(false);
  const [apiKeyInvalid, setApiKeyInvalid] = React.useState<boolean>(false);
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  const [searchDetails, setSearchDetails] = React.useState<SearchDetails | null>(null);
  const [propertyAnalysis, setPropertyAnalysis] = React.useState<Record<string, PropertyInvestmentAnalysis>>({});
  const [analyzingProperties, setAnalyzingProperties] = React.useState<string[]>([]);
  // Add error state
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const displayProperties = properties;

  const mockSaleHistory = (propertyId: string): PropertySaleHistory[] => {
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() - 15);
    
    const numSales = 2 + Math.floor(Math.random() * 3);
    const result: PropertySaleHistory[] = [];
    
    let currentDate = new Date(baseDate);
    let currentPrice = 100000 + Math.floor(Math.random() * 150000);
    
    for (let i = 0; i < numSales; i++) {
      result.push({
        date: currentDate.toISOString().split('T')[0],
        price: currentPrice
      });
      
      const yearsToAdd = 2 + Math.floor(Math.random() * 4);
      currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + yearsToAdd));
      
      const increase = 0.1 + Math.random() * 0.2;
      currentPrice = Math.floor(currentPrice * (1 + increase));
    }
    
    return result;
  };

  const mockAreaInsights = (postcode: string): AreaInsights => {
    return {
      postcode,
      averagePrice: 250000 + Math.floor(Math.random() * 500000),
      priceGrowth1Year: 2 + Math.random() * 8,
      priceGrowth5Years: 10 + Math.random() * 30,
      crimeRate: 30 + Math.random() * 40,
      schoolsRating: 5 + Math.random() * 5,
      transportRating: 4 + Math.random() * 6
    };
  };

  // Memoize the handleSearch function to prevent it from changing on every render
  const handleSearch = React.useCallback(async (searchLocation: string) => {
    if (!searchLocation.trim()) {
      setSearchError('Please enter a location to search');
      return;
    }

    // Reset states
    setProperties([]);
    setSearchError(null);
    setLoading(true);
    setSelectedProperty(null);
    setPage(1);
    
    // Record the start time
    const searchStartTime = Date.now();
    
    // Reset analytics state to prevent stale data
    setPropertyAnalysis({});
    setAnalyzingProperties([]);
    
    // Capture search start time for performance tracking
    const startTime = Date.now();
    
    try {
      console.log('Starting search for location:', searchLocation);
      
      // Create search info object for debugging
      const searchInfo: SearchDetails = {
        originalLocation: searchLocation,
        formattedLocation: searchLocation,
        isOutcode: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/i.test(searchLocation),
        timestamp: new Date().toISOString(),
      };
      
      // Add cache-busting parameter for development mode
      if (import.meta.env.DEV && Math.random() > 0.5) {
        const cacheBustLocation = `${searchLocation}?_bypass_cache=${Date.now()}`;
        searchInfo.cacheBustLocation = cacheBustLocation;
        searchLocation = cacheBustLocation;
      }
      
      // Filter parameters
      const searchParams = {
        location: searchLocation,
        limit: 100, // Set a reasonable limit for the API
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        minBeds: minBeds ? parseInt(minBeds) : undefined,
        maxBeds: maxBeds ? parseInt(maxBeds) : undefined,
        propertyType: propertyType || undefined,
      };
      
      console.log('Searching with parameters:', searchParams);
      
      // Execute search
      const response = await searchRightmoveProperties(searchParams);
      
      console.log(`Search completed with ${response.properties.length} results`);
      
      // Validate response
      if (!response || !Array.isArray(response.properties)) {
        throw new Error('Invalid response structure from property search');
      }
      
      // Calculate search duration
      const endTime = Date.now();
      const searchDurationMs = endTime - startTime;
      
      // Validate properties to check for data quality issues
      let validCount = 0;
      let zeroPriceCount = 0;
      let missingAddressCount = 0;
      
      response.properties.forEach(property => {
        if (!property.price || property.price === 0) zeroPriceCount++;
        if (!property.address) missingAddressCount++;
        if (property.price > 0 && property.address) validCount++;
      });
      
      // Update search info with stats
      searchInfo.searchDurationMs = searchDurationMs;
      searchInfo.propertiesFound = response.properties.length;
      searchInfo.zeroPriceCount = zeroPriceCount;
      searchInfo.missingAddressCount = missingAddressCount;
      
      setSearchDetails(searchInfo);
      setProperties(response.properties);
      setTotalPages(response.totalPages || 1);
      
      // Log data quality issues for debugging
      if (zeroPriceCount > 0 || missingAddressCount > 0) {
        console.warn(`Data quality issues: ${zeroPriceCount} properties with zero price, ${missingAddressCount} properties with missing address`);
      }
      
      // For development, automatically analyze first few properties
      if (import.meta.env.DEV && response.properties.length > 0) {
        analyzePropertiesInBatches(response.properties, 3, 2000);
      }
    } catch (error) {
      console.error('Error during property search:', error);
      setSearchError(`Failed to search properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Show user-friendly toast
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during search",
        variant: "destructive",
      });
    } finally {
      // Ensure the loading state stays visible for at least 1 second to avoid flickering
      const searchDuration = Date.now() - searchStartTime;
      const minimumLoadingTime = 1000; // 1 second
      
      if (searchDuration < minimumLoadingTime) {
        setTimeout(() => {
          setLoading(false);
        }, minimumLoadingTime - searchDuration);
      } else {
        setLoading(false);
      }
    }
  }, [minPrice, maxPrice, minBeds, maxBeds, propertyType, toast]);

  // Update the useEffect to use proper dependencies
  React.useEffect(() => {
    if (page > 1 && location) {
      handleSearch(location);
    }
  }, [page, location, handleSearch]);
  
  // Simplified Hero search function
  const handleHeroSearch = React.useCallback((searchTerm: string) => {
    setLocation(searchTerm);
    if (searchTerm) {
      handleSearch(searchTerm);
    }
  }, [handleSearch]);

  // Check if the scraper_cache table exists on component mount
  React.useEffect(() => {
    const checkTable = async () => {
      const exists = await ensureScraperCacheTableExists();
      setIsTableReady(exists);
    };
    
    checkTable();
  }, []);

  // Function to manually initialize the scraper_cache table
  const initializeScraper = async () => {
    setInitializing(true);
    try {
      const success = await ensureScraperCacheTableExists();
      setIsTableReady(success);
      
      if (success) {
            toast({
          title: "Setup complete",
          description: "The scraper_cache table has been set up successfully",
              variant: "default",
            });
      } else {
          toast({
          title: "Setup failed",
          description: "Failed to set up the scraper_cache table. Check console for details.",
            variant: "destructive",
          });
        }
    } catch (error) {
      console.error("Error initializing scraper:", error);
      toast({
        title: "Setup error",
        description: "An error occurred while setting up the scraper",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const runDatabaseDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      // Test the connection
      const connectionTest = await testSupabaseConnection();
      console.log("Supabase connection test:", connectionTest);
      
      // Direct test for table existence - simple count query
      let directTableTest: { exists: boolean; error: string | null; count: number } = { 
        exists: false, 
        error: null, 
        count: 0 
      };
      
      try {
        const { data, error, count } = await supabase
          .from('scraper_cache')
          .select('*', { count: 'exact', head: true });
          
        directTableTest = { 
          exists: !error, 
          error: error ? `${error.code}: ${error.message}` : null,
          count: count || 0
        };
        
        console.log("Direct table check:", directTableTest);
      } catch (e) {
        console.error("Error in direct table check:", e);
        directTableTest.error = e instanceof Error ? e.message : String(e);
      }
      
      // Test insertion capability if the table exists
      let insertTest: { success: boolean; error: string | null } = { 
        success: false, 
        error: null 
      };
      
      if (directTableTest.exists) {
        try {
          const testKey = `diagnostic-test-${Date.now()}`;
          const { error } = await supabase
            .from('scraper_cache')
            .insert({ 
              key: testKey, 
              data: { test: 'diagnostics' },
              created_at: new Date().toISOString()
            });
            
          insertTest = { 
            success: !error, 
            error: error ? `${error.code}: ${error.message}` : null 
          };
          
          console.log("Insert test:", insertTest);
          
          // Clean up the test entry
          if (!error) {
            await supabase
              .from('scraper_cache')
              .delete()
              .eq('key', testKey);
          }
        } catch (e) {
          console.error("Error in insert test:", e);
          insertTest.error = e instanceof Error ? e.message : String(e);
        }
      }
      
      // Test table existence using our helper function
      const tableExists = await ensureScraperCacheTableExists();
      console.log("Helper function check result:", tableExists);
      
      // Store diagnostics results
      setDbDiagnostics({
        connectionTest,
        tableExists,
        directTableTest,
        insertTest,
        timestamp: new Date().toISOString(),
        env: {
          mockData: import.meta.env.VITE_USE_MOCK_DATA,
          nodeEnv: import.meta.env.NODE_ENV,
          mode: import.meta.env.MODE
        }
      });
      
      // Show results to user
      if (directTableTest.exists && insertTest.success) {
        toast({
          title: "Database Ready",
          description: "Your scraper_cache table exists and is working correctly!",
          variant: "default",
        });
      } else if (directTableTest.exists && !insertTest.success) {
        toast({
          title: "Table Exists But Can't Insert",
          description: "The table exists but we can't write to it. Check RLS policies.",
          variant: "warning",
        });
    } else {
        toast({
          title: connectionTest.success ? "Table Missing" : "Connection Issues",
          description: connectionTest.success 
            ? "The scraper_cache table doesn't exist or isn't accessible."
            : connectionTest.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setDbDiagnostics({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Diagnostics Error",
        description: "Failed to run database diagnostics. See console for details.",
        variant: "destructive",
      });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  // Add a function to get or generate property analysis
  const getPropertyAnalysis = async (property: RightmoveProperty) => {
    if (!property || !property.id) {
      console.error('Cannot analyze property: Invalid property data', property);
      return null;
    }
    
    // Check if we already have analysis for this property
    if (propertyAnalysis[property.id]) {
      console.log(`Using cached analysis for property ${property.id}`);
      return propertyAnalysis[property.id];
    }
    
    // Mark property as being analyzed
    setAnalyzingProperties(prev => [...prev, property.id]);
    
    try {
      // Get investment analysis for this property
      console.log(`Analyzing property ${property.id}...`);
      const analysis = await analyzePropertyInvestment(property);
      
      // Save the analysis
      setPropertyAnalysis(prev => ({
        ...prev,
        [property.id]: analysis
      }));
      
      return analysis;
    } catch (error) {
      console.error(`Error analyzing property ${property.id}:`, error);
      return null;
    } finally {
      // Remove property from analyzing state
      setAnalyzingProperties(prev => prev.filter(id => id !== property.id));
    }
  };

  // Modify the function that handles property selection
  const handlePropertySelect = async (property: RightmoveProperty) => {
    if (!property || !property.id) {
      console.error('Cannot select property: Invalid property data', property);
      return;
    }
    
    try {
      // Get mock data for sale history and area insights
      const saleHistory = mockSaleHistory(property.id);
      const areaInsights = mockAreaInsights(property.postcode || '');
      
      // Get or fetch investment analysis
      const analysis = await getPropertyAnalysis(property);
      
      // Set selected property with all data
      setSelectedProperty(property);
      setSelectedPropertySaleHistory(saleHistory);
      setSelectedPropertyAreaInsights(areaInsights);
      setSelectedPropertyAnalysis(analysis);
    } catch (error) {
      console.error('Error selecting property:', error);
      // Just set basic property data in case of error
      setSelectedProperty(property);
      setSelectedPropertySaleHistory([]);
      setSelectedPropertyAreaInsights(undefined);
      setSelectedPropertyAnalysis(null);
    }
  };

  // Update the useEffect that triggers property analysis to use the new batch function
  React.useEffect(() => {
    if (properties.length > 0) {
      analyzePropertiesInBatches(properties);
    }
  }, [properties]);

  // Add this function after the getPropertyAnalysis function
  const analyzePropertiesInBatches = (properties: RightmoveProperty[], batchSize = 3, delayMs = 2000) => {
    if (!properties || properties.length === 0) return;
    
    console.log(`Starting batch analysis of ${properties.length} properties`);
    
    // Analyze first batch immediately
    const firstBatch = properties.slice(0, batchSize);
    firstBatch.forEach(property => getPropertyAnalysis(property));
    
    // Process remaining properties in batches with delay
    if (properties.length > batchSize) {
      let currentBatch = 1;
      const totalBatches = Math.ceil((properties.length - batchSize) / batchSize);
      
      const processNextBatch = () => {
        if (currentBatch <= totalBatches) {
          const startIdx = currentBatch * batchSize;
          const endIdx = Math.min(startIdx + batchSize, properties.length);
          const batch = properties.slice(startIdx, endIdx);
          
          console.log(`Processing batch ${currentBatch}/${totalBatches} (${batch.length} properties)`);
          
          batch.forEach((property, idx) => {
            // Stagger the analysis within each batch to avoid overwhelming the API
            setTimeout(() => getPropertyAnalysis(property), idx * 500);
          });
          
          currentBatch++;
          setTimeout(processNextBatch, delayMs);
        }
      };
      
      // Start processing batches after initial delay
      setTimeout(processNextBatch, delayMs);
    }
  };

  // Add a function to search by direct property ID
  const handleDirectPropertySearch = async () => {
    if (!directPropertyId || directPropertyId.trim() === '') {
      toast({
        title: "Property ID required",
        description: "Please enter a Rightmove property ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsDirectPropertyLoading(true);
    setProperties([]);
    setIsMockData(false);
    setScraperError(null);
    setApiKeyInvalid(false);
    
    try {
      toast({
        title: "Fetching property details",
        description: "This may take up to 30 seconds as we fetch data from Rightmove",
        variant: "default",
      });
      
      // Get the property details
      const property = await getPropertyDetails(directPropertyId.trim());
      
      if (property) {
        setProperties([property]);
        setTotalPages(1);
        
        toast({
          title: "Property Found",
          description: "Successfully loaded the property details",
          variant: "default",
        });
      } else {
        toast({
          title: "Property Not Found",
          description: "No details found for that property ID",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Detailed error handling for Apify
      if (errorMessage.includes('Apify token validation failed')) {
        setApiKeyInvalid(true);
        toast({
          title: "Apify Token Invalid",
          description: "Your Apify API token appears to be invalid. Please check your settings.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('actor run failed')) {
        setScraperError(`Apify scraper failed: ${errorMessage}`);
        toast({
          title: "Scraper Failed",
          description: "The Rightmove scraper encountered an error. Please try again later.",
          variant: "destructive",
        });
      } else {
        setScraperError(errorMessage);
        toast({
          title: "Property Search Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsDirectPropertyLoading(false);
    }
  };

  return (
    <Layout>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <HeroSection 
        title="Find Your Perfect Investment Property"
        subtitle="Search thousands of properties to discover your next investment opportunity"
        onSearch={handleHeroSearch}
        showSearch={true}
        height="h-[400px]"
      />
      
      <div className="container mx-auto p-4 -mt-12 relative z-10">
        {!isTableReady && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 border border-red-200">
            <h3 className="font-medium mb-2">Database Setup Required</h3>
            <p className="mb-3">
              The scraper_cache table is not set up in your Supabase database. This is needed to cache property data.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={initializeScraper} 
                disabled={initializing || runningDiagnostics} 
                variant="destructive"
              >
                {initializing ? <LoadingSpinner size="sm" /> : "Initialize Database"}
              </Button>
              
              <Button
                onClick={runDatabaseDiagnostics}
                disabled={runningDiagnostics || initializing}
                variant="outline"
              >
                {runningDiagnostics ? <LoadingSpinner size="sm" /> : "Run Diagnostics"}
              </Button>
            </div>
            
            {dbDiagnostics && (
              <div className="mt-4 p-3 bg-white rounded border text-xs font-mono text-black overflow-auto max-h-40">
                <pre>{JSON.stringify(dbDiagnostics, null, 2)}</pre>
              </div>
            )}
            
            <div className="mt-4 text-sm">
              <p className="font-semibold">Manual Setup Instructions:</p>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to the "SQL Editor" section</li>
                <li>Create a new query</li>
                <li>Copy and paste the SQL from <code>src/lib/migrations/fix_scraper_cache.sql</code></li>
                <li>Run the query</li>
                <li>Return to this page and refresh</li>
              </ol>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <EnvironmentDebug />
        </div>
        
        {apiKeyInvalid && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 border-2 border-red-300 shadow-md">
            <h3 className="font-bold text-lg mb-3">Invalid Apify API Token</h3>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-md">
                  The application cannot connect to the Apify API with the current token. Property searches require a valid Apify token.
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-md border border-red-200">
              <h4 className="font-bold mb-2">How to Fix This Issue:</h4>
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  <span className="font-medium">Verify your Apify token</span>: 
                  Check that you're using the correct token from your Apify account.
                </li>
                <li>
                  <span className="font-medium">Add it to your .env.local file</span>: 
                  <code className="bg-gray-100 px-1 py-0.5 rounded ml-1">VITE_APIFY_API_TOKEN=your_token_here</code>
                </li>
                <li>
                  <span className="font-medium">Restart your dev server</span>: Using <code className="bg-gray-100 px-1 py-0.5 rounded">npm run dev</code> or <code className="bg-gray-100 px-1 py-0.5 rounded">yarn dev</code>
                </li>
              </ol>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md">
              <h4 className="font-bold">About Apify</h4>
              <p className="mt-1">
                This application uses Apify's Rightmove Scraper to fetch property data from Rightmove. You need a valid Apify account and API token to use this feature.
              </p>
            </div>
          </div>
        )}
        
        {scraperError && scraperError.includes('Failed to fetch') && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 border-2 border-red-300 shadow-md">
            <h3 className="font-bold text-lg mb-3">Network Connection Error</h3>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-md">
                  The application failed to connect to the Apify API. This is typically a network connectivity issue.
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-md border border-red-200">
              <h4 className="font-bold mb-2">How to Fix This Issue:</h4>
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  <span className="font-medium">Check your internet connection</span>: 
                  Ensure you have a stable internet connection.
                </li>
                <li>
                  <span className="font-medium">Check your firewall settings</span>: 
                  Your firewall might be blocking connections to api.apify.com.
                </li>
                <li>
                  <span className="font-medium">Try using a direct property search</span>: 
                  If you have a specific property ID, try using the direct search below.
                </li>
                <li>
                  <span className="font-medium">Use the Rightmove Scraper Test</span>: 
                  Expand the Environment Debug panel and use the "Test Rightmove Scraper" button to check if the API is accessible.
                </li>
              </ol>
            </div>

            <div className="mt-4 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
              <h4 className="font-bold mb-2">Try Direct Property ID Search</h4>
              <p className="mb-2 text-sm">
                Search for a specific property by ID:
              </p>
              <div className="flex gap-2 items-center mt-2">
                <Input
                  placeholder="Enter Rightmove property ID (e.g. 150455012)"
                  value={directPropertyId}
                  onChange={(e) => setDirectPropertyId(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  onClick={handleDirectPropertySearch} 
                  disabled={isDirectPropertyLoading}
                  variant="default"
                  size="sm"
                >
                  {isDirectPropertyLoading ? <LoadingSpinner size="sm" /> : "Search Property"}
                </Button>
              </div>
              <p className="mt-2 text-xs">
                The property ID is the number in the Rightmove URL after "/properties/". 
                Example: https://www.rightmove.co.uk/properties/<strong>150455012</strong>
              </p>
            </div>
          </div>
        )}
        
        {showDebugPanel && import.meta.env.DEV && searchDetails && (
          <SearchDebugPanel searchDetails={searchDetails} properties={properties} />
        )}
        
        <div className="mb-6 flex flex-wrap gap-4 rounded-lg bg-white p-6 shadow-md">
          <div className="w-full md:w-64">
            <label className="mb-2 block font-medium" htmlFor="location">
              Location
            </label>
            <Input
              id="location"
              type="text"
              placeholder="e.g. London, Manchester, B16"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Add debug mode toggle only in development */}
          {import.meta.env.DEV && (
            <div className="w-full flex justify-end mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-xs"
              >
                {showDebugPanel ? "Hide Debug Panel" : "Show Debug Panel"}
              </Button>
            </div>
          )}

          <div className="w-full sm:w-1/2 md:w-32">
            <label className="mb-2 block font-medium" htmlFor="minPrice">
              Min Price
            </label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min £"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full sm:w-1/2 md:w-32">
            <label className="mb-2 block font-medium" htmlFor="maxPrice">
              Max Price
            </label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max £"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-32">
            <label className="mb-2 block font-medium" htmlFor="minBeds">
              Min Beds
            </label>
            <Input
              id="minBeds"
              type="number"
              placeholder="Min"
              value={minBeds}
              onChange={(e) => setMinBeds(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full sm:w-1/2 md:w-32">
            <label className="mb-2 block font-medium" htmlFor="maxBeds">
              Max Beds
            </label>
            <Input
              id="maxBeds"
              type="number"
              placeholder="Max"
              value={maxBeds}
              onChange={(e) => setMaxBeds(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-32">
            <label className="mb-2 block font-medium" htmlFor="propertyType">
              Property Type
            </label>
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Any</option>
              <option value="detached">Detached</option>
              <option value="semi-detached">Semi-Detached</option>
              <option value="terraced">Terraced</option>
              <option value="flat">Flat</option>
              <option value="bungalow">Bungalow</option>
            </select>
          </div>
          
          <div className="flex w-full items-end md:w-auto">
            <Button 
              onClick={() => {
                if (!loading) {
                  handleSearch(location);
                }
              }} 
              disabled={loading} 
              className="w-full md:w-auto"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Searching...</span>
                </div>
              ) : "Search"}
            </Button>
          </div>
        </div>
        
        {isMockData && (
          <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800 border border-amber-200">
            <h3 className="font-bold mb-2">Using Mock Data</h3>
            <p className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Mock data is being displayed instead of real Rightmove properties. 
            </p>
            
            <EnvironmentDebug />
            
            <div className="text-sm mt-3">
              <p className="font-semibold mb-1">Possible reasons:</p>
              <ul className="list-disc pl-5">
                <li className={import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'font-bold' : ''}>
                  Environment variable VITE_USE_MOCK_DATA is set to 'true' 
                  {import.meta.env.VITE_USE_MOCK_DATA === 'true' && " ✓"}
                </li>
                <li className={!isTableReady ? 'font-bold' : ''}>
                  The scraper_cache table is not properly set up
                  {!isTableReady && " ✓"}
                </li>
                <li>The Rightmove scraper encountered an error fetching property data</li>
                <li>Network connectivity issues accessing Rightmove</li>
              </ul>
            </div>
            
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={runDatabaseDiagnostics} disabled={runningDiagnostics}>
                {runningDiagnostics ? <LoadingSpinner size="sm" /> : "Run Diagnostics"}
              </Button>
              <Button variant="outline" size="sm" onClick={initializeScraper} disabled={initializing}>
                {initializing ? <LoadingSpinner size="sm" /> : "Initialize Database"}
              </Button>
            </div>
          </div>
        )}
        
        {searchError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Search Error</h3>
                <p className="mt-1 text-sm">{searchError}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 min-h-[200px] bg-white rounded-lg shadow-md animate-fadein">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mb-4"></div>
            <p className="text-gray-600 font-medium">Searching properties in {location}...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
            <div className="mt-4 w-64 bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        ) : properties.length > 0 ? (
          <React.Fragment>
            {/* Wrap in try-catch to prevent white screen */}
            {(() => {
              try {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <div key={property.id || Math.random().toString()}>
                        <MemoizedPropertyCard 
                          property={property}
                          onSelect={handlePropertySelect}
                          analyzingProperties={analyzingProperties}
                          propertyAnalysis={propertyAnalysis}
                        />
                      </div>
                    ))}
                  </div>
                );
              } catch (error) {
                console.error('Error rendering property grid:', error);
                return (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                    <h3 className="font-bold">Error Displaying Properties</h3>
                    <p className="mt-2">There was an error displaying the property results. Please try refreshing the page.</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">Error details</summary>
                      <pre className="mt-2 text-xs p-2 bg-red-100 rounded">
                        {error instanceof Error ? error.message : String(error)}
                      </pre>
                    </details>
                  </div>
                );
              }
            })()}
          </React.Fragment>
        ) : !searchError && location ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching for a different location or adjusting your filters.
            </p>
          </div>
        ) : null}
      </div>
      
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          saleHistoryData={selectedPropertySaleHistory}
          areaInsights={selectedPropertyAreaInsights}
          investmentAnalysis={selectedPropertyAnalysis}
        />
      )}
    </Layout>
  );
} 