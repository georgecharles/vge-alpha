import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
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
import { Bed, Bath, Home, MapPin, Upload, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { AuthContextChecker } from '../lib/AuthContextChecker';

// Component that safely uses auth context
function PropertyImporterContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchResults, setSearchResults] = useState<ScrapedProperty[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [fileData, setFileData] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData(e.target.files[0]);
      // Reset JSON input when file is selected
      setJsonData('');
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(e.target.value);
    // Reset file input when JSON is entered
    setFileData(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Importer</h1>
        <p className="text-muted-foreground">
          Import properties from external sources by uploading a JSON file or pasting JSON data.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload JSON File</CardTitle>
            <CardDescription>
              Import properties from a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a JSON file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" type="button">Browse Files</Button>
                </Label>
              </div>
              
              {fileData && (
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-medium mb-1">Selected file:</p>
                  <p className="text-muted-foreground">{fileData.name} ({Math.round(fileData.size / 1024)} KB)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Paste JSON Data</CardTitle>
            <CardDescription>
              Paste your JSON data directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder='{"properties": [{"address": "123 Main St", "price": 250000, ...}]}'
                rows={8}
                value={jsonData}
                onChange={handleJsonChange}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                JSON must be properly formatted and contain property data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleImport} 
          disabled={isSubmitting || (!fileData && !jsonData)}
          className="px-8"
        >
          {isSubmitting ? 'Importing...' : 'Import Properties'}
        </Button>
      </div>
      
      {importStatus !== 'idle' && (
        <Alert 
          variant={importStatus === 'success' ? 'default' : 'destructive'} 
          className="mt-6"
        >
          {importStatus === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {importStatus === 'success' ? 'Import Successful' : 'Import Failed'}
          </AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Import Format Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your JSON data should follow this structure:
            </p>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
{`{
  "properties": [
    {
      "address": "123 Main Street, London, E1 6AN",
      "price": 450000,
      "type": "flat",
      "bedrooms": 2,
      "bathrooms": 1,
      "size_sqft": 750,
      "description": "A spacious 2 bedroom flat...",
      "images": ["image1.jpg", "image2.jpg"]
    },
    {
      // Additional properties...
    }
  ]
}`}
            </pre>
            <p className="text-sm text-muted-foreground">
              You can also import a simple array of property objects.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component that handles auth context checking
export function PropertyImporter() {
  return (
    <AuthContextChecker>
      <PropertyImporterContent />
    </AuthContextChecker>
  );
} 