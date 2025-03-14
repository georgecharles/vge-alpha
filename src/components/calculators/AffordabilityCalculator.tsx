import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CalculatorIcon, PoundSterling, Home, ShieldCheck } from "lucide-react";

const AffordabilityCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState(60000);
  const [additionalIncome, setAdditionalIncome] = useState(0);
  const [deposit, setDeposit] = useState(40000);
  const [monthlyDebts, setMonthlyDebts] = useState(500);
  const [interestRate, setInterestRate] = useState(4.5);
  const [mortgageTerm, setMortgageTerm] = useState(25);
  const [loanToIncomeMultiplier, setLoanToIncomeMultiplier] = useState(4.5);
  
  const [results, setResults] = useState<{
    maxMortgage: number,
    maxPropertyPrice: number,
    monthlyPayment: number,
    affordabilityRatio: number,
    stressTestedPayment: number,
  } | null>(null);

  const calculateAffordability = () => {
    // Calculate max mortgage based on income multiples
    const totalIncome = annualIncome + additionalIncome;
    const maxMortgage = totalIncome * loanToIncomeMultiplier;
    
    // Calculate max property price
    const maxPropertyPrice = maxMortgage + deposit;
    
    // Calculate expected monthly payment
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = mortgageTerm * 12;
    
    // Calculate monthly payment using the mortgage formula
    const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
    const monthlyPayment = (maxMortgage * x * monthlyInterestRate) / (x - 1);
    
    // Calculate affordability ratio (monthly payment as % of monthly income)
    const monthlyIncome = totalIncome / 12;
    const affordabilityRatio = (monthlyPayment / monthlyIncome) * 100;
    
    // Calculate stress-tested payment (at interest rate + 3%)
    const stressTestRate = (interestRate + 3) / 100 / 12;
    const stressX = Math.pow(1 + stressTestRate, numberOfPayments);
    const stressTestedPayment = (maxMortgage * stressX * stressTestRate) / (stressX - 1);
    
    setResults({
      maxMortgage,
      maxPropertyPrice,
      monthlyPayment,
      affordabilityRatio,
      stressTestedPayment,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <ShieldCheck className="mr-2 h-5 w-5" />
          Mortgage Affordability Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Income Details</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="annual-income">Your Annual Income</Label>
                <span className="text-sm text-muted-foreground">£{annualIncome.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <PoundSterling className="h-5 w-5 text-muted-foreground" />
                <Slider
                  id="annual-income"
                  min={10000}
                  max={200000}
                  step={1000}
                  defaultValue={[annualIncome]}
                  onValueChange={(value) => setAnnualIncome(value[0])}
                />
              </div>
              <Input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional-income">Additional Annual Income (e.g., partner)</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="additional-income"
                  type="number"
                  value={additionalIncome}
                  onChange={(e) => setAdditionalIncome(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="deposit">Deposit Available</Label>
                <span className="text-sm text-muted-foreground">£{deposit.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <PoundSterling className="h-5 w-5 text-muted-foreground" />
                <Slider
                  id="deposit"
                  min={0}
                  max={200000}
                  step={5000}
                  defaultValue={[deposit]}
                  onValueChange={(value) => setDeposit(value[0])}
                />
              </div>
              <Input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthly-debts">Monthly Debt Payments</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">£</span>
                <Input
                  id="monthly-debts"
                  type="number"
                  value={monthlyDebts}
                  onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Include credit cards, loans, car finance, etc.
              </div>
            </div>
            
            <h3 className="text-lg font-medium pt-4">Mortgage Details</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                <span className="text-sm text-muted-foreground">{interestRate}%</span>
              </div>
              <div className="flex gap-2">
                <Slider
                  id="interest-rate"
                  min={1}
                  max={10}
                  step={0.1}
                  defaultValue={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                />
              </div>
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="mt-2"
                step={0.1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="mortgage-term">Mortgage Term (years)</Label>
                <span className="text-sm text-muted-foreground">{mortgageTerm} years</span>
              </div>
              <div className="flex gap-2">
                <Slider
                  id="mortgage-term"
                  min={5}
                  max={40}
                  step={1}
                  defaultValue={[mortgageTerm]}
                  onValueChange={(value) => setMortgageTerm(value[0])}
                />
              </div>
              <Input
                type="number"
                value={mortgageTerm}
                onChange={(e) => setMortgageTerm(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loan-to-income">Loan to Income Multiple</Label>
              <Select 
                defaultValue={loanToIncomeMultiplier.toString()}
                onValueChange={(value) => setLoanToIncomeMultiplier(Number(value))}
              >
                <SelectTrigger id="loan-to-income">
                  <SelectValue placeholder="Select loan to income multiple" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4.0x income</SelectItem>
                  <SelectItem value="4.5">4.5x income</SelectItem>
                  <SelectItem value="5">5.0x income</SelectItem>
                  <SelectItem value="5.5">5.5x income</SelectItem>
                  <SelectItem value="6">6.0x income</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                Lenders typically offer between 4-6x your annual income
              </div>
            </div>
            
            <Button 
              onClick={calculateAffordability} 
              className="w-full mt-4"
            >
              Calculate Affordability
            </Button>
          </div>
          
          <div className="space-y-6">
            {results && (
              <div className="rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-medium">Affordability Results</h3>
                
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col items-center py-4 border-b">
                    <div className="text-muted-foreground text-sm">Maximum Property Price</div>
                    <div className="text-3xl font-bold mt-1">£{results.maxPropertyPrice.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Maximum Mortgage:</div>
                    <div className="text-right font-medium">£{results.maxMortgage.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Monthly Payment:</div>
                    <div className="text-right font-medium">£{results.monthlyPayment.toFixed(2)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Affordability Ratio:</div>
                    <div className="text-right font-medium">
                      {results.affordabilityRatio.toFixed(1)}%
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${results.affordabilityRatio <= 35 ? 'bg-green-100 text-green-800' : results.affordabilityRatio <= 45 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {results.affordabilityRatio <= 35 ? 'Good' : results.affordabilityRatio <= 45 ? 'Moderate' : 'High'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                    <div className="text-muted-foreground">Stress Tested Payment:</div>
                    <div className="text-right font-medium">£{results.stressTestedPayment.toFixed(2)}</div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      (Monthly payment if rates increase by 3%)
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Lender Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li><strong>Affordability Ratio:</strong> Most lenders prefer this to be below 35% of your gross monthly income.</li>
                  <li><strong>Debt-to-Income Ratio:</strong> Your total debt payments (including mortgage) should ideally be below 45% of income.</li>
                  <li><strong>Stress Testing:</strong> Lenders will check if you can afford payments if interest rates rise by 3%.</li>
                  <li><strong>Deposit:</strong> Higher deposits (15%+) typically secure better interest rates.</li>
                </ul>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-medium">Additional costs to consider:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Stamp Duty Land Tax</li>
                    <li>Legal fees (typically £1,000-£1,500)</li>
                    <li>Surveyor fees (£400-£1,500)</li>
                    <li>Mortgage arrangement fees (£0-£2,000)</li>
                    <li>Moving costs</li>
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

export default AffordabilityCalculator; 