import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { toast } from "../components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { formatCurrency } from "../lib/utils";
import { HeroSection } from "../components/HeroSection";
import EnvironmentDebug from "../components/EnvironmentDebug";
import {
  searchRightmoveProperties, 
  getPropertyDetails,
  convertApifyPropertyToRightmoveProperty,
  type RightmoveProperty,
  ensureScraperCacheTableExists,
  loadLocalDataset,
  SearchFilters,
  testApifyToken
} from "../lib/apifyRightmoveScraper";
import { testSupabaseConnection } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import { 
  PropertyInvestmentAnalysis,
  analyzePropertyInvestment,
  mockInvestmentAnalysis
} from "../lib/geminiService";




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

// Add the PropertyCardProps interface after other interfaces (around line 60)
interface PropertyCardProps {
  property: RightmoveProperty;
  onClick: (property: RightmoveProperty) => void;
  isAnalyzing?: boolean;
}

// ... existing code ...

// Fix the PropertyModal component to accept all required props
const PropertyModal = ({ 
  property, 
  onClose, 
  saleHistoryData = [], 
  areaInsights,
  investmentAnalysis 
}: PropertyModalProps) => {
  const [mainImageError, setMainImageError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  useEffect(() => {
    // Reset state when property changes
    if (property) {
      setMainImageError(false);
      setSelectedImageIndex(0);
      console.log(`PropertyModal: Loading property ${property.id} with ${property.image_urls.length} images`);
    }
  }, [property]);

  if (!property) return null;

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(property.price);

  // Get current main image URL
  const currentImageUrl = property.image_urls[selectedImageIndex] || property.main_image_url || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{formattedPrice}</h2>
              <p className="text-gray-600">{property.address}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="mb-6">
            {/* Main property image or placeholder */}
            <div className="relative rounded-lg overflow-hidden h-80 w-full mb-2 bg-gray-100">
              {!mainImageError && currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`${property.property_type} in ${property.address}`}
                  className="h-full w-full object-contain"
                  onError={() => {
                    console.log(`Main image error for property ${property.id}`);
                    setMainImageError(true);
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                  <div className="text-center p-4">
                    <svg 
                      className="w-16 h-16 mx-auto mb-2 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {property.image_urls.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {property.image_urls.map((imgUrl, index) => (
                  <div 
                    key={index}
                    className={`w-20 h-20 flex-shrink-0 rounded cursor-pointer border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Property view ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700 mb-2">Property Details</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Property Type</span>
                  <span>{property.property_type}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Bedrooms</span>
                  <span>{property.bedrooms}</span>
                </li>
                {property.bathrooms && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Bathrooms</span>
                    <span>{property.bathrooms}</span>
                  </li>
                )}
                {property.tenure && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Tenure</span>
                    <span>{property.tenure}</span>
                  </li>
                )}
                {property.floor_area && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Floor Area</span>
                    <span>{property.floor_area.size} {property.floor_area.unit}</span>
                  </li>
                )}
                {property.date_listed && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Listed On</span>
                    <span>{property.date_listed}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="md:col-span-2 bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700 mb-2">Property Features</h3>
              {property.features && property.features.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {property.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No features listed</p>
              )}
            </div>
          </div>

          {/* Investment Analysis Section */}
          {investmentAnalysis && (
            <div className="mb-6 bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-700 mb-2">Investment Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Estimated Rent</div>
                  <div className="text-lg font-semibold">£{investmentAnalysis.estimatedRent}/mo</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Rental Yield</div>
                  <div className="text-lg font-semibold">{investmentAnalysis.rentalYield}%</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Monthly Cash Flow</div>
                  <div className="text-lg font-semibold">£{investmentAnalysis.cashFlow}</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Break Even</div>
                  <div className="text-lg font-semibold">{investmentAnalysis.breakEvenPoint} years</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">{investmentAnalysis.commentary}</div>
            </div>
          )}

          {/* Sale History Section */}
          {saleHistoryData && saleHistoryData.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Sale History</h3>
              <div className="bg-gray-50 p-4 rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleHistoryData.map((sale, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2">{sale.date}</td>
                        <td className="py-2">£{sale.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Area Insights Section */}
          {areaInsights && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Area Insights</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Average Price</div>
                    <div className="font-medium">£{areaInsights.averagePrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">1 Year Growth</div>
                    <div className="font-medium">{areaInsights.priceGrowth1Year}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">5 Year Growth</div>
                    <div className="font-medium">{areaInsights.priceGrowth5Years}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Schools Rating</div>
                    <div className="font-medium">{areaInsights.schoolsRating}/10</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Transport Rating</div>
                    <div className="font-medium">{areaInsights.transportRating}/10</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Crime Rate</div>
                    <div className="font-medium">{areaInsights.crimeRate}/100</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">{property.description}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded flex items-center justify-between mb-6">
            <div className="flex items-center">
              {property.agent.logo_url && (
                <img 
                  src={property.agent.logo_url} 
                  alt={property.agent.name} 
                  className="h-10 mr-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-700">{property.agent.name}</h3>
                {property.agent.phone && (
                  <p className="text-gray-500 text-sm">{property.agent.phone}</p>
                )}
              </div>
            </div>
            <a
              href={property.rightmove_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              View on Rightmove
            </a>
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
  ({ property, onClick }: PropertyCardProps) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    useEffect(() => {
      // Reset states when property changes
      setImageError(false);
      setImageLoaded(false);
    }, [property.id]);
    
    // Log image details for debugging
    useEffect(() => {
      console.log(`Property Card ${property.id} - Image Details:`, {
        mainImageUrl: property.main_image_url,
        hasAdditionalImages: property.image_urls?.length > 0,
        imageCount: property.image_urls?.length || 0,
        firstFewImages: property.image_urls?.slice(0, 3) || []
      });
    }, [property]);

    const handleImageError = () => {
      console.log(`Image error for property ${property.id}`, {
        mainImageUrl: property.main_image_url,
        tryingAlternative: !imageError && property.image_urls?.length > 0
      });
      
      setImageError(true);
    };

    const handleImageLoad = () => {
      console.log(`Image loaded successfully for property ${property.id}`);
      setImageLoaded(true);
    };
    
    // Determine which image to use
    let imageToUse = property.main_image_url;
    
    // If main image errored, try first image from image_urls array (if different)
    if (imageError && property.image_urls?.length > 0 && property.image_urls[0] !== property.main_image_url) {
      imageToUse = property.image_urls[0];
    }
    
    // Define a valid image URL check
    const isValidImage = (url?: string): boolean => {
      return !!url && url.trim() !== '' && url.startsWith('http');
    };
    
    return (
      <div 
        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        onClick={() => onClick(property)}
      >
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {isValidImage(imageToUse) ? (
            <img
              src={imageToUse}
              alt={property.address}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
              <div className="text-center px-4">
                <p className="text-sm font-medium">No image available</p>
                <p className="text-xs mt-1">Images: {property.image_urls?.length || 0}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white font-bold text-lg">{formatPrice(property.price)}</p>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1">{property.address}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {property.bedrooms} {property.bedrooms === 1 ? "bed" : "beds"} • 
            {property.bathrooms ? ` ${property.bathrooms} ${property.bathrooms === 1 ? "bath" : "baths"} • ` : " "}
            {property.property_type}
          </p>
          <p className="text-xs text-gray-500 mt-1">{property.agent.name}</p>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => prevProps.property.id === nextProps.property.id
);

// Add this function before where it's used (before line 539)
// A good place would be with other utility functions, around line 600-650

  // Format price with currency symbol and separators
  const formatPrice = (price: number): string => {
    if (!price) return '£0';
    return `£${price.toLocaleString('en-GB')}`;
  };

// Add debug function to examine dataset structure and image fields
const debugPropertyImagesInDataset = async () => {
  try {
    console.log('🔍 DEBUGGING PROPERTY IMAGES IN DATASET');
    
    // Try multiple possible paths for the dataset file
    const possiblePaths = [
      '/src/lib/apifydataset.json',
      '/apifydataset.json',
      'apifydataset.json',
      './apifydataset.json'
    ];
    
    let dataset: any[] = [];
    let loadedFromPath = '';
    
    // Load the dataset
    for (const path of possiblePaths) {
      try {
        console.log(`Trying to load dataset from ${path}`);
        const response = await fetch(path);
        
        if (response.ok) {
          dataset = await response.json();
          console.log(`✅ Successfully loaded dataset from ${path} with ${dataset.length} items`);
          loadedFromPath = path;
          break;
        }
      } catch (pathError) {
        console.log(`❌ Error loading from ${path}:`, pathError);
      }
    }
    
    if (dataset.length === 0) {
      console.error('❌ Could not load dataset from any path');
      toast({
        title: "Debug Error",
        description: "Could not load the dataset file. Check console for details.",
        variant: "destructive",
      });
      return;
    }
    
    // Log all property IDs in dataset
    console.log('PROPERTY IDs IN DATASET:');
    const allIds = dataset.map(item => item.id || 'NO_ID').filter(Boolean);
    console.log(allIds);
    
    // Analyze image structure in first 3 properties
    console.log('\n📸 ANALYZING IMAGE STRUCTURE IN FIRST 3 PROPERTIES:');
    
    const imageFields = new Map<string, number>();
    const nestedImageFields = new Map<string, number>();
    
    // Define potential image field names
    const potentialImageFields = [
      'propertyImages', 'images', 'imageUrls', 'image_urls', 'mainImage',
      'photos', 'thumbnailUrl', 'thumbnailImageUrl', 'mainImageUrl', 'mainImage'
    ];
    
    // Investigate first 3 properties in detail
    for (let i = 0; i < Math.min(3, dataset.length); i++) {
      const item = dataset[i];
      console.log(`\n🏠 PROPERTY ${i+1} (ID: ${item.id || 'unknown'}):`);
      
      // Log all top-level keys
      console.log('All top-level keys:', Object.keys(item));
      
      // Check for common image fields
      const potentialImageFields = [
        'propertyImages', 'images', 'imageUrls', 'image_urls', 'mainImage',
        'photos', 'thumbnailUrl', 'thumbnailImageUrl', 'mainImageUrl'
      ];
      
      console.log('CHECKING POTENTIAL IMAGE FIELDS:');
      for (const field of potentialImageFields) {
        if (item[field]) {
          console.log(`Field '${field}' exists:`, item[field]);
          imageFields.set(field, (imageFields.get(field) || 0) + 1);
        }
      }
      
      // Check for fields that might contain image URLs as strings
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'string' && 
            (value.includes('.jpg') || value.includes('.jpeg') || 
             value.includes('.png') || value.includes('/images/'))) {
          console.log(`Potential image URL in field '${key}':`, value);
          imageFields.set(key, (imageFields.get(key) || 0) + 1);
        }
      });
      
      // Look for nested objects that might contain images
      Object.entries(item).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value as Record<string, any>).forEach(([nestedKey, nestedValue]) => {
            if (
              (nestedKey.includes('image') || nestedKey.includes('photo')) ||
              (typeof nestedValue === 'string' && 
               (nestedValue.includes('.jpg') || nestedValue.includes('.jpeg') || 
                nestedValue.includes('.png') || nestedValue.includes('/images/')))
            ) {
              console.log(`Nested image field: ${key}.${nestedKey}:`, nestedValue);
              nestedImageFields.set(`${key}.${nestedKey}`, (nestedImageFields.get(`${key}.${nestedKey}`) || 0) + 1);
            }
          });
        }
      });
    }
    
    // Log summarized statistics
    console.log('\n📊 IMAGE FIELD STATISTICS:');
    console.log('Direct image fields:');
    Array.from(imageFields.entries()).forEach(([field, count]) => {
      console.log(`- ${field}: found in ${count}/${Math.min(3, dataset.length)} properties`);
    });
    
    console.log('Nested image fields:');
    Array.from(nestedImageFields.entries()).forEach(([field, count]) => {
      console.log(`- ${field}: found in ${count}/${Math.min(3, dataset.length)} properties`);
    });
    
    // Look specifically for the property with ID 97829235 (from user's report)
    console.log('\n🔍 SEARCHING FOR SPECIFIC PROPERTY ID: 97829235');
    const specificProperty = dataset.find(item => item.id === 97829235 || item.id === '97829235');
    
    if (specificProperty) {
      console.log('FOUND PROPERTY WITH ID 97829235:');
      console.log(JSON.stringify(specificProperty, null, 2));
      
      // Log image fields separately for clarity
      console.log('\nPOTENTIAL IMAGE FIELDS IN THIS PROPERTY:');
      for (const field of potentialImageFields) {
        if (specificProperty[field]) {
          console.log(`Field '${field}':`, specificProperty[field]);
        }
      }
    } else {
      console.log('❌ Property with ID 97829235 not found in dataset');
    }
    
    // General dataset statistics
    console.log('\n📊 DATASET STATISTICS:');
    console.log(`- Total properties: ${dataset.length}`);
    
    toast({
      title: "Debug Complete",
      description: "Check the console for detailed image structure analysis",
      variant: "default",
    });
    
  } catch (error) {
    console.error('Error debugging property images:', error);
        toast({
      title: "Debug Error",
      description: `Error analyzing dataset: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
    });
  }
};

export default function Listings() {
  
  // State variables need to be properly defined
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
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
  const [, setTotalPages] = React.useState(1);
  const [, setTotalResults] = React.useState(0);
  const [] = React.useState<"grid" | "list">("grid");
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
  const [, setDebugMode] = React.useState(import.meta.env.DEV);
  const [cacheBust] = React.useState(false);
  const [searchTerm] = React.useState('');


  const mockSaleHistory = (propertyId?: string): PropertySaleHistory[] => {
    // You can use propertyId to generate consistent mock data if needed
    const seed = propertyId ? propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random();
    
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

  // Update the handleSearch function to accept either FormEvent or a string location
  const handleSearch = async (eventOrLocation: FormEvent | string) => {
    // Prevent form submission if this is an event
    if (typeof eventOrLocation !== 'string') {
      eventOrLocation.preventDefault();
    }
    
    // Get the location from either the event or the string
    const searchLocation = typeof eventOrLocation === 'string' ? eventOrLocation : location;
    
    if (!searchLocation) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search for properties",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    setProperties([]);
    
    try {
      const startTime = Date.now();
      
        toast({
        title: "Searching",
        description: `Searching for properties in ${searchLocation}...`,
        variant: "default",
      });
      
      // Basic search functionality
      const filters: SearchFilters = {
        location: searchLocation,
        minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
        minBeds: minBeds ? parseInt(minBeds, 10) : undefined,
        maxBeds: maxBeds ? parseInt(maxBeds, 10) : undefined,
        propertyType: propertyType || undefined,
        page
      };
      
      console.log('Search filters:', filters);
      
      // Determine if we're in a local dev environment
      const isLocalDev = import.meta.env.DEV;
      setIsMockData(isLocalDev);
      
      if (isLocalDev) {
        console.log('Development mode: Using mock or dataset data');
      }
      
      // Search for properties
      const result = await searchRightmoveProperties(filters);
      
      const endTime = Date.now();
      const searchDuration = endTime - startTime;
      
      console.log(`Search completed in ${searchDuration}ms, found ${result.properties.length} properties`);
      
      // Update UI with results
      setProperties(result.properties);
      setTotalPages(result.totalPages);
      setTotalResults(result.properties.length);
      
      // Update search details for debug panel
      const searchDetails: SearchDetails = {
        originalLocation: searchLocation,
        formattedLocation: `${searchLocation} (${result.properties.length} properties)`,
        isOutcode: searchLocation.match(/^[A-Z]{1,2}[0-9]{1,2}$/i) !== null,
        timestamp: new Date().toISOString(),
        searchDurationMs: searchDuration,
        propertiesFound: result.properties.length
      };
      
      setSearchDetails(searchDetails);
      
      if (result.properties.length > 0) {
            toast({
          title: "Search Completed",
          description: `Found ${result.properties.length} properties in ${searchLocation}`,
              variant: "default",
        });
        
        // Start analyzing properties for investment potential
        if (typeof analyzePropertiesInBatches === 'function') {
          analyzePropertiesInBatches(result.properties.slice(0, 10));
        }
      } else {
        console.warn(`No properties found in ${searchLocation}`);
        setError(`No properties found in ${searchLocation}. Please try a different location or search criteria.`);
        toast({
          title: "No Properties Found",
          description: `No properties found in ${searchLocation}. Please try a different location or search criteria.`,
          variant: "destructive",
            });
          }
        } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setError(errorMessage);
      
          toast({
        title: "Search Failed",
        description: errorMessage,
            variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fix the loadDatasetFile function
  const loadDatasetFile = async () => {
    try {
      console.log('Loading dataset file...');
      // Try multiple possible paths
      const possiblePaths = [
        '/src/lib/apifydataset.json',
        '/apifydataset.json',
        'apifydataset.json',
        './apifydataset.json'
      ];
      
      let loadedDataset: any[] | null = null;
      let loadedFromPath = '';
      
      // Try each path until we find the file
      for (const path of possiblePaths) {
        try {
          console.log(`Attempting to load dataset from ${path}`);
          const response = await fetch(path);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Successfully loaded dataset from ${path} with ${data.length} items`);
            loadedDataset = data;
            loadedFromPath = path;
            break;
          }
        } catch (pathError) {
          console.log(`Error loading from ${path}:`, pathError);
        }
      }
      
      if (!loadedDataset) {
        console.error('Could not load dataset from any path');
        setSearchDetails({
          originalLocation: 'Unknown',
          formattedLocation: 'Error loading dataset',
          isOutcode: false,
          timestamp: new Date().toISOString(),
          propertiesFound: 0,
          searchDurationMs: 0,
        });
        return;
      }
      
      console.log(`Loaded ${loadedDataset.length} properties from ${loadedFromPath}`);
      
      // Process the dataset
      const convertedProperties = loadedDataset.map(item => 
        convertApifyPropertyToRightmoveProperty(item)
      );
      
      console.log(`Converted ${convertedProperties.length} properties from dataset`);
      
      // Collect statistics on images
      let propertiesWithMainImage = 0;
      let propertiesWithAnyImages = 0;
      let totalImageCount = 0;
      
      convertedProperties.forEach(property => {
        if (property.main_image_url) propertiesWithMainImage++;
        if (property.image_urls.length > 0) propertiesWithAnyImages++;
        totalImageCount += property.image_urls.length;
      });
      
      console.log('IMAGE STATISTICS:');
      console.log(`- Properties with main image: ${propertiesWithMainImage}/${convertedProperties.length} (${Math.round(propertiesWithMainImage/convertedProperties.length*100)}%)`);
      console.log(`- Properties with any images: ${propertiesWithAnyImages}/${convertedProperties.length} (${Math.round(propertiesWithAnyImages/convertedProperties.length*100)}%)`);
      console.log(`- Average images per property: ${(totalImageCount/convertedProperties.length).toFixed(2)}`);
      console.log(`- Total images across all properties: ${totalImageCount}`);
      
      // Log a sample of properties with and without images
      if (convertedProperties.length > 0) {
        const sampleWithImages = convertedProperties.find(p => p.image_urls.length > 0);
        const sampleWithoutImages = convertedProperties.find(p => p.image_urls.length === 0);
        
        if (sampleWithImages) {
          console.log('SAMPLE PROPERTY WITH IMAGES:');
          console.log({
            id: sampleWithImages.id,
            address: sampleWithImages.address,
            imageCount: sampleWithImages.image_urls.length,
            mainImage: sampleWithImages.main_image_url,
            firstFewImages: sampleWithImages.image_urls.slice(0, 3)
          });
        }
        
        if (sampleWithoutImages) {
          console.log('SAMPLE PROPERTY WITHOUT IMAGES:');
          console.log({
            id: sampleWithoutImages.id,
            address: sampleWithoutImages.address,
            agent: sampleWithoutImages.agent
          });
        }
      }
      
      setProperties(convertedProperties);
      // Remove the reference to setFilteredProperties as it's not defined
      
      // Update search details
      setSearchDetails({
        originalLocation: 'Sample Dataset',
        formattedLocation: 'From dataset file',
        isOutcode: false,
        timestamp: new Date().toISOString(),
        propertiesFound: convertedProperties.length,
        searchDurationMs: 0,
        zeroPriceCount: convertedProperties.filter(p => p.price === 0).length,
        missingAddressCount: convertedProperties.filter(p => !p.address).length
      });
      
      toast({
        title: "Dataset Loaded",
        description: `Loaded ${convertedProperties.length} properties from dataset file`,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dataset file:', error);
      toast({
        title: "Error",
        description: `Failed to load dataset: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Fix the useEffect hooks that call handleSearch with a string
  React.useEffect(() => {
    if (page > 1 && location) {
      handleSearch(location);
    }
  }, [page, location]);

  React.useEffect(() => {
    setLocation(searchTerm);
    if (searchTerm) {
      handleSearch(searchTerm);
    }
  }, [searchTerm]);

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
        const { error, count } = await supabase
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
        title: "Failed to run database diagnostics",
        description: "See console for details.",
        variant: "destructive",
      });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  // Add a function to get or generate property analysis
  const getPropertyAnalysis = async (property: RightmoveProperty) => {
    try {
      console.log(`Getting investment analysis for property: ${property.id}`);
      
      // Check if we're in development mode to avoid making unnecessary API calls
      if (import.meta.env.DEV) {
        console.log('Development mode: Using mock investment analysis data');
        return mockInvestmentAnalysis(property);
      }
      
      // Check if we have a cached analysis
      const cacheKey = `property_analysis_${property.id}`;
      const cachedAnalysis = localStorage.getItem(cacheKey);
      
      if (cachedAnalysis) {
        console.log('Using cached analysis data');
        return JSON.parse(cachedAnalysis);
      }
      
      // If API keys are not available, return mock data
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.warn('No Gemini API key found. Using mock data instead.');
        return mockInvestmentAnalysis(property);
      }
      
      // Prepare the property data for the analysis request
      const propertyData = {
        id: property.id,
        address: property.address,
        postcode: property.postcode,
        price: property.price,
        property_type: property.property_type,
        bedrooms: property.bedrooms,
        description: property.description,
      };
      
      console.log('Sending property data to Gemini API for analysis:', propertyData);
      
      // Updated API URL and error handling for Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent`;
      
      const response = await fetch(`${endpoint}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this property as an investment: ${JSON.stringify(propertyData)}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        
        // Log details for troubleshooting
        console.error(`Gemini API request failed with status ${response.status}: ${response.statusText}`);
        console.error('Check your API key and endpoint URL');
        
        toast({
          title: "Analysis Failed",
          description: "Could not get investment analysis. Using estimated data instead.",
          variant: "destructive"
        });
        
        return mockInvestmentAnalysis(property);
      }
      
      const data = await response.json();
      console.log('Received response from Gemini API:', data);
      
      // Extract the analysis from the response
      let analysis: PropertyInvestmentAnalysis;
      
      try {
        // Try to parse the analysis from the response text
        const analysisText = data.candidates[0].content.parts[0].text;
        
        // Check if the response contains JSON data
        if (analysisText.includes('{') && analysisText.includes('}')) {
          // Extract JSON part from the text
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
      } else {
            throw new Error('Could not extract JSON from response');
          }
        } else {
          // If response is not in JSON format, create a basic analysis
          analysis = {
            estimatedRent: Math.round(property.price * 0.005), // 0.5% of property price
            rentalYield: 5.0, // Default yield
            cashFlow: 200,
            capRate: 4.5,
            roiFirstYear: 7.2,
            breakEvenPoint: 15,
            suggestedOfferPrice: Math.round(property.price * 0.95),
            commentary: analysisText || "Analysis generated based on property details."
          };
        }
      } catch (error) {
        console.error('Error extracting analysis from API response:', error);
        analysis = mockInvestmentAnalysis(property);
      }
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(analysis));
      
      return analysis;
    } catch (error) {
      console.error('Error getting property analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Could not complete investment analysis. Using estimated data.",
        variant: "destructive"
      });
      
      return mockInvestmentAnalysis(property);
    }
  };

  // Modify the function that handles property selection
  const handlePropertySelect = async (property: RightmoveProperty) => {
    if (!property || !property.id) {
      console.error('Cannot select property: Invalid property data', property);
      return;
    }
    
    // Log the property data for debugging the image issue
    console.log('Selected property:', property);
    console.log('Property images:', {
      mainImage: property.main_image_url,
      allImages: property.image_urls,
      agent: property.agent
    });
    
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
      // Use the correct toast format
      toast({
        title: "Selection Error",
        description: `Error selecting property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
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

  // Move the analyzePropertiesInBatches function up
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

  // Single implementation of analyzeProperties
  const analyzeProperties = (properties: RightmoveProperty[]) => {
    console.log(`Analyzing ${properties.length} properties...`);
    analyzePropertiesInBatches(properties);
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

  // Add a helper function to validate image URLs
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    // Basic URL validation
    return url.startsWith('http') && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp') || url.includes('rightmove.co.uk'));
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
            <div className="w-full flex justify-end gap-2 mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-xs"
              >
                {showDebugPanel ? "Hide Debug Panel" : "Show Debug Panel"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={debugPropertyImagesInDataset}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
              >
                Debug Images
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  try {
                    setLoading(true);
                    setSearchError(null);
                    
                    // Try multiple possible paths for the dataset file
                    const possiblePaths = [
                      '/src/lib/apifydataset.json',
                      '/apifydataset.json',
                      'apifydataset.json',
                      './apifydataset.json'
                    ];
                    
                    let data = null;
                    let successPath = '';
                    
                    for (const path of possiblePaths) {
                      try {
                        console.log(`Trying to load dataset from ${path}...`);
                        const response = await fetch(path);
                        if (response.ok) {
                          data = await response.json();
                          successPath = path;
                          console.log(`Successfully loaded dataset from ${path}`);
                          break;
                        }
                      } catch (e) {
                        console.log(`Failed to load from ${path}:`, e);
                      }
                    }
                    
                    if (!data) {
                      throw new Error("Could not load dataset file from any location");
                    }
                    
                    console.log(`Loaded ${data.length} properties from dataset at ${successPath}`);
                    
                    // Log the first property to help debug the structure
                    if (data.length > 0) {
                      console.log('First property in dataset:', data[0]);
                    }
                    
                    // Convert the properties
                    const properties = data.map((item: any) => {
                      try {
                        return convertApifyPropertyToRightmoveProperty(item);
                      } catch (error) {
                        console.error(`Error converting property ${item.id || 'unknown'}:`, error);
                        // Return a dummy property as fallback
                        return {
                          id: item.id || String(Math.random()),
                          address: item.address || item.displayAddress || 'Address parsing error',
                          price: typeof item.price === 'number' 
                            ? item.price 
                            : typeof item.price === 'string'
                              ? parseInt(item.price.replace(/[£$,]/g, ''))
                              : 0,
                          property_type: item.propertyType || 'Unknown',
                          bedrooms: item.bedrooms || 0,
                          description: item.propertyDescription || item.description || '',
                          main_image_url: '',
                          image_urls: [],
                          postcode: '',
                          agent: {
                            name: item.agent?.name || 'Unknown Agent'
                          },
                          is_active: true,
                          rightmove_url: item.url || '',
                          new_build: false
                        };
                      }
                    });
                    
                    console.log(`Converted ${properties.length} properties from dataset`);
                    
                    // Print conversion stats to help debug
                    const validCount = properties.filter((p: RightmoveProperty) => p.price > 0).length;
                    const validAddressCount = properties.filter((p: RightmoveProperty) => p.address && p.address !== 'Address parsing error').length;
                    
                    console.log(`Conversion stats: ${validCount}/${properties.length} with valid prices, ${validAddressCount}/${properties.length} with valid addresses`);
                    
                    setProperties(properties);
                    
                    // Create search details
                    setSearchDetails({
                      originalLocation: "Dataset File",
                      formattedLocation: successPath,
                      isOutcode: false,
                      timestamp: new Date().toISOString(),
                      propertiesFound: properties.length,
                      zeroPriceCount: properties.length - validCount,
                      missingAddressCount: properties.length - validAddressCount
                    });
                    
                    toast({
                      title: "Dataset Loaded",
                      description: `Successfully loaded ${properties.length} properties from dataset file`,
                      variant: "default",
                    });
                    
                    // Force showDebugPanel to true to help diagnose issues
                    setShowDebugPanel(true);
                  } catch (error) {
                    console.error("Error loading dataset:", error);
                    setSearchError(`Failed to load dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    
                    toast({
                      title: "Error Loading Dataset",
                      description: error instanceof Error ? error.message : "Unknown error",
                      variant: "destructive",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-xs"
              >
                Load Dataset File
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
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              onClick={() => {
                if (!loading) {
                  handleSearch(location);
                }
              }} 
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
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
                // Log the first few properties to debug image issues
                console.log('First few properties:', properties.slice(0, 3).map(p => ({
                  id: p.id,
                  address: p.address,
                  mainImage: p.main_image_url,
                  hasImages: p.image_urls && p.image_urls.length > 0,
                  agentLogo: p.agent?.logo_url,
                  agentName: p.agent?.name
                })));
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <div key={property.id || Math.random().toString()}>
                        <MemoizedPropertyCard 
                          property={property}
                          onClick={() => handlePropertySelect(property)}
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