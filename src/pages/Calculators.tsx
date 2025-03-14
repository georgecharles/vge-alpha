import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import MortgageCalculator from "../components/calculators/MortgageCalculator";
import StampDutyCalculator from "../components/calculators/StampDutyCalculator";
import YieldCalculator from "../components/calculators/YieldCalculator";
import ROICalculator from "../components/calculators/ROICalculator";
import AffordabilityCalculator from "../components/calculators/AffordabilityCalculator";
import HeroSection from "../components/HeroSection";

// Add any other imports you might need

const Calculators = () => {
  // For debugging - check if HeroSection is being initialized
  useEffect(() => {
    console.log("Calculators page mounted - HeroSection should render");
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - ensure it's at the top and visible */}
      <div className="w-full">
        <HeroSection
          title="Property Investment Calculators"
          subtitle="Powerful tools to analyze investments, calculate mortgage payments, and estimate potential returns"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
      </div>
      
      {/* Main Content - add some margin to ensure it's not overlapping with the hero */}
      <div className="container mx-auto px-4 py-12 mt-6">
        <Tabs defaultValue="mortgage" className="w-full">
          <TabsList className="w-full mb-8">
            <div className="grid w-full grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
              <TabsTrigger value="mortgage" className="w-full">Mortgage</TabsTrigger>
              <TabsTrigger value="stampduty" className="w-full">Stamp Duty</TabsTrigger>
              <TabsTrigger value="yield" className="w-full">Rental Yield</TabsTrigger>
              <TabsTrigger value="roi" className="w-full">ROI</TabsTrigger>
              <TabsTrigger value="affordability" className="w-full">Affordability</TabsTrigger>
            </div>
          </TabsList>
          
          <TabsContent value="mortgage" className="mt-6">
            <MortgageCalculator />
          </TabsContent>
          
          <TabsContent value="stampduty" className="mt-6">
            <StampDutyCalculator />
          </TabsContent>
          
          <TabsContent value="yield" className="mt-6">
            <YieldCalculator />
          </TabsContent>
          
          <TabsContent value="roi" className="mt-6">
            <ROICalculator />
          </TabsContent>
          
          <TabsContent value="affordability" className="mt-6">
            <AffordabilityCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Calculators; 