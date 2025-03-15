import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PieChart, LineChart, BarChart, MapPin, ArrowUpRight, ArrowDownRight, TrendingUp, Home, Building, Globe, PoundSterling, Info } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { SubscriptionModal } from './SubscriptionModal';
import { Badge } from './ui/badge';

const visualizationTypes = [
  { id: 'price_trends', name: 'Price Trends', icon: <TrendingUp className="h-4 w-4 mr-2" /> },
  { id: 'regional_comparison', name: 'Regional Comparison', icon: <MapPin className="h-4 w-4 mr-2" /> },
  { id: 'property_types', name: 'Property Types', icon: <Home className="h-4 w-4 mr-2" /> },
  { id: 'growth_forecast', name: 'Growth Forecast', icon: <ArrowUpRight className="h-4 w-4 mr-2" /> },
  { id: 'rental_yield', name: 'Rental Yield Analysis', icon: <PoundSterling className="h-4 w-4 mr-2" /> },
  { id: 'market_activity', name: 'Market Activity', icon: <Building className="h-4 w-4 mr-2" /> },
];

// Mock chart component for price trends
const PriceTrendChart = () => (
  <div className="bg-muted rounded-lg p-4 relative aspect-[16/9]">
    <div className="absolute inset-0 flex items-end p-6">
      <div className="w-full flex items-end h-4/5 space-x-1">
        {Array.from({ length: 12 }).map((_, i) => {
          // Generate a random height that follows a slight upward trend
          const baseHeight = 30 + i * 1.5;
          const variance = Math.random() * 15 - 7.5;
          const height = baseHeight + variance;
          
          return (
            <div 
              key={i} 
              className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:opacity-80"
              style={{ height: `${height}%` }}
              title={`Month ${i+1}: £${Math.round(280000 + (i * 1000) + (variance * 1000))}`}
            ></div>
          );
        })}
      </div>
    </div>
    <div className="absolute top-2 left-2 text-xs font-medium text-foreground/70">Price (£)</div>
    <div className="absolute bottom-2 right-2 text-xs font-medium text-foreground/70">Last 12 Months</div>
  </div>
);

// Mock chart component for regional comparison
const RegionalComparisonChart = () => (
  <div className="bg-muted rounded-lg p-4 relative aspect-[16/9]">
    <div className="absolute inset-0 flex items-end p-6">
      <div className="w-full flex items-end h-4/5 space-x-3">
        {[
          { region: 'NW', height: 75, growth: 4.8 },
          { region: 'NE', height: 65, growth: 4.1 },
          { region: 'YOR', height: 70, growth: 4.5 },
          { region: 'MID', height: 60, growth: 3.9 },
          { region: 'SE', height: 45, growth: 2.5 },
          { region: 'LON', height: 35, growth: 0.2 },
          { region: 'SW', height: 50, growth: 3.0 },
          { region: 'WAL', height: 55, growth: 3.5 },
          { region: 'SCO', height: 60, growth: 3.8 },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div 
              className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:opacity-80"
              style={{ height: `${item.height}%` }}
              title={`${item.region}: ${item.growth}% growth`}
            ></div>
            <span className="text-xs mt-1 text-foreground/70">{item.region}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="absolute top-2 left-2 text-xs font-medium text-foreground/70">Growth (%)</div>
  </div>
);

// Mock chart component for property types
const PropertyTypesChart = () => (
  <div className="bg-muted rounded-lg p-4 relative aspect-[16/9]">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-64 h-64 relative rounded-full bg-primary/5">
        {/* Pie chart segments */}
        <div className="absolute inset-0 rounded-full bg-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}></div>
        <div className="absolute inset-0 rounded-full bg-green-500" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 50% 100%)' }}></div>
        <div className="absolute inset-0 rounded-full bg-amber-500" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 50%)' }}></div>
        <div className="absolute inset-0 rounded-full bg-red-500" style={{ clipPath: 'polygon(50% 50%, 0% 50%, 0% 0%, 50% 0%)' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-background"></div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-4 left-4 flex flex-col space-y-1">
      <div className="flex items-center text-xs">
        <div className="w-3 h-3 rounded-sm bg-blue-500 mr-2"></div>
        <span>Detached (40%)</span>
      </div>
      <div className="flex items-center text-xs">
        <div className="w-3 h-3 rounded-sm bg-green-500 mr-2"></div>
        <span>Semi-detached (25%)</span>
      </div>
      <div className="flex items-center text-xs">
        <div className="w-3 h-3 rounded-sm bg-amber-500 mr-2"></div>
        <span>Terraced (20%)</span>
      </div>
      <div className="flex items-center text-xs">
        <div className="w-3 h-3 rounded-sm bg-red-500 mr-2"></div>
        <span>Flats (15%)</span>
      </div>
    </div>
  </div>
);

// Mock chart component for growth forecast
const GrowthForecastChart = () => (
  <div className="bg-muted rounded-lg p-4 relative aspect-[16/9]">
    <div className="absolute inset-0 flex items-end p-6">
      <div className="w-full h-4/5 relative">
        {/* Current position marker */}
        <div className="absolute left-1/3 bottom-0 h-full w-px bg-foreground/20 z-10"></div>
        <div className="absolute left-1/3 bottom-0 w-3 h-3 rounded-full bg-primary transform -translate-x-1.5 z-20"></div>
        <div className="absolute left-1/3 bottom-8 bg-background border rounded-md px-2 py-1 text-xs transform -translate-x-1/2 z-20">
          Current
        </div>
        
        {/* The trend line */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-primary/70"></div>
        </div>
        
        {/* Forecast area */}
        <div className="absolute left-1/3 right-0 bottom-0 h-full bg-gradient-to-r from-blue-500/10 to-green-500/10 z-0 border-l border-dashed border-foreground/20"></div>
        
        {/* Forecast line (increasing) */}
        <div className="absolute left-1/3 bottom-1/2 right-0 h-px bg-green-500 transform rotate-[5deg] origin-left z-10"></div>
        
        {/* Upper bound line */}
        <div className="absolute left-1/3 bottom-1/2 right-0 h-px bg-green-500/30 transform rotate-[12deg] origin-left z-10 border-dashed"></div>
        
        {/* Lower bound line */}
        <div className="absolute left-1/3 bottom-1/2 right-0 h-px bg-green-500/30 transform rotate-[2deg] origin-left z-10 border-dashed"></div>
        
        <div className="absolute top-2 left-2 text-xs font-medium text-foreground/70">Price (£)</div>
        <div className="absolute bottom-2 right-2 text-xs font-medium text-foreground/70">5 Year Forecast</div>
        
        <div className="absolute right-8 top-1/4 bg-background border rounded-md px-2 py-1 text-xs z-20">
          <span className="text-green-500 font-medium">+18.5%</span> Forecast 5Y Growth
        </div>
      </div>
    </div>
  </div>
);

// Mock chart component for rental yield
const RentalYieldChart = () => (
  <div className="bg-muted rounded-lg p-4 relative aspect-[16/9]">
    <div className="absolute inset-0 p-6 grid grid-cols-3 gap-4">
      {[
        { city: 'Liverpool', yield: 7.2 },
        { city: 'Manchester', yield: 6.7 },
        { city: 'Nottingham', yield: 6.5 },
        { city: 'Leeds', yield: 6.1 },
        { city: 'Sheffield', yield: 5.8 },
        { city: 'Birmingham', yield: 5.5 },
        { city: 'Edinburgh', yield: 5.1 },
        { city: 'Bristol', yield: 4.6 },
        { city: 'London', yield: 3.9 },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center justify-end h-full">
          <div className="w-full max-w-16 bg-gradient-to-t from-primary to-primary/70 rounded-t-sm relative overflow-hidden" style={{ height: `${(item.yield / 8) * 100}%` }}>
            <div className="absolute inset-x-0 bottom-0 text-center text-white text-xs font-semibold">
              {item.yield}%
            </div>
          </div>
          <div className="mt-1 text-xs text-center line-clamp-1">{item.city}</div>
        </div>
      ))}
    </div>
    <div className="absolute top-2 left-2 text-xs font-medium text-foreground/70">Rental Yield (%)</div>
  </div>
);

// Mock chart component for market activity
const MarketActivityChart = () => (
  <div className="bg-muted rounded-lg p-4 relative aspect-[16/9]">
    <div className="absolute inset-0 flex items-end p-6">
      <div className="w-full flex items-end h-4/5 space-x-1">
        {Array.from({ length: 24 }).map((_, i) => {
          // Generate activity that follows seasonal patterns
          const month = i % 12;
          let baseHeight = 40;
          
          // Summer months have higher activity
          if (month >= 3 && month <= 7) {
            baseHeight += 30;
          }
          
          // Winter months have lower activity
          if (month >= 9 || month <= 1) {
            baseHeight -= 10;
          }
          
          const variance = Math.random() * 15 - 7.5;
          const height = baseHeight + variance;
          const isCurrentMonth = i === 23;
          
          return (
            <div 
              key={i} 
              className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${isCurrentMonth ? 'bg-primary' : 'bg-primary/60'}`}
              style={{ height: `${height}%` }}
              title={`Month ${(i % 12) + 1}: ${Math.round(height * 100)} transactions`}
            ></div>
          );
        })}
      </div>
    </div>
    <div className="absolute top-2 left-2 text-xs font-medium text-foreground/70">Transaction Volume</div>
    <div className="absolute bottom-2 right-2 text-xs font-medium text-foreground/70">Last 24 Months</div>
  </div>
);

export function DataVisualization({ user, profile }: { user: any; profile: any }) {
  const [currentVisualization, setCurrentVisualization] = useState('price_trends');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const isPremium = profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro';
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading when changing visualization
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentVisualization]);

  const renderVisualizationContent = () => {
    if (!isPremium) {
      return (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          <PieChart className="h-12 w-12 sm:h-16 sm:w-16 mb-4 text-muted-foreground" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Premium Feature</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Advanced data visualizations are available with our Pro and Premium subscriptions.
          </p>
          <Button onClick={() => setIsSubscriptionModalOpen(true)}>
            Upgrade Now
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading visualization data...</p>
        </div>
      );
    }

    switch (currentVisualization) {
      case 'price_trends':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-lg font-medium">UK House Price Trends (Last 12 Months)</h3>
              <Badge variant="outline" className="w-fit">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 text-xs">+2.3% YoY</span>
              </Badge>
            </div>
            
            <PriceTrendChart />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">£289,950</div>
                  <p className="text-xs text-muted-foreground">+2.3% from last year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">+0.5%</div>
                  <p className="text-xs text-muted-foreground">Compared to -0.1% last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Annual Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">+2.3%</div>
                  <p className="text-xs text-muted-foreground">Steady increase since Q1</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'regional_comparison':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Regional Price Comparison</h3>
            
            <RegionalComparisonChart />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Highest Growth Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">North West</div>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+4.8% annual growth</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lowest Growth Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">London</div>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 text-amber-500 mr-1" />
                    <span className="text-xs text-amber-500">+0.2% annual growth</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">UK Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">+2.3%</div>
                  <p className="text-xs text-muted-foreground">Annual price growth</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'property_types':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Property Types Distribution</h3>
            
            <PropertyTypesChart />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fastest Growing Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Detached Houses</div>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+3.5% annual growth</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Best Rental Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Flats/Apartments</div>
                  <div className="flex items-center mt-1">
                    <PoundSterling className="h-3 w-3 text-primary mr-1" />
                    <span className="text-xs">5.1% average yield</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'growth_forecast':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">5-Year Growth Forecast</h3>
            
            <GrowthForecastChart />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Base Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">+18.5%</div>
                  <p className="text-xs text-muted-foreground">Over next 5 years</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Upper Bound</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">+24.2%</div>
                  <p className="text-xs text-muted-foreground">Optimistic scenario</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lower Bound</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">+12.8%</div>
                  <p className="text-xs text-muted-foreground">Conservative scenario</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'rental_yield':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rental Yield Analysis</h3>
            
            <RentalYieldChart />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Performing City</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Liverpool</div>
                  <div className="flex items-center mt-1">
                    <PoundSterling className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">7.2% average yield</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">UK Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">5.5%</div>
                  <p className="text-xs text-muted-foreground">Rental yield across UK</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">London</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">3.9%</div>
                  <p className="text-xs text-muted-foreground">Lower yield, higher capital growth</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'market_activity':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Market Activity (Transaction Volume)</h3>
            
            <MarketActivityChart />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">86,420</div>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+4.2% vs last month</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Year-on-Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">+12.5%</div>
                  <p className="text-xs text-muted-foreground">Increase from last year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Increasing</div>
                  <p className="text-xs text-muted-foreground">Expected to rise over Q3</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Select a visualization type to view data</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Data Visualization</h2>
        <p className="text-muted-foreground">
          Explore market trends with interactive visualizations
        </p>
      </div>

      {/* Responsive grid for visualization types on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
        {visualizationTypes.map((type) => (
          <Button
            key={type.id}
            variant={currentVisualization === type.id ? "default" : "outline"}
            className="w-full h-auto py-2 px-3 flex flex-col sm:flex-row items-center justify-center sm:justify-start text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap"
            onClick={() => setCurrentVisualization(type.id)}
          >
            <span className="flex items-center justify-center sm:justify-start w-full">
              <span className="sm:inline-block">{type.icon}</span>
              <span className="text-center sm:text-left">{type.name}</span>
            </span>
          </Button>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          {renderVisualizationContent()}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-4 mt-4">
          <div className="flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>Data updated: June 13, 2024</span>
          </div>
        </CardFooter>
      </Card>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUser={user}
        userProfile={profile}
      />
    </div>
  );
} 