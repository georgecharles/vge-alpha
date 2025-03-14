import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { CalculatorIcon, PoundSterling, Building, UserRoundCheck } from "lucide-react";

const StampDutyCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(300000);
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  const [isAdditionalProperty, setIsAdditionalProperty] = useState(false);
  const [isNonUKResident, setIsNonUKResident] = useState(false);
  const [stampDuty, setStampDuty] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<Array<{band: string, tax: number}>>([]);

  // Calculate stamp duty based on UK rules (as of 2023)
  const calculateStampDuty = () => {
    let bands: {start: number, end: number | null, rate: number}[] = [];
    let totalTax = 0;
    let breakdownItems: Array<{band: string, tax: number}> = [];

    // Standard rates for residential properties
    if (isFirstTimeBuyer) {
      // First-time buyer rates
      bands = [
        { start: 0, end: 425000, rate: 0 },
        { start: 425000, end: 625000, rate: 0.05 },
        { start: 625000, end: null, rate: 0.05 }
      ];
    } else {
      // Standard residential rates
      bands = [
        { start: 0, end: 250000, rate: 0 },
        { start: 250000, end: 925000, rate: 0.05 },
        { start: 925000, end: 1500000, rate: 0.1 },
        { start: 1500000, end: null, rate: 0.12 }
      ];
    }

    // Additional property surcharge
    const additionalRate = isAdditionalProperty ? 0.03 : 0;
    
    // Non-UK resident surcharge
    const nonUKResidentRate = isNonUKResident ? 0.02 : 0;

    // Calculate tax for each band
    let remainingValue = propertyValue;
    bands.forEach(band => {
      if (remainingValue > 0) {
        const bandWidth = band.end ? band.end - band.start : remainingValue;
        const amountInBand = Math.min(remainingValue, bandWidth);
        
        // Calculate tax for this band
        const bandRate = band.rate + additionalRate + nonUKResidentRate;
        const bandTax = amountInBand * bandRate;
        
        if (bandTax > 0) {
          // Add to breakdown
          const bandLabel = band.end 
            ? `£${band.start.toLocaleString()} - £${band.end.toLocaleString()}` 
            : `Over £${band.start.toLocaleString()}`;
          
          breakdownItems.push({
            band: `${bandLabel} @ ${(bandRate * 100).toFixed(1)}%`,
            tax: bandTax
          });
        }
        
        totalTax += bandTax;
        remainingValue -= amountInBand;
      }
    });

    setStampDuty(totalTax);
    setBreakdown(breakdownItems);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <CalculatorIcon className="mr-2 h-5 w-5" />
          Stamp Duty Land Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="property-value">Property Value</Label>
                <span className="text-sm text-muted-foreground">£{propertyValue.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <PoundSterling className="h-5 w-5 text-muted-foreground" />
                <Slider
                  id="property-value"
                  min={40000}
                  max={2000000}
                  step={5000}
                  defaultValue={[propertyValue]}
                  onValueChange={(value) => setPropertyValue(value[0])}
                />
              </div>
              <Input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="first-time-buyer" 
                  checked={isFirstTimeBuyer}
                  onCheckedChange={(checked) => {
                    setIsFirstTimeBuyer(checked === true);
                    if (checked) setIsAdditionalProperty(false);
                  }}
                />
                <Label 
                  htmlFor="first-time-buyer"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  First-time buyer
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="additional-property" 
                  checked={isAdditionalProperty}
                  onCheckedChange={(checked) => {
                    setIsAdditionalProperty(checked === true);
                    if (checked) setIsFirstTimeBuyer(false);
                  }}
                  disabled={isFirstTimeBuyer}
                />
                <Label 
                  htmlFor="additional-property"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Additional property (3% surcharge)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="non-uk-resident" 
                  checked={isNonUKResident}
                  onCheckedChange={(checked) => setIsNonUKResident(checked === true)}
                />
                <Label 
                  htmlFor="non-uk-resident"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Non-UK resident (2% surcharge)
                </Label>
              </div>
            </div>
            
            <Button 
              onClick={calculateStampDuty} 
              className="w-full mt-4"
            >
              Calculate Stamp Duty
            </Button>
          </div>
          
          <div className="space-y-6">
            {stampDuty !== null && (
              <div className="rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-medium">Stamp Duty Summary</h3>
                
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-lg font-semibold text-center">
                      Total Stamp Duty: £{stampDuty.toFixed(2)}
                    </div>
                  </div>
                  
                  {breakdown.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Breakdown:</h4>
                      {breakdown.map((item, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">{item.band}</div>
                          <div className="text-right">£{item.tax.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>First-time buyers get relief on properties up to £625,000.</li>
                  <li>Additional properties incur a 3% surcharge on all bands.</li>
                  <li>Non-UK residents pay an additional 2% on all bands.</li>
                  <li>This is for standard residential property in England and Northern Ireland.</li>
                  <li>Different rates apply in Scotland and Wales.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StampDutyCalculator; 