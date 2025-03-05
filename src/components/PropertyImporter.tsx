import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { LoadingSpinner } from './ui/loading-spinner';
import { useToast } from './ui/use-toast';
import { ScrapedProperty, searchProperties, importProperties } from '../lib/propertyScraperService';
import { useAuth } from '../lib/auth';
import { Badge } from './ui/badge';
import { Bed, Bath, Home, MapPin } from 'lucide-react';

export function PropertyImporter() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchResults, setSearchResults] = useState<ScrapedProperty[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setSelectedProperties(new Set());
      setCurrentPage(1);
      setTotalPages(1);
      setTotalResults(0);
      setLocation('');
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!location.trim()) return;

    try {
      setIsSearching(true);
      const results = await searchProperties(location, currentPage);
      setSearchResults(results.properties);
      setTotalPages(results.totalPages);
      setTotalResults(results.totalResults);
      toast({
        title: "Properties Found",
        description: `Found ${results.totalResults.toLocaleString()} properties in ${location}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search properties. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async () => {
    if (!user?.id || selectedProperties.size === 0) return;

    try {
      setIsImporting(true);
      const propertiesToImport = searchResults.filter(p => selectedProperties.has(p.id));
      await importProperties(propertiesToImport, user.id);
      
      toast({
        title: "Success",
        description: `Imported ${selectedProperties.size} properties successfully`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import properties. Please try again.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const toggleProperty = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await handleSearch();
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500"
      >
        Import Properties
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Properties</DialogTitle>
            <DialogDescription>
              Search for properties by location and select the ones you want to import.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 my-4">
            <Input
              placeholder="Enter city or postcode (e.g., London or SW1A 1AA)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <LoadingSpinner /> : 'Search'}
            </Button>
          </div>

          {totalResults > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Found {totalResults.toLocaleString()} properties in {location}
            </p>
          )}

          <div className="flex-1 overflow-auto min-h-[400px]">
            {isSearching ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={property.image_url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={selectedProperties.has(property.id)}
                          onCheckedChange={() => toggleProperty(property.id)}
                          className="h-6 w-6 bg-white/90"
                        />
                      </div>
                      <Badge 
                        className="absolute bottom-2 left-2 bg-white/90 text-black"
                        variant="secondary"
                      >
                        {property.property_type}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-2">{property.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm line-clamp-1">{property.location}</span>
                      </div>
                      <p className="text-lg font-semibold mb-3">
                        £{property.price.toLocaleString()}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                        {property.sqft > 0 && (
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span>{property.sqft} sq ft</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1 || isSearching}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages || isSearching}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                disabled={selectedProperties.size === 0 || isImporting}
                onClick={handleImport}
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500"
              >
                {isImporting ? (
                  <LoadingSpinner />
                ) : (
                  `Import ${selectedProperties.size} Properties`
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 