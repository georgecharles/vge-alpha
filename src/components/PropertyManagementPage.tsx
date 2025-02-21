import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import { Button } from "./ui/button";

const managementServices = [
  {
    title: "Tenant Screening",
    description: "Comprehensive tenant screening to ensure reliable renters.",
  },
  {
    title: "Rent Collection",
    description: "Hassle-free rent collection with automated reminders.",
  },
  {
    title: "Property Maintenance",
    description: "Regular maintenance and prompt repairs to keep your property in top condition.",
  },
  {
    title: "Financial Reporting",
    description: "Detailed financial reports to track your investment performance.",
  },
];

export default function PropertyManagementPage() {
  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="Property Management Services"
          subtitle="Let us take care of your property, so you can focus on what matters most."
          backgroundImage="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                Comprehensive Property Management
              </h1>
              <p className="text-2x1 foreground">
                We offer a full range of property management services to
                maximize your investment returns.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Services</h2>
              <ul className="list-disc list-inside">
                {managementServices.map((service, index) => (
                  <li key={index}>
                    <strong>{service.title}</strong>: {service.description}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Why Choose Us?</h2>
              <p>
                With years of experience in the property market, we understand
                the unique challenges and opportunities that property owners
                face. Our dedicated team is committed to providing exceptional
                service and maximizing your rental income.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Get in Touch</h2>
              <p>
                We'd love to hear from you! Contact us to learn more about our
                services or to discuss your investment needs.
              </p>
              <Button>Contact Us</Button>
            </section>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
