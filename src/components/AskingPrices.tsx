import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { getAskingPrices } from '@/lib/patmaService';
import { formatCurrency } from '@/lib/utils';
import { Home, TrendingUp, Target } from 'lucide-react';

interface AskingPricesProps {
  onDataReceived: (data: { postcode: string; data?: { mean: number; median: number } }) => void;
}

export function AskingPrices({ onDataReceived }: AskingPricesProps) {
  const [postcode, setPostcode] = React.useState('');
  const [propertyType, setPropertyType] = React.useState<string>('');
  const [bedrooms, setBedrooms] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleEstimate = async () => {
    if (!postcode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a postcode",
      });
      return;
    }

    if (!propertyType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a property type",
      });
      return;
    }

    if (!bedrooms) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select number of bedrooms",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await getAskingPrices({
        postcode,
        property_type: propertyType as 'flat' | 'terraced' | 'semi-detached' | 'detached',
        bedrooms: parseInt(bedrooms),
      });

      onDataReceived({
        postcode,
        data: {
          mean: result.data.mean,
          median: result.data.median,
        },
      });

      toast({
        title: "Success",
        description: "Price estimate calculated successfully",
      });
    } catch (error) {
      console.error('Error fetching asking prices:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch price estimate. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            type="text"
            placeholder="Enter postcode..."
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="terraced">Terraced</SelectItem>
              <SelectItem value="semi-detached">Semi-Detached</SelectItem>
              <SelectItem value="detached">Detached</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>{num} bedrooms</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button
            onClick={handleEstimate}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Estimate Price'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 