import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { Bed, Home, MapPin, Search, Calendar, PoundSterling, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AskingPrices } from '@/components/AskingPrices';
import { 
  getListedProperties, 
  getSoldProperties,
  getPriceHistory,
  getAskingPrices
} from '@/lib/patmaService';
import type { 
  ListedProperty, 
  SoldProperty, 
  PriceHistoryResponse,
  AskingPricesResponse
} from '@/lib/patmaService';

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
}

interface AreaInsights {
  askingPrices?: AskingPricesResponse;
  priceHistory?: PriceHistoryResponse;
}

export default function Listings() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [listedProperties, setListedProperties] = React.useState<ListedProperty[]>([]);
  const [soldProperties, setSoldProperties] = React.useState<SoldProperty[]>([]);
  const [areaInsights, setAreaInsights] = React.useState<AreaInsights>({});
  const [viewMode, setViewMode] = React.useState<'listed' | 'sold'>('listed');
  const [totalResults, setTotalResults] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const { toast } = useToast();

  const [filters, setFilters] = React.useState<Filters>({
    propertyType: 'any',
    tenure: 'any',
    minBeds: '0',
    radius: 1,
    page: 1,
    limit: 12,
    newBuild: false,
    maxAgeMonths: 18,
    sortBy: 'most_recent_sale_date'
  });

  const displayProperties = React.useMemo(() => {
    return viewMode === 'listed' ? listedProperties : soldProperties;
  }, [viewMode, listedProperties, soldProperties]);

  const fetchAreaInsights = async (postcode: string) => {
    try {
      const [askingPrices, priceHistory] = await Promise.all([
        getAskingPrices({
          postcode,
          property_type: filters.propertyType === 'any' ? undefined : filters.propertyType,
          bedrooms: filters.minBeds === '0' ? undefined : parseInt(filters.minBeds),
          radius: filters.radius
        }),
        getPriceHistory({
          postcode,
          property_type: filters.propertyType === 'any' ? undefined : filters.propertyType,
          max_age_months: filters.maxAgeMonths
        })
      ]);

      setAreaInsights({
        askingPrices,
        priceHistory
      });
    } catch (error) {
      console.error('Error fetching area insights:', error);
    }
  };

  // Function to get a property image from UPRN or address
  const getPropertyImageUrl = (property: any): string | null => {
    // Check if we should even attempt to use PropertyData API
    // Based on our experience, this API might not be available or require additional configuration
    const USE_PROPERTY_DATA_API = false; // Set to false to disable API calls and reduce error noise
    
    if (USE_PROPERTY_DATA_API) {
      // Get the Patma API key from environment variables
      const patmaApiKey = import.meta.env.VITE_PATMA_API_KEY;
      
      // Check if we have a UPRN - this is a unique property identifier
      if (property.uprn && patmaApiKey) {
        const uprn = property.uprn;
        console.log(`Attempting to fetch image for UPRN: ${uprn} (this may not be available)`);
        return `https://api.propertydata.app/v1/property-image?uprn=${uprn}&key=${patmaApiKey}`;
      }
      
      // Try address-based lookup
      if (property.address && property.postcode && patmaApiKey) {
        const cleanAddress = encodeURIComponent(property.address);
        const cleanPostcode = encodeURIComponent(property.postcode);
        console.log(`Attempting to fetch image for address: ${property.address} (this may not be available)`);
        return `https://api.propertydata.app/v1/property-image?address=${cleanAddress}&postcode=${cleanPostcode}&key=${patmaApiKey}`;
      }
    }
    
    // Direct lookup to listing sites if we have the IDs
    if (property.rightmove_id) {
      // Note: This would require proper rights/access from Rightmove
      return null;
    }
    
    if (property.zoopla_id) {
      // Note: This would require proper rights/access from Zoopla
      return null;
    }
    
    // Alternative approach: check for property images directly in the API response
    // This is already handled in the property processing logic
    
    return null;
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a location or postcode",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Check if the search term is a postcode (simple validation)
      const isPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(searchTerm.trim());
      
      // For area insights, we'll still try to use the search term as a postcode
      // Fetch area insights in parallel with property search
      fetchAreaInsights(searchTerm).catch(error => {
        console.error('Error fetching area insights:', error);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Could not fetch area insights. Some information may be missing.",
        });
      });

      if (viewMode === 'listed') {
        try {
          const listedResults = await getListedProperties({
            postcode: searchTerm.trim(),
            // If it doesn't look like a postcode, also pass it as a location
            location: !isPostcode ? searchTerm.trim() : undefined,
            radius: filters.radius,
            property_type: filters.propertyType === 'any' ? undefined : filters.propertyType,
            tenure: filters.tenure === 'any' ? undefined : filters.tenure,
            bedrooms: filters.minBeds === '0' ? undefined : parseInt(filters.minBeds),
            new_build: filters.newBuild || undefined,
            page: filters.page,
            page_size: filters.limit,
            sort_by: filters.sortBy,
            include_sold_history: true,
            require_sold_price: true,
            require_size: true
          });
          
          // Print the ENTIRE API response structure - this is critical to find the images
          console.log('COMPLETE API RESPONSE STRUCTURE:', JSON.stringify(listedResults, null, 2));
          
          const sampleProperty = listedResults.properties[0];
          if (sampleProperty) {
            console.log('COMPLETE SAMPLE PROPERTY STRUCTURE:', JSON.stringify(sampleProperty, null, 2));
            
            // Check for property URLs and IDs that might help find listings
            console.log('KEY PROPERTY FIELDS FOR IMAGE LOOKUP:', {
              listing_url: sampleProperty.listing_url,
              property_url: sampleProperty.property_url,
              url: sampleProperty.url,
              id: sampleProperty.id,
              rightmove_id: sampleProperty.rightmove_id,
              zoopla_id: sampleProperty.zoopla_id,
              uprn: sampleProperty.uprn,
              listing_detail_url: sampleProperty.listing_detail_url
            });
          }
          
          // Process properties to extract and normalize data
          const processedProperties = listedResults.properties.map((property: any, index: number) => {
            // Deep copy to avoid mutation issues
            let normalizedProperty = JSON.parse(JSON.stringify(property));
            
            // Ensure UPRN is available and in a consistent format
            if (property.uprn) {
              // Make sure UPRN is a string to avoid any type issues
              normalizedProperty.uprn = String(property.uprn);
              console.log(`Property ${index} has UPRN: ${normalizedProperty.uprn}`);
            }
            
            // PRICE HANDLING - use last_sold_price when available
            if (property.last_sold_price) {
              normalizedProperty.price = property.last_sold_price;
            }
            
            // IMPROVED IMAGE HANDLING STRATEGY
            
            // 1. Start with a comprehensive check of all possible image sources in the API response
            const possibleImageSources = [
              normalizedProperty.image_url,
              normalizedProperty.main_image,
              normalizedProperty.thumbnail,
              normalizedProperty.photo_url,
              normalizedProperty.rightmove_image,
              normalizedProperty.zoopla_image,
              normalizedProperty.onthemarket_image,
              // Check arrays of images
              normalizedProperty.images && normalizedProperty.images.length > 0 ? normalizedProperty.images[0] : null,
              normalizedProperty.all_images && normalizedProperty.all_images.length > 0 ? normalizedProperty.all_images[0] : null,
              normalizedProperty.photos && normalizedProperty.photos.length > 0 ? normalizedProperty.photos[0] : null
            ].filter(Boolean); // Remove null/undefined entries
            
            if (possibleImageSources.length > 0) {
              // Use the first valid image we found
              normalizedProperty.image_url = possibleImageSources[0];
              console.log(`Found image from property data for property ${normalizedProperty.uprn || index}`);
            }
            
            // 2. Look for images in sold_history if we still don't have one
            if (!normalizedProperty.image_url && property.sold_history && property.sold_history.length > 0) {
              // Sometimes the sold history entries contain more data than the main property record
              for (const entry of property.sold_history) {
                // Check if sold history has a UPRN we can use if the property doesn't have one
                if (!normalizedProperty.uprn && entry.uprn) {
                  normalizedProperty.uprn = String(entry.uprn);
                  console.log(`Found UPRN in sold history: ${normalizedProperty.uprn}`);
                }
                
                const historyImageSources = [
                  entry.image_url,
                  entry.main_image,
                  entry.thumbnail,
                  entry.photo_url,
                  // Check arrays
                  entry.images && entry.images.length > 0 ? entry.images[0] : null,
                  entry.photos && entry.photos.length > 0 ? entry.photos[0] : null
                ].filter(Boolean);
                
                if (historyImageSources.length > 0) {
                  normalizedProperty.image_url = historyImageSources[0];
                  console.log(`Found image in sold history for property ${normalizedProperty.uprn || index}`);
                  break;
                }
              }
            }
            
            // Prepare the property type for the fallback image (whether or not we have an image URL)
            const type = (normalizedProperty.property_type || '').toLowerCase();
            let category = 'house';
            
            if (type.includes('flat') || type.includes('apartment')) {
              category = 'flat';
            } else if (type.includes('terraced') || type.includes('terrace')) {
              category = 'terraced';
            } else if (type.includes('semi')) {
              category = 'semi';
            } else if (type.includes('detached')) {
              category = 'detached';
            } else if (type.includes('bungalow')) {
              category = 'bungalow';
            }
            
            // Store the category for later use in the render function
            normalizedProperty._fallback_category = category;
            
            if (!normalizedProperty.image_url) {
              // Just a note - don't display an error message since this is expected
              console.log(`No API image available for property ${normalizedProperty.uprn || index}, will use Unsplash fallback with UPRN: ${normalizedProperty.uprn || 'Not available'}`);
            }
            
            // Ensure property_type is always set
            if (!normalizedProperty.property_type && property.built_form) {
              normalizedProperty.property_type = property.built_form;
            } else if (!normalizedProperty.property_type) {
              normalizedProperty.property_type = "House";
            }
            
            return normalizedProperty;
          });

          // Add investment metrics if not provided by the API
          const propertiesWithMetrics = processedProperties.map((property: any) => 
            addInvestmentMetrics(property)
          );
          
          setListedProperties(propertiesWithMetrics);
          setTotalResults(listedResults.total);
          setTotalPages(listedResults.totalPages);
          
          if (listedResults.properties.length === 0) {
            toast({
              variant: "default",
              title: "No Results",
              description: "No listed properties found for this search criteria. Try adjusting your filters.",
            });
          }
        } catch (error) {
          console.error('Error fetching listed properties:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Could not fetch listed properties. Please check your search criteria and try again.",
          });
          setListedProperties([]);
          setTotalResults(0);
          setTotalPages(1);
        }
      } else {
        try {
          const soldResults = await getSoldProperties({
            postcode: searchTerm.trim(),
            // If it doesn't look like a postcode, also pass it as a location
            location: !isPostcode ? searchTerm.trim() : undefined,
            radius: filters.radius,
            property_type: filters.propertyType === 'any' ? 'flat' : filters.propertyType as any,
            tenure: filters.tenure === 'any' ? undefined : filters.tenure,
            max_age_months: filters.maxAgeMonths,
            min_data_points: 20,
            apply_indexation: true,
            page: filters.page,
            page_size: filters.limit
          });
          
          // Log full response structure
          console.log('Sold properties API response structure:', JSON.stringify(soldResults, null, 2).substring(0, 500) + '...');
          if (soldResults.properties && soldResults.properties.length > 0) {
            console.log('First sold property full object:', soldResults.properties[0]);
          }
          
          // Process properties to normalize data structures and fix missing fields
          const processedProperties = soldResults.properties.map((property: any) => {
            // Create a deep copy to avoid mutation issues
            let normalizedProperty = JSON.parse(JSON.stringify(property));
            
            // PRICE HANDLING
            // Check all possible price field locations
            if (!normalizedProperty.price && !normalizedProperty.sale_price) {
              if (property.details?.price) {
                normalizedProperty.price = property.details.price;
              } else if (property.price_paid) {
                normalizedProperty.sale_price = property.price_paid;
              } else if (property.sale_price) {
                normalizedProperty.sale_price = property.sale_price;
              } else if (property.latest_sold_price) {
                normalizedProperty.sale_price = property.latest_sold_price;
              } else if (typeof property.price === 'string') {
                // Sometimes price comes as a string with currency symbol
                const priceMatch = property.price.match(/[\d,]+/);
                if (priceMatch) {
                  normalizedProperty.price = parseInt(priceMatch[0].replace(/,/g, ''));
                }
              }
            }
            
            // Ensure we have a numeric price
            if (normalizedProperty.sale_price && typeof normalizedProperty.sale_price === 'string') {
              const priceMatch = normalizedProperty.sale_price.match(/[\d,]+/);
              if (priceMatch) {
                normalizedProperty.sale_price = parseInt(priceMatch[0].replace(/,/g, ''));
              }
            }

            // IMAGE HANDLING
            // Check all possible image field locations
            if (!normalizedProperty.image_url && (!normalizedProperty.images || !normalizedProperty.images.length)) {
              // Try Patma-specific image fields first
              if (property.thumbnail) {
                normalizedProperty.image_url = property.thumbnail;
              } else if (property.main_image) {
                normalizedProperty.image_url = property.main_image;
              } else if (property.photo_url) {
                normalizedProperty.image_url = property.photo_url;
              }
              // Standard fields
              else if (property.details?.images && property.details.images.length > 0) {
                normalizedProperty.images = property.details.images;
              } else if (property.photos && property.photos.length > 0) {
                normalizedProperty.images = property.photos;
              } else if (property.main_photo) {
                normalizedProperty.image_url = property.main_photo;
              } else if (property.image) {
                normalizedProperty.image_url = property.image;
              }
              
              // Check for nested image objects with URLs
              if (property.image && typeof property.image === 'object' && property.image.url) {
                normalizedProperty.image_url = property.image.url;
              }
            }
            
            return normalizedProperty;
          });
          
          // Add investment metrics if not provided by the API
          const propertiesWithMetrics = processedProperties.map((property: any) => 
            addInvestmentMetrics(property)
          );
          
          setSoldProperties(propertiesWithMetrics);
          setTotalResults(soldResults.total);
          setTotalPages(soldResults.totalPages);
          
          if (soldResults.properties.length === 0) {
            toast({
              variant: "default",
              title: "No Results",
              description: "No sold properties found for this search criteria. Try adjusting your filters.",
            });
          }
        } catch (error) {
          console.error('Error fetching sold properties:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Could not fetch sold properties. Please check your search criteria and try again.",
          });
          setSoldProperties([]);
          setTotalResults(0);
          setTotalPages(1);
        }
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to calculate investment metrics if they're not provided by the API
  const addInvestmentMetrics = <T extends ListedProperty | SoldProperty>(property: T): T => {
    const propertyWithMetrics = { ...property };
    
    // Only calculate if not already provided
    if (!propertyWithMetrics.estimated_rent) {
      // Determine the actual price from various possible fields
      const price = 
        propertyWithMetrics.price || 
        propertyWithMetrics.asking_price || 
        propertyWithMetrics.sale_price || 
        (propertyWithMetrics as any).price_paid ||
        (propertyWithMetrics as any).latest_price ||
        0;
      
      if (price > 0) {
        // Basic rent calculation (very simplified)
        // In reality, this would be based on location, property type, size, etc.
        let monthlyRentEstimate = 0;
        
        // Rough estimate based on property type and UK averages
        // Typically annual rent is 3-5% of property value
        const rentYieldFactor = 0.04; // 4% annual yield
        const annualRent = price * rentYieldFactor;
        monthlyRentEstimate = annualRent / 12;
        
        // Adjust based on bedrooms if available
        if (propertyWithMetrics.bedrooms) {
          // Slight adjustment based on number of bedrooms
          const bedroomFactor = 1 + (propertyWithMetrics.bedrooms - 2) * 0.1; // 10% per bedroom difference from 2
          monthlyRentEstimate *= Math.max(0.8, Math.min(bedroomFactor, 1.5)); // Cap between 0.8x and 1.5x
        }
        
        propertyWithMetrics.estimated_rent = Math.round(monthlyRentEstimate);
        
        // Calculate rental yield
        if (!propertyWithMetrics.rental_yield) {
          const annualRent = propertyWithMetrics.estimated_rent * 12;
          propertyWithMetrics.rental_yield = (annualRent / price) * 100;
        }
        
        // Calculate ROI (simplified)
        if (!propertyWithMetrics.roi) {
          // Assume 5-year holding period with 3% annual price appreciation
          const annualAppreciation = 0.03;
          const holdingYears = 5;
          const futureValue = price * Math.pow(1 + annualAppreciation, holdingYears);
          const totalRent = propertyWithMetrics.estimated_rent * 12 * holdingYears;
          const totalReturn = (futureValue - price) + totalRent;
          propertyWithMetrics.roi = (totalReturn / price) * 100;
        }
        
        // Estimated annual growth
        if (!propertyWithMetrics.estimated_growth) {
          // Based on historical UK property price growth
          propertyWithMetrics.estimated_growth = 3.5;
        }
      }
    }
    
    return propertyWithMetrics;
  };

  // Function to get a fallback image based on property type
  const getPropertyTypeImage = (propertyType: string): string => {
    // Convert to lowercase and handle variations
    const type = propertyType?.toLowerCase() || '';
    
    if (type.includes('flat') || type.includes('apartment')) {
      return '/images/property-types/flat.jpg';
    } else if (type.includes('terrace') || type.includes('terraced')) {
      return '/images/property-types/terraced.jpg';
    } else if (type.includes('semi') || type.includes('semi-detached')) {
      return '/images/property-types/semi-detached.jpg';
    } else if (type.includes('detached')) {
      return '/images/property-types/detached.jpg';
    } else if (type.includes('bungalow')) {
      return '/images/property-types/bungalow.jpg';
    } else if (type.includes('house')) {
      return '/images/property-types/house.jpg';
    }
    
    // Default fallback
    return '/images/property-types/house.jpg';
  };

  React.useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [viewMode, filters.page]);

  // Ensure we have a valid property type when switching to sold properties view
  React.useEffect(() => {
    if (viewMode === 'sold' && filters.propertyType === 'any') {
      setFilters(prev => ({ ...prev, propertyType: 'flat' }));
    }
  }, [viewMode, filters.propertyType]);

  // Filter handlers
  const handlePropertyTypeChange = (value: PropertyType) => {
    setFilters(prev => ({ ...prev, propertyType: value, page: 1 }));
  };

  const handleTenureChange = (value: PropertyTenure) => {
    setFilters(prev => ({ ...prev, tenure: value, page: 1 }));
  };

  const handleBedroomsChange = (value: string) => {
    setFilters(prev => ({ ...prev, minBeds: value, page: 1 }));
  };

  const handleRadiusChange = (value: string) => {
    setFilters(prev => ({ ...prev, radius: parseFloat(value), page: 1 }));
  };

  const handleSortChange = (value: typeof filters.sortBy) => {
    setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
  };

  return (
    <Layout>
      {/* Hero Section - Matching Deals page design */}
      <div className="bg-background">
        <div className="relative">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 mix-blend-multiply" />
          </div>
          <div className="relative px-4 py-24 sm:px-6 sm:py-32 lg:py-40 lg:px-8">
            <h1 className="text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Property Search
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
              Search through thousands of properties, compare market prices, and make informed decisions with our comprehensive property data.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Combined Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Find Properties</h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'listed' ? 'default' : 'outline'}
                onClick={() => setViewMode('listed')}
                className="min-w-[120px]"
              >
                Listed Properties
              </Button>
              <Button
                variant={viewMode === 'sold' ? 'default' : 'outline'}
                onClick={() => setViewMode('sold')}
                className="min-w-[120px]"
              >
                Sold Properties
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                value={filters.propertyType}
                onValueChange={handlePropertyTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {/* Only show "Any Type" for listed properties */}
                  {viewMode === 'listed' && (
                    <SelectItem value="any">Any Type</SelectItem>
                  )}
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="terraced">Terraced</SelectItem>
                  <SelectItem value="semi-detached">Semi-Detached</SelectItem>
                  <SelectItem value="detached">Detached</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tenure}
                onValueChange={handleTenureChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tenure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Tenure</SelectItem>
                  <SelectItem value="freehold">Freehold</SelectItem>
                  <SelectItem value="leasehold">Leasehold</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.minBeds}
                onValueChange={handleBedroomsChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Min Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num}+ beds</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.radius.toString()}
                onValueChange={handleRadiusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Search Radius" />
                </SelectTrigger>
                <SelectContent>
                  {[0.25, 0.5, 1, 2, 5, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num} miles</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {viewMode === 'listed' && (
                <Select
                  value={filters.sortBy}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most_recent_sale_date">Most Recent Sale</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 mt-6">
              <Input
                type="text"
                placeholder="Enter location (postcode, city, street, etc.)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-12"
              />
              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayProperties.length > 0 ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg text-gray-600">
                Found {totalResults} {viewMode === 'listed' ? 'listed' : 'sold'} properties
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProperties.map((property, index) => (
                <Card key={`${property.address}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {viewMode === 'listed' ? (
                    <>
                      <div className="aspect-video relative bg-gray-100">
                        {(() => {
                          // Display direct image if we have one
                          const imageUrl = property.image_url || 
                              (property.images && property.images.length > 0 ? property.images[0] : null) ||
                              (property.all_images && property.all_images.length > 0 ? property.all_images[0] : null);
                          
                          // Generate a unique but consistent ID for this property - prioritize UPRN
                          const propertyId = property.uprn || 
                                             (property.address ? property.address.replace(/\D/g, '') : '') || 
                                             (property.postcode ? property.postcode.replace(/\s/g, '') : '') || 
                                             index;
                                              
                          // Get property category for Unsplash image
                          const type = (property.property_type || 'house').toLowerCase();
                          let category = property._fallback_category || 'house';
                          
                          if (!category) {
                            if (type.includes('flat') || type.includes('apartment')) {
                              category = 'flat';
                            } else if (type.includes('terraced') || type.includes('terrace')) {
                              category = 'terraced';
                            } else if (type.includes('semi')) {
                              category = 'semi';
                            } else if (type.includes('detached')) {
                              category = 'detached';
                            } else if (type.includes('bungalow')) {
                              category = 'bungalow';
                            }
                          }
                          
                          // Create a reliable fallback URL using Unsplash with UPRN as the key parameter when available
                          // Use the collection of real estate properties (1118894) for more relevant property images
                          const createUnsplashFallbackUrl = () => {
                            // If we have a UPRN, use it directly in the URL
                            if (property.uprn) {
                              return `https://source.unsplash.com/collection/1118894/800x600?property=${category}&sig=${property.uprn}`;
                            }
                            
                            // Otherwise fallback to our composite ID
                            return `https://source.unsplash.com/collection/1118894/800x600?property=${category}&sig=${propertyId}`;
                          };
                          
                          // Fallback URL ready to use when needed
                          const unsplashFallbackUrl = createUnsplashFallbackUrl();
                          
                          // If we have an image URL, try to use it with fallback
                          if (imageUrl) {
                            return (
                              <img
                                src={imageUrl}
                                alt={property.address || "Property"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null; // Prevent infinite error loops
                                  
                                  // Switch to our fallback
                                  console.log(`Using Unsplash fallback for property ${property.uprn || index}`);
                                  e.currentTarget.src = unsplashFallbackUrl;
                                }}
                              />
                            );
                          } 
                          
                          // If we don't have any image, use Unsplash directly as source
                          console.log(`No image available for property ${property.uprn || index}, using Unsplash directly`);
                          return (
                            <img
                              src={unsplashFallbackUrl}
                              alt={property.address || "Property"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          );
                        })()}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <span className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium">
                            {property.property_type}
                          </span>
                          {property.new_build && (
                            <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                              New Build
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                          {property.address}
                        </h3>
                        <p className="text-2xl font-bold mb-3 text-emerald-600">
                          {formatCurrency(
                            property.price || 
                            property.asking_price || 
                            property.last_sold_price ||
                            (property as any).price_paid ||
                            (property as any).latest_price || 
                            0
                          )}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{property.postcode}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span>{property.tenure || 'N/A'}</span>
                          </div>
                        </div>
                        
                        {/* Investment Metrics */}
                        {(property.estimated_rent || property.rental_yield || property.roi) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Investment Potential</h4>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {property.estimated_rent && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-blue-800 font-medium">Est. Rent</p>
                                  <p className="text-blue-600 font-bold">{formatCurrency(property.estimated_rent)}/mo</p>
                                </div>
                              )}
                              {property.rental_yield && (
                                <div className="bg-emerald-50 p-2 rounded">
                                  <p className="text-emerald-800 font-medium">Yield</p>
                                  <p className="text-emerald-600 font-bold">{property.rental_yield.toFixed(1)}%</p>
                                </div>
                              )}
                              {property.roi && (
                                <div className="bg-purple-50 p-2 rounded">
                                  <p className="text-purple-800 font-medium">ROI</p>
                                  <p className="text-purple-600 font-bold">{property.roi.toFixed(1)}%</p>
                                </div>
                              )}
                              {property.estimated_growth && (
                                <div className="bg-amber-50 p-2 rounded">
                                  <p className="text-amber-800 font-medium">Growth</p>
                                  <p className="text-amber-600 font-bold">{property.estimated_growth.toFixed(1)}%</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                        {property.address}
                      </h3>
                      <p className="text-2xl font-bold mb-3 text-emerald-600">
                        {formatCurrency(
                          property.sale_price || 
                          property.price || 
                          (property as any).price_paid || 
                          0
                        )}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{property.postcode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          <span>{property.property_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Sold: {new Date(property.date_of_transfer).toLocaleDateString()}</span>
                        </div>
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms} beds</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Investment Metrics */}
                      {(property.estimated_rent || property.rental_yield || property.roi) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Investment Potential</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {property.estimated_rent && (
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="text-blue-800 font-medium">Est. Rent</p>
                                <p className="text-blue-600 font-bold">{formatCurrency(property.estimated_rent)}/mo</p>
                              </div>
                            )}
                            {property.rental_yield && (
                              <div className="bg-emerald-50 p-2 rounded">
                                <p className="text-emerald-800 font-medium">Yield</p>
                                <p className="text-emerald-600 font-bold">{property.rental_yield.toFixed(1)}%</p>
                              </div>
                            )}
                            {property.roi && (
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-purple-800 font-medium">ROI</p>
                                <p className="text-purple-600 font-bold">{property.roi.toFixed(1)}%</p>
                              </div>
                            )}
                            {property.estimated_growth && (
                              <div className="bg-amber-50 p-2 rounded">
                                <p className="text-amber-800 font-medium">Growth</p>
                                <p className="text-amber-600 font-bold">{property.estimated_growth.toFixed(1)}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {filters.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                  disabled={filters.page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No {viewMode} properties found. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
} 