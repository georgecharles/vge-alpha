import HeroSection from "./HeroSection";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, Building2, BarChart3, Home, MessageSquare, Shield } from "lucide-react";

const aiFeatures = [
  {
    title: "AI Property Analysis",
    description: "Advanced AI algorithms analyze market trends, rental rates, and property conditions to optimize your investment returns.",
    icon: Brain,
    badge: "AI-Powered"
  },
  {
    title: "Smart Tenant Matching",
    description: "AI-driven tenant screening and matching system to find the perfect tenants for your properties.",
    icon: Home,
    badge: "Smart Match"
  },
  {
    title: "Predictive Maintenance",
    description: "AI predicts maintenance needs before they become issues, saving you time and money.",
    icon: Building2,
    badge: "Predictive"
  },
  {
    title: "Automated Reporting",
    description: "AI-generated insights and reports on property performance, maintenance history, and financial metrics.",
    icon: BarChart3,
    badge: "Automated"
  },
  {
    title: "AI Chat Support",
    description: "24/7 AI-powered chat support for tenants and property owners.",
    icon: MessageSquare,
    badge: "24/7 Support"
  },
  {
    title: "Smart Security",
    description: "AI-enhanced security monitoring and access control systems.",
    icon: Shield,
    badge: "Enhanced"
  }
];

const managementServices = [
  {
    title: "Tenant Screening",
    description: "Comprehensive tenant screening with AI-powered background checks and risk assessment.",
  },
  {
    title: "Rent Collection",
    description: "Smart rent collection with predictive payment analysis and automated reminders.",
  },
  {
    title: "Property Maintenance",
    description: "AI-driven maintenance scheduling and vendor management.",
  },
  {
    title: "Financial Reporting",
    description: "Advanced financial analytics with AI-powered forecasting and recommendations.",
  },
];

export default function PropertyManagementPage() {
  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="AI-Powered Property Management"
          subtitle="Experience the future of property management with our advanced AI solutions."
          backgroundImage="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Next-Generation Property Management
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Leveraging artificial intelligence to revolutionize property management and maximize your investment returns.
              </p>
            </div>

            {/* AI Features Grid */}
            <section className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">AI-Powered Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiFeatures.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <feature.icon className="h-6 w-6 text-primary" />
                        <Badge variant="secondary">{feature.badge}</Badge>
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Traditional Services with AI Enhancement */}
            <section className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">Core Services Enhanced by AI</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {managementServices.map((service, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-8 bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-center">Why Choose Our AI-Powered Management?</h2>
              <div className="prose prose-lg max-w-none">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Reduce operational costs by up to 30% with AI automation</li>
                  <li>Minimize vacancy rates with smart tenant matching</li>
                  <li>Prevent maintenance issues before they occur</li>
                  <li>Get real-time insights and predictive analytics</li>
                  <li>24/7 automated support for tenants</li>
                  <li>Enhanced security and risk management</li>
                </ul>
              </div>
            </section>

            <section className="text-center space-y-6">
              <h2 className="text-2xl font-semibold">Ready to Transform Your Property Management?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the power of AI-driven property management. Contact us to learn how we can help optimize your property portfolio.
              </p>
              <Button size="lg" className="px-8">
                Schedule a Demo
              </Button>
            </section>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
