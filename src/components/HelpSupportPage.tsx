import React from "react";
import Header from "./Header";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { PageTransition } from "./ui/page-transition";
import { Layout } from "./Layout";
import {
  Mail,
  Phone,
  MessageCircle,
  FileText,
  HelpCircle,
  Book,
} from "lucide-react";

export default function HelpSupportPage() {
  const { user, profile } = useAuth();

  const supportCategories = [
    {
      title: "Getting Started",
      icon: <Book className="w-5 h-5" />,
      description: "Learn the basics of using our platform",
      content: [
        "How to search for properties",
        "Understanding market insights",
        "Setting up your account",
        "Subscription plans overview",
      ],
    },
    {
      title: "Account & Billing",
      icon: <FileText className="w-5 h-5" />,
      description: "Manage your account and subscription",
      content: [
        "Updating account details",
        "Subscription management",
        "Billing history",
        "Payment methods",
      ],
    },
    {
      title: "Technical Support",
      icon: <HelpCircle className="w-5 h-5" />,
      description: "Get help with technical issues",
      content: [
        "Troubleshooting guide",
        "System requirements",
        "Known issues",
        "Browser compatibility",
      ],
    },
  ];

  const contactMethods = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      description: "Get help via email",
      action: "support@myvge.co.uk",
      buttonText: "Send Email",
      onClick: () => (window.location.href = "mailto:support@myvge.co.uk"),
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone Support",
      description: "Speak to our team",
      action: "0800 123 4567",
      buttonText: "Call Now",
      onClick: () => (window.location.href = "tel:08001234567"),
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Live Chat",
      description: "Chat with our support team",
      action: "Available 24/7",
      buttonText: "Start Chat",
      onClick: () => alert("Live chat feature coming soon!"),
    },
  ];

  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");

  return (
    <PageTransition>
      <Layout>
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the help you need with our comprehensive support resources
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-2">
                    {category.icon}
                    <div>
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.content.map((item, i) => (
                        <li key={i} className="text-sm">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-card shadow rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Contact Support</h2>
                <p className="text-muted-foreground">
                  Choose your preferred method of contact
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactMethods.map((method, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mb-4 flex justify-center">
                        {method.icon}
                      </div>
                      <h3 className="font-semibold mb-2">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {method.description}
                      </p>
                      <p className="text-sm font-medium mb-4">
                        {method.action}
                      </p>
                      <Button onClick={method.onClick} className="w-full">
                        {method.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
