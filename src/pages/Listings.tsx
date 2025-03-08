import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { Bed, Home, MapPin, Search, Calendar, PoundSterling, TrendingUp, X, ExternalLink, Maximize, AreaChart, ArrowUpRight, ArrowDownRight, Info, SquareIcon, Building, Key } from 'lucide-react';
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
  planningApplications?: any;
  neighborhoodData?: any;
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

  const [showPricePerSqft, setShowPricePerSqft] = React.useState(true);
  const [showStampDuty, setShowStampDuty] = React.useState(true);
  const [showPlanningApplications, setShowPlanningApplications] = React.useState(false);

  const [selectedProperty, setSelectedProperty] = React.useState<ListedProperty | SoldProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
        }),
        // Add more API calls here when we have the corresponding functions in patmaService.ts
        // For example:
        // getPlanningApplications({ postcode, radius: filters.radius }),
        // getNeighborhoodData({ postcode })
      ]);

      setAreaInsights({
        askingPrices,
        priceHistory,
        // When we implement the additional API calls:
        // planningApplications,
        // neighborhoodData
      });
    } catch (error) {
      console.error('Error fetching area insights:', error);
    }
  };

  // Function to get a property image from various potential sources
  const getPropertyImageUrl = (property: any): string | null => {
    // Check if we already have a direct image URL from the API
    if (property.image_url && typeof property.image_url === 'string' && property.image_url.trim() !== '') {
      console.log('Using direct image URL from API');
      return property.image_url;
    }
    
    // Check for image URLs in common property fields
    const possibleImageFields = [
      'main_image', 
      'photo_url', 
      'thumbnail',
      'image'
    ];
    
    for (const field of possibleImageFields) {
      if (property[field] && typeof property[field] === 'string' && property[field].trim() !== '') {
        console.log(`Found image in property.${field}`);
        return property[field];
      }
    }
    
    // Look for property-software.uk URLs in any string field
    // This approach scans all string properties for PaTMa image URLs
    for (const key in property) {
      if (typeof property[key] === 'string' && 
          property[key].includes('property-software.uk') && 
          (property[key].endsWith('.jpg') || property[key].endsWith('.jpeg') || property[key].endsWith('.png'))) {
        console.log(`Found PaTMa image URL in property.${key}`);
        return property[key];
      }
    }
    
    // Check if we have images/photos arrays
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      // Try to find a property-software.uk URL first
      const patmaImage = property.images.find((img: any) => 
        typeof img === 'string' && img.includes('property-software.uk')
      );
      
      if (patmaImage) {
        console.log('Found PaTMa image URL in images array');
        return patmaImage;
      }
      
      // Fallback to the first image
      if (typeof property.images[0] === 'string') {
        console.log('Using first image from images array');
        return property.images[0];
      }
      
      // Check if images contain objects with URLs
      if (property.images[0] && typeof property.images[0] === 'object' && property.images[0].url) {
        console.log('Using URL from first image object in images array');
        return property.images[0].url;
      }
    }
    
    // Same check for photos array
    if (property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
      const patmaPhoto = property.photos.find((img: any) => 
        typeof img === 'string' && img.includes('property-software.uk')
      );
      
      if (patmaPhoto) {
        console.log('Found PaTMa image URL in photos array');
        return patmaPhoto;
      }
      
      if (typeof property.photos[0] === 'string') {
        console.log('Using first image from photos array');
        return property.photos[0];
      }
      
      if (property.photos[0] && typeof property.photos[0] === 'object' && property.photos[0].url) {
        console.log('Using URL from first image object in photos array');
        return property.photos[0].url;
      }
    }
    
    // Check sold_history for images
    if (property.sold_history && Array.isArray(property.sold_history) && property.sold_history.length > 0) {
      for (const historyItem of property.sold_history) {
        if (!historyItem) continue;
        
        // Check for direct image fields in history item
        for (const field of possibleImageFields) {
          if (historyItem[field] && typeof historyItem[field] === 'string' && historyItem[field].trim() !== '') {
            console.log(`Found image in sold_history item.${field}`);
            return historyItem[field];
          }
        }
        
        // Check for property-software.uk URLs in any string field
        for (const key in historyItem) {
          if (typeof historyItem[key] === 'string' && 
              historyItem[key].includes('property-software.uk') && 
              (historyItem[key].endsWith('.jpg') || historyItem[key].endsWith('.jpeg') || historyItem[key].endsWith('.png'))) {
            console.log(`Found PaTMa image URL in sold_history item.${key}`);
            return historyItem[key];
          }
        }
        
        // Check arrays in history item
        if (historyItem.images && Array.isArray(historyItem.images) && historyItem.images.length > 0) {
          const patmaImage = historyItem.images.find((img: any) => 
            typeof img === 'string' && img.includes('property-software.uk')
          );
          
          if (patmaImage) {
            console.log('Found PaTMa image URL in sold_history images array');
            return patmaImage;
          }
          
          if (typeof historyItem.images[0] === 'string') {
            console.log('Using first image from sold_history images array');
            return historyItem.images[0];
          }
        }
      }
    }
    
    // If no image was found, return null
    console.log('No image found for property');
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
            
            // Ensure property ID is available in a consistent format
            if (property.uprn) {
              normalizedProperty.uprn = String(property.uprn);
            }
            
            // PRICE HANDLING - use last_sold_price when available
            if (property.last_sold_price) {
              normalizedProperty.price = property.last_sold_price;
            }
            
            // Find the best image URL for this property
            normalizedProperty.image_url = getPropertyImageUrl(property);
                        
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

            // IMAGE HANDLING - Use the same image getter for sold properties
            normalizedProperty.image_url = getPropertyImageUrl(property);
            
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
    
    // Determine the actual price from various possible fields
    const price = 
      propertyWithMetrics.price || 
      propertyWithMetrics.asking_price || 
      propertyWithMetrics.sale_price || 
      (propertyWithMetrics as any).price_paid ||
      (propertyWithMetrics as any).latest_price ||
      0;
    
    if (price > 0) {
      // Calculate stamp duty (assuming standard purchase)
      if (!propertyWithMetrics.stamp_duty) {
        propertyWithMetrics.stamp_duty = calculateStampDuty(price);
      }
      
      // Calculate price per square foot if size data is available
      if (propertyWithMetrics.size_sq_meters && !propertyWithMetrics.price_per_sqft) {
        propertyWithMetrics.price_per_sqft = calculatePricePerSqft(price, propertyWithMetrics.size_sq_meters, true);
      } else if (propertyWithMetrics.size_sq_feet && !propertyWithMetrics.price_per_sqft) {
        propertyWithMetrics.price_per_sqft = calculatePricePerSqft(price, propertyWithMetrics.size_sq_feet, false);
      }
      
      // Only calculate rent estimates if not already provided
      if (!propertyWithMetrics.estimated_rent) {
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

  // Add a function to calculate stamp duty
  const calculateStampDuty = (price: number, isBuyToLet: boolean = false, isFirstTimeBuyer: boolean = false) => {
    // UK Stamp Duty rates as of 2023
    if (price <= 0) return 0;
    
    let stampDuty = 0;
    
    if (isFirstTimeBuyer) {
      // First-time buyer rates
      if (price <= 425000) {
        stampDuty = 0;
      } else if (price <= 625000) {
        stampDuty = (price - 425000) * 0.05;
      } else {
        // First-time buyers purchasing property over £625,000 don't get relief
        isFirstTimeBuyer = false;
      }
    }
    
    if (!isFirstTimeBuyer) {
      // Standard rates
      if (price <= 250000) {
        stampDuty = 0;
      } else if (price <= 925000) {
        stampDuty = (price - 250000) * 0.05;
      } else if (price <= 1500000) {
        stampDuty = (price - 925000) * 0.1 + (925000 - 250000) * 0.05;
      } else {
        stampDuty = (price - 1500000) * 0.12 + (1500000 - 925000) * 0.1 + (925000 - 250000) * 0.05;
      }
    }
    
    // Additional rate for buy-to-let/second homes
    if (isBuyToLet) {
      stampDuty += price * 0.03;
    }
    
    return Math.round(stampDuty);
  };
  
  // Add a utility function to calculate price per square foot/meter
  const calculatePricePerSqft = (price: number, size: number, isMetric: boolean = false) => {
    if (!price || !size || size <= 0) return null;
    
    if (isMetric) {
      // Price per square meter
      return Math.round(price / size);
    } else {
      // Price per square foot (convert from square meters if necessary)
      const sizeInSqft = isMetric ? size * 10.764 : size;
      return Math.round(price / sizeInSqft);
    }
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

  // Function to open the property modal
  const openPropertyModal = (property: ListedProperty | SoldProperty) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  // Function to close the property modal
  const closePropertyModal = () => {
    setIsModalOpen(false);
    // Keep the property data for a moment to avoid UI jumps during the closing animation
    setTimeout(() => setSelectedProperty(null), 300);
  };

  // Add a property details modal component
  const PropertyModal = () => {
    if (!selectedProperty) return null;
    
    const price = 
      selectedProperty.price || 
      selectedProperty.asking_price || 
      selectedProperty.sale_price || 
      (selectedProperty as any).price_paid ||
      (selectedProperty as any).latest_price || 
      0;
      
    const isSoldProperty = 'date_of_transfer' in selectedProperty;
    const isListedProperty = !isSoldProperty;
    
    // Just use the image URL from the property, no fallbacks
    const imageUrl = selectedProperty.image_url;
    
    // Format postcode with fallback
    const displayPostcode = selectedProperty.postcode || 
                          (selectedProperty.address && selectedProperty.address.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i)?.[0]) || 
                          "Not Available";
    
    // Extract sale history data for chart
    const hasSaleHistory = selectedProperty.sold_history && selectedProperty.sold_history.length > 0;
    const saleHistoryData = hasSaleHistory 
      ? selectedProperty.sold_history
          .filter((sale: any) => sale && sale.date && !isNaN(new Date(sale.date).getTime()) && sale.price && !isNaN(parseFloat(String(sale.price))))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];
    
    // Calculate price growth percentage if multiple sales
    const priceGrowth = saleHistoryData.length >= 2 
      ? ((saleHistoryData[saleHistoryData.length - 1].price - saleHistoryData[0].price) / saleHistoryData[0].price) * 100
      : null;
    
    // Simple mortgage calculation (very basic)
    const calculateMortgage = (propertyPrice: number, downPaymentPercent: number = 25, interestRate: number = 4.5, termYears: number = 25) => {
      const downPayment = propertyPrice * (downPaymentPercent / 100);
      const loanAmount = propertyPrice - downPayment;
      const monthlyInterest = interestRate / 100 / 12;
      const totalPayments = termYears * 12;
      
      const monthlyPayment = loanAmount * (
        monthlyInterest * Math.pow(1 + monthlyInterest, totalPayments)
      ) / (
        Math.pow(1 + monthlyInterest, totalPayments) - 1
      );
      
      return {
        downPayment,
        loanAmount,
        monthlyPayment,
        totalPayments,
        totalRepayment: monthlyPayment * totalPayments
      };
    };
    
    // Only calculate if we have a valid price
    const mortgageDetails = price > 0 ? calculateMortgage(price) : null;
    
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
        {/* Modal backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={closePropertyModal} />
        
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Close button */}
          <button 
            onClick={closePropertyModal}
            className="absolute top-4 right-4 z-10 bg-white/80 p-1 rounded-full hover:bg-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Property image(s) */}
            <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-gray-100">
              {imageUrl ? (
                <img 
                  src={imageUrl}
                  alt={selectedProperty.address || "Property"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="h-16 w-16 text-gray-300" />
                  <p className="text-gray-400 text-sm mt-2">No image available</p>
                </div>
              )}
              
              {/* Property type badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium">
                  {selectedProperty.property_type}
                </span>
              </div>
              
              {/* External link if available */}
              {selectedProperty.listing_url && (
                <a 
                  href={selectedProperty.listing_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-4 left-4 bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Listing
                </a>
              )}
            </div>
            
            {/* Property details */}
            <div className="w-full md:w-3/5 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-2">{selectedProperty.address}</h2>
              <p className="text-3xl font-bold mb-4 text-emerald-600">
                {formatCurrency(price)}
              </p>
              
              {/* Key property details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Property Type</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Building className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{selectedProperty.property_type || 'N/A'}</span>
                  </div>
                </div>
                
                {selectedProperty.bedrooms && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Bedrooms</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Bed className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{selectedProperty.bedrooms}</span>
                    </div>
                  </div>
                )}
                
                {selectedProperty.bathrooms && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Bathrooms</span>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-4 w-4 text-gray-600 flex items-center justify-center">🛁</div>
                      <span className="font-medium">{selectedProperty.bathrooms}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Postcode</span>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{displayPostcode}</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Tenure</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Key className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{selectedProperty.tenure || 'N/A'}</span>
                  </div>
                </div>
                
                {isSoldProperty && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Sold Date</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">
                        {new Date((selectedProperty as SoldProperty).date_of_transfer).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                
                {(selectedProperty.size_sq_feet || selectedProperty.size_sq_meters) && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Size</span>
                    <div className="flex items-center gap-1 mt-1">
                      <SquareIcon className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">
                        {selectedProperty.size_sq_feet ? `${selectedProperty.size_sq_feet} sq.ft` : ''}
                        {selectedProperty.size_sq_meters ? `${selectedProperty.size_sq_meters} m²` : ''}
                      </span>
                    </div>
                  </div>
                )}
                
                {selectedProperty.price_per_sqft && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Price per sq.ft</span>
                    <div className="flex items-center gap-1 mt-1">
                      <PoundSterling className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{formatCurrency(selectedProperty.price_per_sqft)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Investment dashboard section */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                  Investment Dashboard
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ROI and Yield Section */}
                  <div className="space-y-4">
                    {selectedProperty.estimated_rent && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-blue-800 text-sm font-medium">Estimated Monthly Rent</p>
                        <p className="text-blue-600 text-lg font-bold mt-1">
                          {formatCurrency(selectedProperty.estimated_rent)}/month
                        </p>
                        {selectedProperty.rental_yield && (
                          <p className="text-blue-600 text-sm mt-1">
                            {selectedProperty.rental_yield.toFixed(1)}% yield
                          </p>
                        )}
                      </div>
                    )}
                    
                    {selectedProperty.roi && (
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-purple-800 text-sm font-medium">5-Year ROI Estimate</p>
                        <p className="text-purple-600 text-lg font-bold mt-1">
                          {selectedProperty.roi.toFixed(1)}%
                        </p>
                        {selectedProperty.estimated_growth && (
                          <p className="text-purple-600 text-sm mt-1">
                            {selectedProperty.estimated_growth.toFixed(1)}% annual growth
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Mortgage Calculator Section */}
                  {mortgageDetails && (
                    <div className="bg-emerald-50 p-3 rounded">
                      <p className="text-emerald-800 text-sm font-medium">Mortgage Estimate (25% deposit)</p>
                      <p className="text-emerald-600 text-lg font-bold mt-1">
                        {formatCurrency(mortgageDetails.monthlyPayment)}/month
                      </p>
                      <div className="mt-2 text-sm text-emerald-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Deposit (25%):</span>
                          <span>{formatCurrency(mortgageDetails.downPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loan amount:</span>
                          <span>{formatCurrency(mortgageDetails.loanAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Term:</span>
                          <span>25 years at 4.5%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Cash Flow Analysis */}
                {selectedProperty.estimated_rent && mortgageDetails && (
                  <div className="mt-4 bg-white p-3 rounded border border-gray-100">
                    <p className="text-gray-800 text-sm font-medium">Monthly Cash Flow Analysis</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Rental Income:</span>
                        <span className="text-emerald-600">+{formatCurrency(selectedProperty.estimated_rent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mortgage Payment:</span>
                        <span className="text-red-600">-{formatCurrency(mortgageDetails.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Management (10%):</span>
                        <span className="text-red-600">-{formatCurrency(selectedProperty.estimated_rent * 0.1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance (5%):</span>
                        <span className="text-red-600">-{formatCurrency(selectedProperty.estimated_rent * 0.05)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-gray-100 mt-2">
                        <span>Net Cash Flow:</span>
                        <span className={`${selectedProperty.estimated_rent - mortgageDetails.monthlyPayment - selectedProperty.estimated_rent * 0.15 > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(selectedProperty.estimated_rent - mortgageDetails.monthlyPayment - selectedProperty.estimated_rent * 0.15)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Purchase costs breakdown */}
              {selectedProperty.stamp_duty !== undefined && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Purchase Costs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-amber-50 p-3 rounded">
                      <p className="text-amber-800 text-sm font-medium">Stamp Duty</p>
                      <p className="text-amber-600 text-lg font-bold mt-1">
                        {formatCurrency(selectedProperty.stamp_duty)}
                      </p>
                      <p className="text-amber-700 text-xs mt-2">
                        First-time buyer? You may qualify for lower rates.
                      </p>
                    </div>
                    
                    <div className="bg-emerald-50 p-3 rounded">
                      <p className="text-emerald-800 text-sm font-medium">Total Purchase Cost</p>
                      <p className="text-emerald-600 text-lg font-bold mt-1">
                        {formatCurrency(price + (selectedProperty.stamp_duty || 0))}
                      </p>
                      <div className="mt-2 text-sm text-emerald-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Property price:</span>
                          <span>{formatCurrency(price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stamp duty:</span>
                          <span>{formatCurrency(selectedProperty.stamp_duty || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Legal fees (est.):</span>
                          <span>{formatCurrency(1500)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Area insights with visualization */}
              {areaInsights.priceHistory?.data?.trend_percentage !== undefined && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <AreaChart className="h-5 w-5 mr-2 text-blue-600" />
                    Area Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cyan-50 p-3 rounded">
                      <p className="text-cyan-800 text-sm font-medium">Area Price Trend</p>
                      <div className="flex items-center gap-1 mt-1">
                        {areaInsights.priceHistory.data.trend_percentage > 0 ? (
                          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                        <p className={`text-lg font-bold ${areaInsights.priceHistory.data.trend_percentage > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {areaInsights.priceHistory.data.trend_percentage.toFixed(1)}%
                        </p>
                      </div>
                      <p className="text-cyan-600 text-sm mt-1">Last 12 months</p>
                      
                      {/* Add simple visual trend indicator */}
                      <div className="mt-3 h-10 bg-white rounded overflow-hidden">
                        <div 
                          className={`h-full ${areaInsights.priceHistory.data.trend_percentage > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(areaInsights.priceHistory.data.trend_percentage) * 3, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {areaInsights.askingPrices?.data?.mean && (
                      <div className="bg-teal-50 p-3 rounded">
                        <p className="text-teal-800 text-sm font-medium">Average Area Price</p>
                        <p className="text-teal-600 text-lg font-bold mt-1">
                          {formatCurrency(areaInsights.askingPrices.data.mean)}
                        </p>
                        {price > 0 && (
                          <div>
                            <p className="text-teal-600 text-sm mt-1">
                              This property is <strong>{price < areaInsights.askingPrices.data.mean ? 'below' : 'above'}</strong> average
                            </p>
                            
                            {/* Add visual price comparison */}
                            <div className="mt-3 relative h-10 bg-gray-100 rounded overflow-hidden">
                              <div className="absolute inset-0 flex">
                                <div className="h-full bg-teal-200" style={{ width: '50%' }}></div>
                                <div className="h-full bg-teal-300" style={{ width: '50%' }}></div>
                              </div>
                              <div 
                                className="absolute top-0 h-full w-1 bg-black"
                                style={{ 
                                  left: '50%',
                                  transform: 'translateX(-50%)'
                                }}
                              ></div>
                              <div 
                                className="absolute top-0 h-full w-2 bg-emerald-600 rounded"
                                style={{ 
                                  left: `${Math.min(Math.max((price / areaInsights.askingPrices.data.mean) * 50, 10), 90)}%`,
                                  transform: 'translateX(-50%)'
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1 text-gray-600">
                              <span>-50%</span>
                              <span>Average</span>
                              <span>+50%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional property details if available */}
              {selectedProperty.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedProperty.description}</p>
                </div>
              )}
              
              {/* If there are sold history records, show them with visualization */}
              {hasSaleHistory && saleHistoryData.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
                    Sale History
                  </h3>
                  
                  {/* Add price growth indicator if we have multiple sales */}
                  {priceGrowth !== null && (
                    <div className="mb-3 p-3 rounded bg-amber-50">
                      <div className="flex items-center">
                        <span className="text-amber-800 text-sm mr-2">Total Price Growth:</span>
                        <span className={`font-bold ${priceGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {priceGrowth >= 0 ? '+' : ''}{priceGrowth.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Add time period */}
                      {saleHistoryData.length >= 2 && (
                        <div className="text-xs text-amber-700 mt-1">
                          Over {Math.round((new Date(saleHistoryData[saleHistoryData.length - 1].date).getTime() - 
                                          new Date(saleHistoryData[0].date).getTime()) / 
                                          (1000 * 60 * 60 * 24 * 365))} years 
                          ({new Date(saleHistoryData[0].date).getFullYear()} to {new Date(saleHistoryData[saleHistoryData.length - 1].date).getFullYear()})
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Price history visualization */}
                  {saleHistoryData.length >= 2 && (
                    <div className="mb-4 bg-white p-3 rounded border border-gray-100">
                      <div className="h-32 relative">
                        {/* Simple chart visualization */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-end h-full">
                          {saleHistoryData.map((sale: any, idx: number) => {
                            const maxPrice = Math.max(...saleHistoryData.map((s: any) => s.price));
                            const height = (sale.price / maxPrice) * 100;
                            const width = `${100 / saleHistoryData.length}%`;
                            const margin = idx > 0 ? '0 0 0 1px' : '0';
                            return (
                              <div 
                                key={idx}
                                className="bg-emerald-500 hover:bg-emerald-600 transition-colors relative group"
                                style={{ 
                                  height: `${height}%`,
                                  width,
                                  margin
                                }}
                              >
                                {/* Tooltip on hover */}
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  <div>{formatCurrency(sale.price)}</div>
                                  <div>{new Date(sale.date).toLocaleDateString()}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        {saleHistoryData.map((sale: any, idx: number) => (
                          <div key={idx}>
                            {new Date(sale.date).getFullYear()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Detailed sale history table */}
                  <div className="space-y-2">
                    {saleHistoryData.map((sale: any, idx: number) => (
                      <div key={idx} className="flex justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span>{new Date(sale.date).toLocaleDateString()}</span>
                        </div>
                        <span className="font-medium">
                          {typeof sale.price === 'number' && !isNaN(sale.price) 
                            ? formatCurrency(sale.price) 
                            : 'Price not available'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Display nearby amenities if available */}
              {selectedProperty.nearby_stations && selectedProperty.nearby_stations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Nearby Transport</h3>
                  <div className="space-y-2">
                    {selectedProperty.nearby_stations.map((station: any, idx: number) => (
                      <div key={idx} className="flex justify-between border-b border-gray-100 pb-2">
                        <span>{station.name}</span>
                        <span className="text-gray-600">{station.distance} miles</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Display nearby schools if available */}
              {selectedProperty.nearby_schools && selectedProperty.nearby_schools.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Nearby Schools</h3>
                  <div className="space-y-2">
                    {selectedProperty.nearby_schools.map((school: any, idx: number) => (
                      <div key={idx} className="flex justify-between border-b border-gray-100 pb-2">
                        <span>{school.name}</span>
                        <span className="text-gray-600">{school.distance} miles</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

            {/* Add advanced options toggles */}
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showPricePerSqft} 
                  onChange={(e) => setShowPricePerSqft(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Show price per sq.ft
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showStampDuty} 
                  onChange={(e) => setShowStampDuty(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Show stamp duty
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showPlanningApplications} 
                  onChange={(e) => setShowPlanningApplications(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Show planning applications
              </label>
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
            {/* Area insights summary - show average prices, trends, etc. */}
            {areaInsights.askingPrices?.data && (
              <div className="mb-8 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Area Insights for {searchTerm}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h4 className="text-emerald-800 text-sm font-medium mb-2">Average Asking Price</h4>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(areaInsights.askingPrices.data.mean || 0)}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-blue-800 text-sm font-medium mb-2">Median Asking Price</h4>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(areaInsights.askingPrices.data.median || 0)}
                    </p>
                  </div>
                  
                  {areaInsights.priceHistory?.data?.trend_percentage !== undefined && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-purple-800 text-sm font-medium mb-2">Price Trend (12 months)</h4>
                      <p className="text-2xl font-bold text-purple-700">
                        {areaInsights.priceHistory.data.trend_percentage.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Properties grid */}
            <div className="mb-6">
              <h3 className="text-lg text-gray-600">
                Found {totalResults} {viewMode === 'listed' ? 'listed' : 'sold'} properties
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProperties.map((property, index) => (
                <Card 
                  key={`${property.address}-${index}`} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => openPropertyModal(property)}
                >
                  {viewMode === 'listed' ? (
                    <>
                      <div className="aspect-video relative bg-gray-100">
                        {property.image_url ? (
                          <img
                            src={property.image_url}
                            alt={property.address || "Property"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Home className="h-12 w-12 text-gray-300" />
                            <p className="text-gray-400 text-sm mt-2">No image available</p>
                          </div>
                        )}
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
                        
                        {/* Show price per sq ft if available and enabled */}
                        {showPricePerSqft && property.price_per_sqft && (
                          <p className="text-sm text-gray-600 mb-3">
                            {formatCurrency(property.price_per_sqft)}/sq.ft
                            {property.size_sq_feet && ` · ${property.size_sq_feet} sq.ft`}
                            {property.size_sq_meters && ` · ${property.size_sq_meters} m²`}
                          </p>
                        )}
                        
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
                        
                        {/* Stamp Duty section */}
                        {showStampDuty && property.stamp_duty !== undefined && (
                          <div className="mt-2 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Stamp Duty:</span>
                              <span className="font-medium">{formatCurrency(property.stamp_duty)}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Enhanced Investment Metrics */}
                        {(property.estimated_rent || property.rental_yield || property.roi || property.estimated_growth) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Investment Potential</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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
                                  <p className="text-purple-800 font-medium">5yr ROI</p>
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
                      
                      {/* Stamp Duty section */}
                      {showStampDuty && property.stamp_duty !== undefined && (
                        <div className="mt-2 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Stamp Duty:</span>
                            <span className="font-medium">{formatCurrency(property.stamp_duty)}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced Investment Metrics */}
                      {(property.estimated_rent || property.rental_yield || property.roi || property.estimated_growth) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Investment Potential</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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
                                <p className="text-purple-800 font-medium">5yr ROI</p>
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
      
      {/* Render the modal component */}
      <PropertyModal />
    </Layout>
  );
} 