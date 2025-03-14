import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CalculatorIcon, PoundSterling, TrendingUp, BadgePercent } from "lucide-react";

const ROICalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(250000);
  const [renovationCost, setRenovationCost] = useState(25000);
  const [stampDuty, setStampDuty] = useState(2500);
  const [otherCosts, setOtherCosts] = useState(3000);
  const [monthlyRent, setMonthlyRent] = useState(1200);
  const [annualExpenses, setAnnualExpenses] = useState(2400);
  const [holdingPeriod, setHoldingPeriod] = useState(5);
  const [annualAppreciation, setAnnualAppreciation] = useState(3);
  const [financingMethod, setFinancingMethod] = useState("cash");
  const [mortgageDeposit, setMortgageDeposit] = useState(62500); // 25% of purchase price
  const [interestRate, setInterestRate] = useState(4.5);
  const [mortgageTerm, setMortgageTerm] = useState(25);
  
  const [results, setResults] = useState<{
    totalInvestment: number,
    cashFlow: number,
    cashOnCashReturn: number,
    estimatedSalePrice: number,
    totalProfit: number,
    totalROI: number,
    annualizedROI: number
  } | null>(null);

  const calculateROI = () => {
    // Calculate total initial investment
    const totalInvestment = financingMethod === "cash" 
      ? purchasePrice + renovationCost + stampDuty + otherCosts
      : mortgageDeposit + renovationCost + stampDuty + otherCosts;
    
    // Calculate annual cash flow
    const annualRent = monthlyRent * 12;
    let annualMortgagePayments = 0;
    
    if (financingMethod === "mortgage") {
      const loanAmount = purchasePrice - mortgageDeposit;
      const monthlyInterestRate = interestRate / 100 / 12;
      const numberOfPayments = mortgageTerm * 12;
      
      // Calculate monthly mortgage payment
      const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
      const monthlyPayment = (loanAmount * x * monthlyInterestRate) / (x - 1);
      
      annualMortgagePayments = monthlyPayment * 12;
    }
    
    const annualCashFlow = annualRent - annualExpenses - annualMortgagePayments;
    
    // Calculate cash-on-cash return (annual cash flow / total investment)
    const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;
    
    // Calculate future property value with appreciation
    const estimatedSalePrice = purchasePrice * Math.pow(1 + (annualAppreciation / 100), holdingPeriod);
    
    // Calculate outstanding mortgage (if applicable)
    let outstandingMortgage = 0;
    if (financingMethod === "mortgage") {
      const loanAmount = purchasePrice - mortgageDeposit;
      const monthlyInterestRate = interestRate / 100 / 12;
      const numberOfPayments = mortgageTerm * 12;
      const monthlyPayment = (loanAmount * Math.pow(1 + monthlyInterestRate, numberOfPayments) * monthlyInterestRate) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
      
      // Calculate remaining balance after holding period
      let balance = loanAmount;
      for (let i = 0; i < holdingPeriod * 12; i++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
      }
      
      outstandingMortgage = Math.max(0, balance);
    }
    
    // Calculate total profit
    const totalCashFlow = annualCashFlow * holdingPeriod;
    const equityGain = estimatedSalePrice - purchasePrice - outstandingMortgage;
    const totalProfit = totalCashFlow + equityGain;
    
    // Calculate total ROI (total profit / total investment)
    const totalROI = (totalProfit / totalInvestment) * 100;
    
    // Calculate annualized ROI
    const annualizedROI = Math.pow(1 + (totalROI / 100), 1 / holdingPeriod) - 1;
    
    setResults({
      totalInvestment,
      cashFlow: annualCashFlow,
      cashOnCashReturn,
      estimatedSalePrice,
      totalProfit,
      totalROI,
      annualizedROI: annualizedROI * 100
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <TrendingUp className="mr-2 h-5 w-5" />
          Return on Investment (ROI) Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Property Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="purchase-price">Purchase Price</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="purchase-price"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="renovation-cost">Renovation Cost</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="renovation-cost"
                  type="number"
                  value={renovationCost}
                  onChange={(e) => setRenovationCost(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stamp-duty">Stamp Duty</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="stamp-duty"
                  type="number"
                  value={stampDuty}
                  onChange={(e) => setStampDuty(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other-costs">Other Costs (Legal, Survey, etc.)</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="other-costs"
                  type="number"
                  value={otherCosts}
                  onChange={(e) => setOtherCosts(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <h3 className="text-lg font-medium pt-4">Rental Income & Expenses</h3>
            
            <div className="space-y-2">
              <Label htmlFor="monthly-rent">Monthly Rent</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="monthly-rent"
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annual-expenses">Annual Expenses</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="annual-expenses"
                  type="number"
                  value={annualExpenses}
                  onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <h3 className="text-lg font-medium pt-4">Investment Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="financing-method">Financing Method</Label>
              <Select 
                defaultValue={financingMethod}
                onValueChange={(value) => setFinancingMethod(value)}
              >
                <SelectTrigger id="financing-method">
                  <SelectValue placeholder="Select financing method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash Purchase</SelectItem>
                  <SelectItem value="mortgage">Mortgage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {financingMethod === "mortgage" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mortgage-deposit">Mortgage Deposit</Label>
                  <div className="flex">
                    <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                    <Input
                      id="mortgage-deposit"
                      type="number"
                      value={mortgageDeposit}
                      onChange={(e) => setMortgageDeposit(Number(e.target.value))}
                      className="rounded-l-none"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((mortgageDeposit / purchasePrice) * 100).toFixed(1)}% of purchase price
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    step={0.1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mortgage-term">Mortgage Term (years)</Label>
                  <Input
                    id="mortgage-term"
                    type="number"
                    value={mortgageTerm}
                    onChange={(e) => setMortgageTerm(Number(e.target.value))}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="holding-period">Investment Holding Period (years)</Label>
              <Input
                id="holding-period"
                type="number"
                value={holdingPeriod}
                onChange={(e) => setHoldingPeriod(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annual-appreciation">Annual Property Appreciation (%)</Label>
              <Input
                id="annual-appreciation"
                type="number"
                value={annualAppreciation}
                onChange={(e) => setAnnualAppreciation(Number(e.target.value))}
                step={0.1}
              />
            </div>
            
            <Button 
              onClick={calculateROI} 
              className="w-full mt-4"
            >
              Calculate ROI
            </Button>
          </div>
          
          <div className="space-y-6">
            {results && (
              <div className="rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-medium">ROI Summary</h3>
                
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Total Investment:</div>
                    <div className="text-right font-medium">£{results.totalInvestment.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Annual Cash Flow:</div>
                    <div className="text-right font-medium">£{results.cashFlow.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Cash-on-Cash Return:</div>
                    <div className="text-right font-medium">{results.cashOnCashReturn.toFixed(2)}%</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                    <div className="text-muted-foreground">Estimated Sale Price:</div>
                    <div className="text-right font-medium">£{results.estimatedSalePrice.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Total Profit:</div>
                    <div className="text-right font-medium">£{results.totalProfit.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t font-bold">
                    <div>Total ROI:</div>
                    <div className="text-right">{results.totalROI.toFixed(2)}%</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 font-bold">
                    <div>Annualized ROI:</div>
                    <div className="text-right">{results.annualizedROI.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">ROI Explained</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li><strong>Cash-on-Cash Return:</strong> Annual cash flow divided by your initial investment.</li>
                  <li><strong>Total ROI:</strong> Total profit (cash flow + equity gain) as a percentage of your investment.</li>
                  <li><strong>Annualized ROI:</strong> The yearly rate of return that would give you the total ROI over the holding period.</li>
                </ul>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>For buy-to-let investments, aim for:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Cash-on-Cash Return: 5-8%</li>
                    <li>Total ROI: 40%+ over 5 years</li>
                    <li>Annualized ROI: 7%+</li>
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

export default ROICalculator; 