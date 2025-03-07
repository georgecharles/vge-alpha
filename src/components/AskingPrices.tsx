import React from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { LoadingSpinner } from './ui/loading-spinner';
import { useToast } from './ui/use-toast';
import { getAskingPrices, AskingPriceResponse } from '../lib/patmaService';
import { formatCurrency } from '../lib/utils';
import { Home, TrendingUp, Target } from 'lucide-react';

interface AskingPricesProps {
  onDataReceived?: (data: AskingPriceResponse) => void;
}

export function AskingPrices({ onDataReceived }: AskingPricesProps) {
  const [postcode, setPostcode] = React.useState('');
  const [bedrooms, setBedrooms] = React.useState<number>();
  const [propertyType, setPropertyType] = React.useState<'flat' | 'terraced' | 'semi-detached' | 'detached'>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [priceData, setPriceData] = React.useState<AskingPriceResponse | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!postcode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a postcode",
      });
      return;
    }

    try {
      setIsLoading(true);
      const data = await getAskingPrices({
        postcode: postcode.trim(),
        bedrooms,
        property_type: propertyType,
        min_data_points: 20,
      });
      
      setPriceData(data);
      onDataReceived?.(data);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch asking prices",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Property Price Estimator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Postcode</label>
            <Input
              placeholder="e.g., SW1A 1AA"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bedrooms</label>
            <Select
              value={bedrooms?.toString()}
              onValueChange={(value) => setBedrooms(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Property Type</label>
            <Select
              value={propertyType}
              onValueChange={(value: 'flat' | 'terraced' | 'semi-detached' | 'detached') => setPropertyType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="terraced">Terraced</SelectItem>
                <SelectItem value="semi-detached">Semi-detached</SelectItem>
                <SelectItem value="detached">Detached</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Estimate Price'}
            </Button>
          </div>
        </div>

        {priceData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Average Price</h3>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(priceData.data.mean)}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Median Price</h3>
                <Home className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(priceData.data.median)}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Data Points</h3>
                <Target className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{priceData.data.data_points}</p>
              <p className="text-sm text-muted-foreground">Within {priceData.data.radius}km radius</p>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
} 