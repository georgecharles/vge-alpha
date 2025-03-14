import React from "react";
import { Layout } from "../components/Layout";
import { PageTransition } from "../components/ui/page-transition";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Check, X, AlertCircle, HelpCircle, Zap, Database, BarChart4, Search, Globe, LineChart, Lock, Bell, FileText, Calculator, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { useAuth } from "../lib/auth";
import { useToast } from "../components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function PricingPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const currentTier = profile?.subscription_tier || "free";
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("annual");
  const discount = 20; // Annual discount percentage

  // Calculate monthly and annual pricing with discount
  const calculatePrice = (basePrice: number) => {
    const monthlyPrice = basePrice;
    const annualPrice = basePrice * 12 * (1 - discount / 100);
    return {
      monthly: monthlyPrice,
      annual: annualPrice / 12, // Monthly equivalent
      annualTotal: annualPrice,
      discount: discount
    };
  };

  const plans = [
    {
      name: "Free",
      description: "Basic access for casual property browsers",
      price: calculatePrice(0),
      features: [
        "Basic property search",
        "Limited listings view (10/day)",
        "Basic investment calculators",
        "Save up to 5 properties",
      ],
      limitedFeatures: [
        "No advanced filters",
        "No investment analytics",
        "No market insights",
        "No portfolio tracking",
      ],
      ctaText: currentTier === "free" ? "Current Plan" : "Downgrade",
      disabled: currentTier === "free",
      popular: false,
      tier: "free",
      color: "bg-gray-100",
      icon: <Search className="h-5 w-5" />
    },
    {
      name: "Basic",
      description: "Essential tools for property investors",
      price: calculatePrice(14.99),
      features: [
        "Unlimited property searches",
        "Advanced search filters",
        "All investment calculators",
        "Save up to 50 properties",
        "Basic market insights",
        "Email property alerts",
        "Export basic reports",
      ],
      limitedFeatures: [
        "Limited AI analysis",
        "No deal analyzer",
        "Basic portfolio tracking only",
      ],
      ctaText: currentTier === "basic" ? "Current Plan" : (currentTier === "free" ? "Upgrade" : "Downgrade"),
      disabled: currentTier === "basic",
      popular: false,
      tier: "basic",
      color: "bg-blue-50",
      icon: <Globe className="h-5 w-5" />
    },
    {
      name: "Pro",
      description: "Advanced tools for serious investors",
      price: calculatePrice(29.99),
      features: [
        "Everything in Basic",
        "Comprehensive market insights",
        "Full property history data",
        "Deal analyzer tool",
        "Portfolio performance tracking",
        "Rental yield predictions",
        "Property value forecasting",
        "Advanced filtering",
        "Unlimited saved properties",
        "Custom property alerts",
        "Premium customer support",
      ],
      limitedFeatures: [
        "Limited AI insights",
        "Standard export formats only",
      ],
      ctaText: currentTier === "pro" ? "Current Plan" : (currentTier === "premium" ? "Downgrade" : "Upgrade"),
      disabled: currentTier === "pro",
      popular: true,
      tier: "pro",
      color: "bg-purple-50",
      icon: <BarChart4 className="h-5 w-5" />
    },
    {
      name: "Premium",
      description: "Ultimate toolkit for property professionals",
      price: calculatePrice(49.99),
      features: [
        "Everything in Pro",
        "Full AI property insights",
        "Investment opportunity alerts",
        "Off-market property access",
        "Advanced portfolio analytics",
        "Tax optimization tools",
        "Market prediction models",
        "ROI scenario planning",
        "Competitive analysis tools",
        "White-labeled reports",
        "Priority customer support",
        "1:1 investment strategy session",
      ],
      limitedFeatures: [],
      ctaText: currentTier === "premium" ? "Current Plan" : "Upgrade",
      disabled: currentTier === "premium",
      popular: false,
      tier: "premium",
      color: "bg-amber-50",
      icon: <Zap className="h-5 w-5" />
    }
  ];

  const handleUpgradeClick = (tier: string) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    // For demonstration purposes, show a toast
    if (tier === currentTier) {
      toast({
        title: "Current Plan",
        description: `You are already subscribed to the ${tier} plan.`,
      });
      return;
    }

    toast({
      title: "Subscription Change",
      description: `You are ${tier === "free" ? "downgrading" : "upgrading"} to the ${tier} plan. Redirecting to checkout...`,
    });

    // Here you would normally redirect to a checkout page or process the subscription change
  };

  // Feature comparison data for the table
  const featureCategories = [
    {
      category: "Property Search",
      features: [
        { name: "Basic Property Search", free: true, basic: true, pro: true, premium: true },
        { name: "Advanced Search Filters", free: false, basic: true, pro: true, premium: true },
        { name: "Saved Searches", free: "5 max", basic: "20 max", pro: "Unlimited", premium: "Unlimited" },
        { name: "Property Alerts", free: false, basic: "Email only", pro: "Email & SMS", premium: "Email, SMS & Push" },
        { name: "Off-Market Properties", free: false, basic: false, pro: false, premium: true },
      ]
    },
    {
      category: "Investment Tools",
      features: [
        { name: "Mortgage Calculator", free: true, basic: true, pro: true, premium: true },
        { name: "Stamp Duty Calculator", free: true, basic: true, pro: true, premium: true },
        { name: "Rental Yield Calculator", free: true, basic: true, pro: true, premium: true },
        { name: "Cash Flow Analysis", free: false, basic: "Basic", pro: "Advanced", premium: "Advanced + Scenarios" },
        { name: "ROI Projection", free: false, basic: "Basic", pro: "Advanced", premium: "AI-powered" },
        { name: "Tax Optimization", free: false, basic: false, pro: "Basic", premium: "Advanced" },
      ]
    },
    {
      category: "Market Intelligence",
      features: [
        { name: "Property Price Data", free: "Limited", basic: "3-year history", pro: "10-year history", premium: "Full history" },
        { name: "Local Market Trends", free: false, basic: "Basic", pro: "Detailed", premium: "Comprehensive" },
        { name: "Regional Price Forecasts", free: false, basic: false, pro: true, premium: true },
        { name: "Investment Hotspot Mapping", free: false, basic: false, pro: "Basic", premium: "Advanced" },
        { name: "Economic Indicator Analysis", free: false, basic: false, pro: "Limited", premium: "Comprehensive" },
      ]
    },
    {
      category: "Portfolio Management",
      features: [
        { name: "Saved Properties", free: "5 max", basic: "50 max", pro: "Unlimited", premium: "Unlimited" },
        { name: "Portfolio Tracking", free: false, basic: "Basic", pro: "Advanced", premium: "Professional" },
        { name: "Performance Analytics", free: false, basic: false, pro: true, premium: "Enhanced" },
        { name: "Portfolio Diversification Analysis", free: false, basic: false, pro: "Basic", premium: "Advanced" },
      ]
    },
    {
      category: "AI & Advanced Features",
      features: [
        { name: "AI Investment Analysis", free: false, basic: "Basic", pro: "Advanced", premium: "Comprehensive" },
        { name: "Opportunity Score", free: false, basic: false, pro: true, premium: "Enhanced" },
        { name: "Risk Assessment", free: false, basic: "Basic", pro: "Detailed", premium: "Comprehensive" },
        { name: "Scenario Planning", free: false, basic: false, pro: "Limited", premium: "Unlimited" },
        { name: "AI Market Predictions", free: false, basic: false, pro: "Limited", premium: "Full Access" },
      ]
    },
    {
      category: "Reporting & Export",
      features: [
        { name: "Property Reports", free: false, basic: "Basic PDF", pro: "Detailed Reports", premium: "White-labeled" },
        { name: "Data Export", free: false, basic: "CSV", pro: "CSV & Excel", premium: "All Formats" },
        { name: "Investment Summaries", free: false, basic: "Basic", pro: "Detailed", premium: "Professional" },
      ]
    },
    {
      category: "Support",
      features: [
        { name: "Customer Support", free: "Email", basic: "Email & Chat", pro: "Priority Support", premium: "Dedicated Manager" },
        { name: "Knowledge Base", free: true, basic: true, pro: true, premium: true },
        { name: "Investment Guidance", free: false, basic: false, pro: "Group Webinars", premium: "1:1 Sessions" },
      ]
    },
  ];

  // Benefits data
  const subscriptionBenefits = [
    {
      icon: <Database className="h-8 w-8 text-blue-500" />,
      title: "Comprehensive Property Data",
      description: "Access detailed historical sales data, current valuations, and rental estimates for millions of UK properties."
    },
    {
      icon: <LineChart className="h-8 w-8 text-green-500" />,
      title: "Advanced Market Analytics",
      description: "Track price trends, rental yields, and market performance with interactive visualizations and reports."
    },
    {
      icon: <Lock className="h-8 w-8 text-purple-500" />,
      title: "Exclusive Investment Opportunities",
      description: "Get early access to off-market properties and investment deals not available to the general public."
    },
    {
      icon: <Bell className="h-8 w-8 text-red-500" />,
      title: "Smart Property Alerts",
      description: "Receive instant notifications when properties matching your investment criteria come to market."
    },
    {
      icon: <FileText className="h-8 w-8 text-teal-500" />,
      title: "Professional Reports",
      description: "Generate comprehensive investment reports for your portfolio, perfect for sharing with lenders or partners."
    },
    {
      icon: <Calculator className="h-8 w-8 text-amber-500" />,
      title: "Investment Calculators",
      description: "Make informed decisions with our suite of calculators for mortgages, stamp duty, rental yield, and cash flow."
    },
    {
      icon: <MapPin className="h-8 w-8 text-indigo-500" />,
      title: "Location Intelligence",
      description: "Analyze neighborhood data including schools, transport links, crime rates, and amenities to identify the best locations."
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-500" />,
      title: "AI-Powered Insights",
      description: "Leverage machine learning algorithms to predict property growth, identify investment hotspots, and optimize your portfolio."
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "Can I change my subscription plan later?",
      answer: "Yes, you can upgrade or downgrade your subscription at any time. If you upgrade, you'll be charged the prorated difference immediately. If you downgrade, the new rate will apply at the start of your next billing cycle."
    },
    {
      question: "Do you offer refunds if I'm not satisfied?",
      answer: "We offer a 14-day money-back guarantee for new subscribers. If you're not completely satisfied with our service, contact our support team within 14 days of your initial purchase for a full refund."
    },
    {
      question: "What happens to my saved data if I downgrade?",
      answer: "Your data is preserved even if you downgrade. However, you might lose access to some features or have limited access to saved properties above your new plan's limits. You can always access this data again by upgrading."
    },
    {
      question: "Can I share my subscription with others?",
      answer: "Our subscriptions are for individual use only. We do offer team and business plans for multiple users - please contact our sales team for more information on these options."
    },
    {
      question: "How often is property data updated?",
      answer: "Our standard property data is updated daily. Historical sales data is updated as soon as it becomes available from the Land Registry, typically with a 2-3 month lag. Premium subscribers get the most frequent updates and access to our predictive data models."
    },
    {
      question: "Do you offer discounts for long-term commitments?",
      answer: `Yes, we offer a ${discount}% discount for annual billing compared to monthly billing.`
    },
  ];

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          {/* Hero Section */}
          <section className="py-16 md:py-24 px-4">
            <div className="container mx-auto text-center max-w-4xl">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Select Your Investment Journey
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Choose the plan that matches your investment needs, from casual property browsers to professional investors.
              </p>

              {/* Billing toggle */}
              <div className="flex items-center justify-center mb-12 space-x-4">
                <span className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    billingCycle === "annual" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      billingCycle === "annual" ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
                <div className="flex items-center">
                  <span className={billingCycle === "annual" ? "font-medium" : "text-muted-foreground"}>
                    Annual
                  </span>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                    Save {discount}%
                  </Badge>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {plans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className={`flex flex-col ${
                      plan.popular ? "border-primary shadow-lg scale-[1.02] z-10" : ""
                    } ${plan.color} transition-all duration-200 hover:shadow-md`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Badge className="bg-primary hover:bg-primary/90 text-white">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="p-2 rounded-full bg-background">{plan.icon}</div>
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">{plan.description}</div>
                    </CardHeader>
                    <CardContent className="text-center pb-3">
                      <div className="flex justify-center items-baseline mb-4">
                        <span className="text-3xl font-bold">
                          {plan.price[billingCycle] === 0 
                            ? "Free" 
                            : `£${plan.price[billingCycle].toFixed(2)}`}
                        </span>
                        {plan.price[billingCycle] > 0 && (
                          <span className="text-muted-foreground ml-1">/mo</span>
                        )}
                      </div>
                      {billingCycle === "annual" && plan.price.monthly > 0 && (
                        <div className="text-sm text-muted-foreground mb-4">
                          Billed annually (£{plan.price.annualTotal.toFixed(2)})
                        </div>
                      )}
                      <ul className="text-left space-y-2 mb-6">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                        {plan.limitedFeatures.map((feature, fIndex) => (
                          <li key={`limited-${fIndex}`} className="flex items-start gap-2">
                            <X className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-3">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => handleUpgradeClick(plan.tier)}
                        disabled={plan.disabled}
                      >
                        {plan.ctaText}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Feature Comparison Section */}
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-3xl font-bold text-center mb-12">Compare All Features</h2>
              
              <Tabs defaultValue="table" className="mb-8">
                <TabsList className="mx-auto grid w-[400px] grid-cols-2">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="category">Category View</TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-6">
                  <div className="overflow-x-auto">
                    <Table className="w-full border-collapse">
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[250px] font-medium">Feature</TableHead>
                          <TableHead className="text-center">Free</TableHead>
                          <TableHead className="text-center">Basic</TableHead>
                          <TableHead className="text-center bg-primary/5">Pro</TableHead>
                          <TableHead className="text-center">Premium</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {featureCategories.map((category, cIndex) => (
                          <React.Fragment key={cIndex}>
                            <TableRow className="bg-muted/50">
                              <TableCell colSpan={5} className="font-medium">
                                {category.category}
                              </TableCell>
                            </TableRow>
                            {category.features.map((feature, fIndex) => (
                              <TableRow key={`${cIndex}-${fIndex}`}>
                                <TableCell className="font-light">{feature.name}</TableCell>
                                <TableCell className="text-center">
                                  {feature.free === true ? (
                                    <Check className="mx-auto h-4 w-4 text-green-500" />
                                  ) : feature.free === false ? (
                                    <X className="mx-auto h-4 w-4 text-red-400" />
                                  ) : (
                                    <span className="text-sm">{feature.free}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {feature.basic === true ? (
                                    <Check className="mx-auto h-4 w-4 text-green-500" />
                                  ) : feature.basic === false ? (
                                    <X className="mx-auto h-4 w-4 text-red-400" />
                                  ) : (
                                    <span className="text-sm">{feature.basic}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center bg-primary/5">
                                  {feature.pro === true ? (
                                    <Check className="mx-auto h-4 w-4 text-green-500" />
                                  ) : feature.pro === false ? (
                                    <X className="mx-auto h-4 w-4 text-red-400" />
                                  ) : (
                                    <span className="text-sm">{feature.pro}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {feature.premium === true ? (
                                    <Check className="mx-auto h-4 w-4 text-green-500" />
                                  ) : feature.premium === false ? (
                                    <X className="mx-auto h-4 w-4 text-red-400" />
                                  ) : (
                                    <span className="text-sm">{feature.premium}</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="category" className="mt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {featureCategories.map((category, cIndex) => (
                      <AccordionItem key={cIndex} value={`category-${cIndex}`}>
                        <AccordionTrigger className="text-lg font-medium">
                          {category.category}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="overflow-x-auto">
                            <Table className="w-full border-collapse">
                              <TableHeader className="bg-gray-50">
                                <TableRow>
                                  <TableHead className="w-[250px] font-medium">Feature</TableHead>
                                  <TableHead className="text-center">Free</TableHead>
                                  <TableHead className="text-center">Basic</TableHead>
                                  <TableHead className="text-center bg-primary/5">Pro</TableHead>
                                  <TableHead className="text-center">Premium</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {category.features.map((feature, fIndex) => (
                                  <TableRow key={fIndex}>
                                    <TableCell className="font-light">{feature.name}</TableCell>
                                    <TableCell className="text-center">
                                      {feature.free === true ? (
                                        <Check className="mx-auto h-4 w-4 text-green-500" />
                                      ) : feature.free === false ? (
                                        <X className="mx-auto h-4 w-4 text-red-400" />
                                      ) : (
                                        <span className="text-sm">{feature.free}</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {feature.basic === true ? (
                                        <Check className="mx-auto h-4 w-4 text-green-500" />
                                      ) : feature.basic === false ? (
                                        <X className="mx-auto h-4 w-4 text-red-400" />
                                      ) : (
                                        <span className="text-sm">{feature.basic}</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center bg-primary/5">
                                      {feature.pro === true ? (
                                        <Check className="mx-auto h-4 w-4 text-green-500" />
                                      ) : feature.pro === false ? (
                                        <X className="mx-auto h-4 w-4 text-red-400" />
                                      ) : (
                                        <span className="text-sm">{feature.pro}</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {feature.premium === true ? (
                                        <Check className="mx-auto h-4 w-4 text-green-500" />
                                      ) : feature.premium === false ? (
                                        <X className="mx-auto h-4 w-4 text-red-400" />
                                      ) : (
                                        <span className="text-sm">{feature.premium}</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold text-center mb-4">
                Why Upgrade Your Subscription?
              </h2>
              <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                Our premium features are designed to give you a competitive edge in the property market.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {subscriptionBenefits.map((benefit, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="mb-4">{benefit.icon}</div>
                    <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 px-4 bg-primary text-primary-foreground">
            <div className="container mx-auto text-center max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Property Investment?</h2>
              <p className="text-lg opacity-90 mb-8">
                Join thousands of successful investors who are making data-driven decisions with MyVGE.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                View Plans
              </Button>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">Still have questions about our subscription plans?</p>
                <Button variant="outline">Contact Support</Button>
              </div>
            </div>
          </section>
        </div>
      </PageTransition>
    </Layout>
  );
} 