import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Button } from "./ui/button";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  MapPin 
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

interface DataVisualizationProps {
  user?: any;
  profile?: any;
  className?: string;
}

export function DataVisualization({ user, profile, className }: DataVisualizationProps) {
  const [activeChart, setActiveChart] = React.useState('price');

  // Sample data for price trends
  const priceData = [
    { year: '2018', price: 280000 },
    { year: '2019', price: 295000 },
    { year: '2020', price: 305000 },
    { year: '2021', price: 320000 },
    { year: '2022', price: 335000 },
    { year: '2023', price: 345000 },
    { year: '2024', price: 358000 },
  ];

  // Sample data for regional property distribution
  const regionalData = [
    { name: 'London', value: 38 },
    { name: 'South East', value: 22 },
    { name: 'North West', value: 16 },
    { name: 'Midlands', value: 14 },
    { name: 'Scotland', value: 10 },
  ];

  // Sample data for property types
  const propertyTypeData = [
    { type: 'Detached', count: 420 },
    { type: 'Semi-Detached', count: 580 },
    { type: 'Terraced', count: 510 },
    { type: 'Flat', count: 390 },
    { type: 'Bungalow', count: 160 },
  ];

  // Sample data for price per square foot by region
  const pricePerSqftData = [
    { region: 'London', ppsqft: 650 },
    { region: 'South East', ppsqft: 410 },
    { region: 'East', ppsqft: 380 },
    { region: 'South West', ppsqft: 330 },
    { region: 'East Midlands', ppsqft: 270 },
    { region: 'West Midlands', ppsqft: 280 },
    { region: 'Yorkshire', ppsqft: 240 },
    { region: 'North West', ppsqft: 230 },
    { region: 'North East', ppsqft: 190 },
    { region: 'Wales', ppsqft: 210 },
    { region: 'Scotland', ppsqft: 200 },
  ];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Data Visualization Dashboard</h2>
          <p className="text-muted-foreground">
            Interactive charts and graphs showing property market trends and statistics
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="price" value={activeChart} onValueChange={setActiveChart}>
            <TabsList className="mb-6">
              <TabsTrigger value="price" className="flex items-center">
                <LineChartIcon className="mr-2 h-4 w-4" />
                Price Trends
              </TabsTrigger>
              <TabsTrigger value="regional" className="flex items-center">
                <PieChartIcon className="mr-2 h-4 w-4" />
                Regional Distribution
              </TabsTrigger>
              <TabsTrigger value="property-type" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Property Types
              </TabsTrigger>
              <TabsTrigger value="price-per-sqft" className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Price per Sq Ft
              </TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`}
                    domain={['dataMin - 20000', 'dataMax + 20000']}
                  />
                  <Tooltip 
                    formatter={(value) => [`£${value.toLocaleString()}`, 'Average Price']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    name="Average UK Property Price" 
                    stroke="hsl(var(--primary))" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="regional" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={180}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="property-type" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={propertyTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} properties`, 'Count']} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Number of Properties" 
                    fill="hsl(var(--primary))"
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="price-per-sqft" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pricePerSqftData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="region" width={100} />
                  <Tooltip formatter={(value) => [`£${value}/sq ft`, 'Price']} />
                  <Bar 
                    dataKey="ppsqft" 
                    name="Price per Square Foot" 
                    fill="hsl(var(--primary))"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-end">
            {profile?.subscription_tier !== 'free' ? (
              <Button>
                Download Full Report
              </Button>
            ) : (
              <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
                Upgrade for Full Access
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">About the Data</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our data is sourced from multiple reliable sources including Land Registry, 
              Office for National Statistics, and major UK property portals. Data is updated
              monthly to provide the most accurate market insights.
            </p>
            <p className="text-muted-foreground">
              Premium subscribers have access to additional visualizations including 
              predictive models, heat maps, and custom reporting tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Data Interpretation Guide</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              These visualizations help identify property market trends and regional 
              variations. When interpreting the data, consider:
            </p>
            <ul className="list-disc pl-5 mb-4 text-muted-foreground">
              <li>Long-term trends rather than short-term fluctuations</li>
              <li>Regional differences in property values and growth rates</li>
              <li>Correlation with economic indicators like interest rates</li>
              <li>Seasonality effects on the property market</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 