import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calculator, Home, Building, Percent, TrendingUp } from "lucide-react";
import Header from "./Header";
import { useAuth } from "../lib/auth";
import HeroSection from "./HeroSection";

export default function InvestmentCalculator() {
  const { user, profile } = useAuth();
  const [mortgageResult, setMortgageResult] = React.useState<number | null>(
    null,
  );
  const [buyToLetResult, setBuyToLetResult] = React.useState<number | null>(
    null,
  );
  const [developmentResult, setDevelopmentResult] = React.useState<
    number | null
  >(null);
  const [rentalYieldResult, setRentalYieldResult] = React.useState<
    number | null
  >(null);
  const [roiResult, setRoiResult] = React.useState<number | null>(null);

  const [mortgageData, setMortgageData] = React.useState({
    propertyPrice: "",
    deposit: "",
    interestRate: "",
    term: "",
  });

  const [buyToLetData, setBuyToLetData] = React.useState({
    propertyPrice: "",
    deposit: "",
    interestRate: "",
    rentalIncome: "",
  });

  const [developmentData, setDevelopmentData] = React.useState({
    purchasePrice: "",
    renovationCost: "",
    expectedSalePrice: "",
    otherCosts: "",
  });

  const [rentalYieldData, setRentalYieldData] = React.useState({
    propertyPrice: "",
    annualRent: "",
  });

  const [roiData, setRoiData] = React.useState({
    totalInvestment: "",
    annualReturn: "",
  });

  const calculateMortgage = () => {
    const P =
      parseFloat(mortgageData.propertyPrice) - parseFloat(mortgageData.deposit);
    const r = parseFloat(mortgageData.interestRate) / 100 / 12;
    const n = parseFloat(mortgageData.term) * 12;
    const monthlyPayment =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setMortgageResult(monthlyPayment);
  };

  const calculateBuyToLet = () => {
    const loanAmount =
      parseFloat(buyToLetData.propertyPrice) - parseFloat(buyToLetData.deposit);
    const monthlyInterest =
      (loanAmount * (parseFloat(buyToLetData.interestRate) / 100)) / 12;
    const monthlyRental = parseFloat(buyToLetData.rentalIncome);
    const monthlyCashflow = monthlyRental - monthlyInterest;
    setBuyToLetResult(monthlyCashflow);
  };

  const calculateDevelopment = () => {
    const totalCosts =
      parseFloat(developmentData.purchasePrice) +
      parseFloat(developmentData.renovationCost) +
      parseFloat(developmentData.otherCosts);
    const profit = parseFloat(developmentData.expectedSalePrice) - totalCosts;
    setDevelopmentResult(profit);
  };

  const calculateRentalYield = () => {
    const yield_ =
      (parseFloat(rentalYieldData.annualRent) /
        parseFloat(rentalYieldData.propertyPrice)) *
      100;
    setRentalYieldResult(yield_);
  };

  const calculateROI = () => {
    const roi =
      (parseFloat(roiData.annualReturn) / parseFloat(roiData.totalInvestment)) *
      100;
    setRoiResult(roi);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={!!user} userProfile={profile || undefined} />
      <HeroSection
        title="Property Investment Calculators"
        subtitle="Make informed decisions with our comprehensive suite of property investment calculators"
        backgroundImage="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3"
        showSearch={false}
        showStats={false}
        height="h-[400px]"
      />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Investment Calculators</h1>
            <p className="text-muted-foreground">
              Calculate different aspects of your property investment
            </p>
          </div>

          <Tabs defaultValue="mortgage" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="mortgage" className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Mortgage
              </TabsTrigger>
              <TabsTrigger value="buytolet" className="flex items-center gap-2">
                <Building className="w-4 h-4" /> Buy to Let
              </TabsTrigger>
              <TabsTrigger
                value="development"
                className="flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" /> Development
              </TabsTrigger>
              <TabsTrigger
                value="rentalyield"
                className="flex items-center gap-2"
              >
                <Percent className="w-4 h-4" /> Rental Yield
              </TabsTrigger>
              <TabsTrigger value="roi" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> ROI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mortgage">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">
                    Mortgage Calculator
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Property Price (£)</Label>
                      <Input
                        type="number"
                        value={mortgageData.propertyPrice}
                        onChange={(e) =>
                          setMortgageData({
                            ...mortgageData,
                            propertyPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deposit (£)</Label>
                      <Input
                        type="number"
                        value={mortgageData.deposit}
                        onChange={(e) =>
                          setMortgageData({
                            ...mortgageData,
                            deposit: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        value={mortgageData.interestRate}
                        onChange={(e) =>
                          setMortgageData({
                            ...mortgageData,
                            interestRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Term (Years)</Label>
                      <Input
                        type="number"
                        value={mortgageData.term}
                        onChange={(e) =>
                          setMortgageData({
                            ...mortgageData,
                            term: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={calculateMortgage} className="w-full">
                    Calculate
                  </Button>
                  {mortgageResult !== null && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <p className="text-lg font-semibold">
                        Monthly Payment: £{mortgageResult.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buytolet">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">
                    Buy to Let Calculator
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Property Price (£)</Label>
                      <Input
                        type="number"
                        value={buyToLetData.propertyPrice}
                        onChange={(e) =>
                          setBuyToLetData({
                            ...buyToLetData,
                            propertyPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deposit (£)</Label>
                      <Input
                        type="number"
                        value={buyToLetData.deposit}
                        onChange={(e) =>
                          setBuyToLetData({
                            ...buyToLetData,
                            deposit: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        value={buyToLetData.interestRate}
                        onChange={(e) =>
                          setBuyToLetData({
                            ...buyToLetData,
                            interestRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Rental Income (£)</Label>
                      <Input
                        type="number"
                        value={buyToLetData.rentalIncome}
                        onChange={(e) =>
                          setBuyToLetData({
                            ...buyToLetData,
                            rentalIncome: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={calculateBuyToLet} className="w-full">
                    Calculate
                  </Button>
                  {buyToLetResult !== null && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <p className="text-lg font-semibold">
                        Monthly Cashflow: £{buyToLetResult.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="development">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">
                    Development Calculator
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Price (£)</Label>
                      <Input
                        type="number"
                        value={developmentData.purchasePrice}
                        onChange={(e) =>
                          setDevelopmentData({
                            ...developmentData,
                            purchasePrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renovation Cost (£)</Label>
                      <Input
                        type="number"
                        value={developmentData.renovationCost}
                        onChange={(e) =>
                          setDevelopmentData({
                            ...developmentData,
                            renovationCost: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Sale Price (£)</Label>
                      <Input
                        type="number"
                        value={developmentData.expectedSalePrice}
                        onChange={(e) =>
                          setDevelopmentData({
                            ...developmentData,
                            expectedSalePrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Other Costs (£)</Label>
                      <Input
                        type="number"
                        value={developmentData.otherCosts}
                        onChange={(e) =>
                          setDevelopmentData({
                            ...developmentData,
                            otherCosts: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={calculateDevelopment} className="w-full">
                    Calculate
                  </Button>
                  {developmentResult !== null && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <p className="text-lg font-semibold">
                        Expected Profit: £{developmentResult.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rentalyield">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">
                    Rental Yield Calculator
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Property Price (£)</Label>
                      <Input
                        type="number"
                        value={rentalYieldData.propertyPrice}
                        onChange={(e) =>
                          setRentalYieldData({
                            ...rentalYieldData,
                            propertyPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Annual Rental Income (£)</Label>
                      <Input
                        type="number"
                        value={rentalYieldData.annualRent}
                        onChange={(e) =>
                          setRentalYieldData({
                            ...rentalYieldData,
                            annualRent: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={calculateRentalYield} className="w-full">
                    Calculate
                  </Button>
                  {rentalYieldResult !== null && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <p className="text-lg font-semibold">
                        Rental Yield: {rentalYieldResult.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roi">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">ROI Calculator</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Investment (£)</Label>
                      <Input
                        type="number"
                        value={roiData.totalInvestment}
                        onChange={(e) =>
                          setRoiData({
                            ...roiData,
                            totalInvestment: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Annual Return (£)</Label>
                      <Input
                        type="number"
                        value={roiData.annualReturn}
                        onChange={(e) =>
                          setRoiData({
                            ...roiData,
                            annualReturn: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={calculateROI} className="w-full">
                    Calculate
                  </Button>
                  {roiResult !== null && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <p className="text-lg font-semibold">
                        ROI: {roiResult.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
