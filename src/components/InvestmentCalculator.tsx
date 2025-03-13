import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Calculator, Home, TrendingUp, PoundSterling } from "lucide-react";

// Auth context checker wrapper
const AuthContextChecker = ({ children }: { children: React.ReactNode }) => {
  try {
    // Try to access auth context but don't use the result
    useAuth();
    // If we get here, auth context is available
    return <>{children}</>;
  } catch (error) {
    // If auth context is not available, show a fallback
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Authentication Error</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Unable to load authentication. Please refresh the page or try again later.
            </p>
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }
};

const InvestmentCalculator = () => {
  return (
    <AuthContextChecker>
      <InvestmentCalculatorContent />
    </AuthContextChecker>
  );
};

// Separate the main component content to ensure useAuth is only called when context is available
const InvestmentCalculatorContent = () => {
  const { user, profile } = useAuth();
  const [calculatorType, setCalculatorType] = useState("mortgage");
  
  // Mortgage calculator state
  const [propertyPrice, setPropertyPrice] = useState(250000);
  const [depositPercentage, setDepositPercentage] = useState(20);
  const [mortgageTerm, setMortgageTerm] = useState(25);
  const [interestRate, setInterestRate] = useState(3.5);
  
  // ROI calculator state
  const [purchasePrice, setPurchasePrice] = useState(200000);
  const [renovationCost, setRenovationCost] = useState(15000);
  const [stampDuty, setStampDuty] = useState(7500);
  const [legalFees, setLegalFees] = useState(2000);
  const [monthlyRent, setMonthlyRent] = useState(1200);
  const [annualMaintenance, setAnnualMaintenance] = useState(1000);
  const [annualInsurance, setAnnualInsurance] = useState(500);
  const [vacancyRate, setVacancyRate] = useState(5);
  const [propertyGrowthRate, setPropertyGrowthRate] = useState(3);
  const [holdingPeriod, setHoldingPeriod] = useState(10);
  
  // Calculated values for mortgage
  const depositAmount = propertyPrice * (depositPercentage / 100);
  const loanAmount = propertyPrice - depositAmount;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = mortgageTerm * 12;
  const monthlyPayment =
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  const totalRepayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalRepayment - loanAmount;
  
  // Calculated values for ROI
  const totalInvestment = purchasePrice + renovationCost + stampDuty + legalFees;
  const annualRentalIncome = monthlyRent * 12 * (1 - vacancyRate / 100);
  const annualExpenses = annualMaintenance + annualInsurance;
  const netAnnualIncome = annualRentalIncome - annualExpenses;
  const cashOnCashReturn = (netAnnualIncome / totalInvestment) * 100;
  
  // Future value calculation
  const futurePropertyValue = purchasePrice * Math.pow(1 + propertyGrowthRate / 100, holdingPeriod);
  const totalRentalIncome = netAnnualIncome * holdingPeriod;
  const totalReturn = futurePropertyValue - purchasePrice + totalRentalIncome;
  const annualizedReturn = ((totalReturn / totalInvestment) / holdingPeriod) * 100;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-3">Property Investment Calculator</h1>
                <p className="text-muted-foreground">
                  Calculate mortgage payments, ROI, and other key investment metrics
                </p>
              </div>

              <Tabs
                defaultValue="mortgage"
                value={calculatorType}
                onValueChange={setCalculatorType}
                className="mb-8"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mortgage" className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Mortgage
                  </TabsTrigger>
                  <TabsTrigger value="roi" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    ROI
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mortgage">
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-semibold">Mortgage Calculator</h2>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label>Property Price: {formatCurrency(propertyPrice)}</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={50000} 
                              max={2000000} 
                              step={5000} 
                              value={[propertyPrice]} 
                              onValueChange={(value) => setPropertyPrice(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={propertyPrice} 
                              onChange={(e) => setPropertyPrice(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Deposit: {depositPercentage}%</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={5} 
                              max={95} 
                              step={1} 
                              value={[depositPercentage]} 
                              onValueChange={(value) => setDepositPercentage(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={depositPercentage} 
                              onChange={(e) => setDepositPercentage(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Mortgage Term: {mortgageTerm} years</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={5} 
                              max={40} 
                              step={1} 
                              value={[mortgageTerm]} 
                              onValueChange={(value) => setMortgageTerm(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={mortgageTerm} 
                              onChange={(e) => setMortgageTerm(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Interest Rate: {interestRate}%</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={0.5} 
                              max={10} 
                              step={0.1} 
                              value={[interestRate]} 
                              onValueChange={(value) => setInterestRate(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={interestRate} 
                              onChange={(e) => setInterestRate(Number(e.target.value))} 
                              className="w-24" 
                              step={0.1}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/40 rounded-lg p-6 space-y-6">
                        <h3 className="text-lg font-semibold mb-4">Results</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Loan Amount:</span>
                            <span className="font-medium">{formatCurrency(loanAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposit Amount:</span>
                            <span className="font-medium">{formatCurrency(depositAmount)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-primary">
                            <span>Monthly Payment:</span>
                            <span>{isNaN(monthlyPayment) ? '£0' : formatCurrency(monthlyPayment)}</span>
                          </div>
                          <div className="border-t pt-3 mt-3"></div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Repayment:</span>
                            <span className="font-medium">{formatCurrency(totalRepayment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Interest:</span>
                            <span className="font-medium">{formatCurrency(totalInterest)}</span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Button className="w-full">
                            Save Calculation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="roi">
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-semibold">ROI Calculator</h2>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label>Purchase Price: {formatCurrency(purchasePrice)}</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={50000} 
                              max={2000000} 
                              step={5000} 
                              value={[purchasePrice]} 
                              onValueChange={(value) => setPurchasePrice(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={purchasePrice} 
                              onChange={(e) => setPurchasePrice(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Renovation Cost: {formatCurrency(renovationCost)}</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={0} 
                              max={200000} 
                              step={1000} 
                              value={[renovationCost]} 
                              onValueChange={(value) => setRenovationCost(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={renovationCost} 
                              onChange={(e) => setRenovationCost(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Monthly Rent: {formatCurrency(monthlyRent)}</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={300} 
                              max={10000} 
                              step={50} 
                              value={[monthlyRent]} 
                              onValueChange={(value) => setMonthlyRent(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={monthlyRent} 
                              onChange={(e) => setMonthlyRent(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Annual Maintenance: {formatCurrency(annualMaintenance)}</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={0} 
                              max={10000} 
                              step={100} 
                              value={[annualMaintenance]} 
                              onValueChange={(value) => setAnnualMaintenance(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={annualMaintenance} 
                              onChange={(e) => setAnnualMaintenance(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Property Growth Rate: {propertyGrowthRate}%</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={0} 
                              max={15} 
                              step={0.5} 
                              value={[propertyGrowthRate]} 
                              onValueChange={(value) => setPropertyGrowthRate(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={propertyGrowthRate} 
                              onChange={(e) => setPropertyGrowthRate(Number(e.target.value))} 
                              className="w-24" 
                              step={0.1}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Holding Period: {holdingPeriod} years</Label>
                          <div className="flex items-center gap-4">
                            <Slider 
                              min={1} 
                              max={30} 
                              step={1} 
                              value={[holdingPeriod]} 
                              onValueChange={(value) => setHoldingPeriod(value[0])} 
                            />
                            <Input 
                              type="number" 
                              value={holdingPeriod} 
                              onChange={(e) => setHoldingPeriod(Number(e.target.value))} 
                              className="w-24" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/40 rounded-lg p-6 space-y-6">
                        <h3 className="text-lg font-semibold mb-4">Investment Returns</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Investment:</span>
                            <span className="font-medium">{formatCurrency(totalInvestment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Rental Income:</span>
                            <span className="font-medium">{formatCurrency(annualRentalIncome)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Net Annual Income:</span>
                            <span className="font-medium">{formatCurrency(netAnnualIncome)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-primary">
                            <span>Cash-on-Cash Return:</span>
                            <span>{cashOnCashReturn.toFixed(2)}%</span>
                          </div>
                          <div className="border-t pt-3 mt-3"></div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Future Property Value:</span>
                            <span className="font-medium">{formatCurrency(futurePropertyValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Rental Income:</span>
                            <span className="font-medium">{formatCurrency(totalRentalIncome)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Return:</span>
                            <span className="font-medium">{formatCurrency(totalReturn)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-primary">
                            <span>Annualized Return:</span>
                            <span>{annualizedReturn.toFixed(2)}%</span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Button className="w-full">
                            Save Calculation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default InvestmentCalculator;
