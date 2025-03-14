import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";
import { Button } from "../../components/ui/button";
import { 
  CalculatorIcon, 
  PoundSterling,
  Calendar,
  Percent
} from "lucide-react";

const MortgageCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(250000);
  const [deposit, setDeposit] = useState(50000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [mortgageTerm, setMortgageTerm] = useState(25);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalRepayment, setTotalRepayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);

  const calculateMortgage = () => {
    const loanAmount = propertyValue - deposit;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = mortgageTerm * 12;
    
    // Calculate monthly payment using the mortgage formula
    const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
    const monthly = (loanAmount * x * monthlyInterestRate) / (x - 1);
    
    const totalPaid = monthly * numberOfPayments;
    const totalInterestPaid = totalPaid - loanAmount;
    
    setMonthlyPayment(monthly);
    setTotalRepayment(totalPaid);
    setTotalInterest(totalInterestPaid);
  };

  // Calculate loan to value ratio
  const ltv = ((propertyValue - deposit) / propertyValue) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <CalculatorIcon className="mr-2 h-5 w-5" />
          Mortgage Payment Calculator
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
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="deposit">Deposit</Label>
                <span className="text-sm text-muted-foreground">£{deposit.toLocaleString()} ({ltv.toFixed(1)}% LTV)</span>
              </div>
              <div className="flex gap-2">
                <PoundSterling className="h-5 w-5 text-muted-foreground" />
                <Slider
                  id="deposit"
                  min={0}
                  max={propertyValue}
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
              <div className="flex justify-between">
                <Label htmlFor="interest-rate">Interest Rate</Label>
                <span className="text-sm text-muted-foreground">{interestRate}%</span>
              </div>
              <div className="flex gap-2">
                <Percent className="h-5 w-5 text-muted-foreground" />
                <Slider
                  id="interest-rate"
                  min={0.1}
                  max={15}
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
                <Label htmlFor="mortgage-term">Mortgage Term</Label>
                <span className="text-sm text-muted-foreground">{mortgageTerm} years</span>
              </div>
              <div className="flex gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
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
            
            <Button 
              onClick={calculateMortgage} 
              className="w-full mt-4"
            >
              Calculate
            </Button>
          </div>
          
          <div className="space-y-6">
            {monthlyPayment !== null && (
              <div className="rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-medium">Mortgage Summary</h3>
                
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Loan Amount:</div>
                    <div className="text-right font-medium">£{(propertyValue - deposit).toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Monthly Payment:</div>
                    <div className="text-right font-medium">£{monthlyPayment.toFixed(2)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Total Repayment:</div>
                    <div className="text-right font-medium">£{totalRepayment?.toFixed(2)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Total Interest:</div>
                    <div className="text-right font-medium">£{totalInterest?.toFixed(2)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                    <div className="text-muted-foreground">Loan to Value (LTV):</div>
                    <div className="text-right font-medium">{ltv.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>A higher deposit lowers your monthly payments and improves rates.</li>
                  <li>Shorter mortgage terms have higher monthly payments but less total interest.</li>
                  <li>Most lenders offer better rates for LTV under 75%.</li>
                  <li>Consider fees and early repayment charges when comparing mortgages.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageCalculator; 