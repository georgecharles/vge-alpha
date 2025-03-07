import React from 'react';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Slider,
} from '../components/ui/slider';
import { searchProperties, PatmaProperty, SearchFilters, getListedProperties, getSoldProperties, ListedProperty, SoldProperty, getPriceHistory } from '../lib/patmaService';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { useToast } from '../components/ui/use-toast';
import { MapPin, Bed, Bath, Home, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AskingPrices } from '../components/AskingPrices';

export default function Listings() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 2000000,
    minBeds: 0,
    maxBeds: 10,
    propertyType: 'any',
    radius: 5,
    page: 1,
    limit: 12,
  });
  const [listedProperties, setListedProperties] = React.useState<ListedProperty[]>([]);
  const [soldProperties, setSoldProperties] = React.useState<SoldProperty[]>([]);
  const [viewMode, setViewMode] = React.useState<'listed' | 'sold'>('listed');
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalResults, setTotalResults] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const { toast } = useToast();

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

      // Only fetch the properties for the current view mode
      if (viewMode === 'listed') {
        try {
          const listedResults = await getListedProperties({
            postcode: searchTerm,
            radius: filters.radius,
            property_type: filters.propertyType === 'any' ? undefined : 
              filters.propertyType as 'flat' | 'terraced' | 'semi-detached' | 'detached',
            bedrooms: filters.minBeds || undefined,
            page: filters.page,
            page_size: filters.limit,
            require_sold_price: true,
            include_sold_history: true,
            include_indexation_based_value: true,
            sort_by: 'most_recent_sale_date'
          });
          
          setListedProperties(listedResults.properties || []);
          setTotalResults(listedResults.total || 0);
          setTotalPages(listedResults.totalPages || 1);
        } catch (error) {
          console.error('Error fetching listed properties:', error);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Could not fetch listed properties. Please try again.",
          });
          setListedProperties([]);
          setTotalResults(0);
          setTotalPages(1);
        }
      } else {
        try {
          const soldResults = await getSoldProperties({
            postcode: searchTerm,
            property_type: filters.propertyType === 'any' ? 'detached' : 
              filters.propertyType as 'flat' | 'terraced' | 'semi-detached' | 'detached' | 'bungalow',
            max_age_months: 18,
            min_data_points: 20,
            apply_indexation: true
          });
          
          setSoldProperties(soldResults.properties || []);
          setTotalResults(soldResults.total || 0);
          setTotalPages(soldResults.totalPages || 1);
        } catch (error) {
          console.error('Error fetching sold properties:', error);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Could not fetch sold properties. Please try again.",
          });
          setSoldProperties([]);
          setTotalResults(0);
          setTotalPages(1);
        }
      }

      // Fetch price history for context
      try {
        const priceHistory = await getPriceHistory({
          postcode: searchTerm,
          property_type: filters.propertyType === 'any' ? undefined :
            filters.propertyType as 'flat' | 'terraced' | 'semi-detached' | 'detached'
        });
        console.log('Price history:', priceHistory);
      } catch (error) {
        console.error('Error fetching price history:', error);
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

  // Update search when view mode changes
  React.useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [viewMode]);

  // Update the properties to display based on view mode
  const displayProperties = React.useMemo(() => {
    return viewMode === 'listed' ? listedProperties : soldProperties;
  }, [viewMode, listedProperties, soldProperties]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Price Estimator */}
          <AskingPrices 
            onDataReceived={(data) => {
              if (data.postcode) {
                setSearchTerm(data.postcode);
                handleSearch();
              }
            }}
          />

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Search Properties</h1>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'listed' ? 'default' : 'outline'}
                  onClick={() => setViewMode('listed')}
                >
                  Listed Properties
                </Button>
                <Button
                  variant={viewMode === 'sold' ? 'default' : 'outline'}
                  onClick={() => setViewMode('sold')}
                >
                  Sold Properties
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <Select
                  value={filters.propertyType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="pt-2">
                  <Slider
                    defaultValue={[filters.minPrice || 0, filters.maxPrice || 2000000]}
                    max={2000000}
                    step={10000}
                    onValueChange={([min, max]) => 
                      setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))
                    }
                  />
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    <span>{formatCurrency(filters.minPrice || 0)}</span>
                    <span>{formatCurrency(filters.maxPrice || 2000000)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bedrooms</label>
                <div className="flex items-center gap-4">
                  <Select
                    value={filters.minBeds?.toString()}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, minBeds: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4,5,6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>to</span>
                  <Select
                    value={filters.maxBeds?.toString()}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, maxBeds: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Search Properties'}
            </Button>
          </div>

          {/* Results Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : displayProperties.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {totalResults} Properties Found
                </h2>
                <Select
                  value={filters.limit?.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value) }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Properties per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    {viewMode === 'listed' ? (
                      // Listed property card
                      <>
                        <div className="aspect-video relative">
                          <img
                            src={(property as ListedProperty).images[0]}
                            alt={property.address}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium">
                              {property.property_type}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                            {property.address}
                          </h3>
                          <p className="text-xl font-bold mb-3">
                            {formatCurrency(property.price)}
                          </p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              <span>{(property as ListedProperty).bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{property.postcode}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Sold property card
                      <div className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                          {property.address}
                        </h3>
                        <p className="text-xl font-bold mb-3">
                          {formatCurrency(property.price)}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{property.postcode}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span>{property.property_type}</span>
                          </div>
                          {viewMode === 'sold' && (property as SoldProperty).date_of_transfer && (
                            <div className="flex items-center gap-1">
                              <span>Sold: {new Date((property as SoldProperty).date_of_transfer).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page! - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === filters.page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  disabled={filters.page === totalPages}
                  onClick={() => handlePageChange(filters.page! + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No {viewMode} properties found. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
} 