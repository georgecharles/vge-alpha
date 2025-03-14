import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";
import { CalculatorIcon, PoundSterling, Home, BadgePercent } from "lucide-react";

const YieldCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(250000);
  const [monthlyRent, setMonthlyRent] = useState(1200);
  const [annualExpenses, setAnnualExpenses] = useState(2000);
  const [grossYield, setGrossYield] = useState<number | null>(null);
  const [netYield, setNetYield] = useState<number | null>(null);

  const calculateYield = () => {
    const annualRent = monthlyRent * 12;
    const grossYieldValue = (annualRent / propertyValue) * 100;
    const netYieldValue = ((annualRent - annualExpenses) / propertyValue) * 100;
    
    setGrossYield(grossYieldValue);
    setNetYield(netYieldValue);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <BadgePercent className="mr-2 h-5 w-5" />
          Rental Yield Calculator
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
                  min={50000}
                  max={1000000}
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
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="monthly-rent">Monthly Rent</Label>
                <span className="text-sm text-muted-foreground">£{monthlyRent}</span>
              </div>
              <div className="flex gap-2">
                <PoundSterling className="h-5 w-5 text-muted-foreground" />
                <Slider
                  id="monthly-rent"
                  min={200}
                  max={5000}
                  step={50}
                  defaultValue={[monthlyRent]}
                  onValueChange={(value) => setMonthlyRent(value[0])}
                />
              </div>
              <Input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="annual-expenses">Annual Expenses</Label>
                <span className="text-sm text-muted-foreground">£{annualExpenses}</span>
              </div>
              <div className="flex gap-2">
                <PoundSterling className="h-5 w-5 text-muted-foreground" />
                <Slider
                  id="annual-expenses"
                  min={0}
                  max={10000}
                  step={100}
                  defaultValue={[annualExpenses]}
                  onValueChange={(value) => setAnnualExpenses(value[0])}
                />
              </div>
              <Input
                type="number"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <Button 
              onClick={calculateYield} 
              className="w-full mt-4"
            >
              Calculate Yield
            </Button>
          </div>
          
          <div className="space-y-6">
            {grossYield !== null && (
              <div className="rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-medium">Yield Results</h3>
                
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Annual Rental Income:</div>
                    <div className="text-right font-medium">£{(monthlyRent * 12).toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Annual Expenses:</div>
                    <div className="text-right font-medium">£{annualExpenses.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                    <div className="text-muted-foreground">Gross Yield:</div>
                    <div className="text-right font-medium">{grossYield.toFixed(2)}%</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Net Yield:</div>
                    <div className="text-right font-medium">{netYield.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">What Makes a Good Yield?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li><strong>Below 3%:</strong> Generally considered low yield</li>
                  <li><strong>3-5%:</strong> Average yield in expensive areas like London</li>
                  <li><strong>5-7%:</strong> Good yield for most UK locations</li>
                  <li><strong>Above 7%:</strong> Excellent yield, but check location quality</li>
                </ul>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Remember to include all expenses when calculating net yield:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Management fees</li>
                    <li>Maintenance costs</li>
                    <li>Insurance</li>
                    <li>Service charges</li>
                    <li>Void periods</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YieldCalculator; 