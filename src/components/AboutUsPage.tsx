import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import { Layout } from "./Layout";
import { PageTransition } from "./ui/page-transition";
import { Button } from "./ui/button";

export default function AboutUsPage() {
  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="About MyVGE"
          subtitle="Learn more about our mission and our team"
          backgroundImage="https://images.unsplash.com/photo-1507585495646-50c2b6dbd483?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Our Story</h1>
              <p className="text-muted-foreground">
                MyVGE is dedicated to providing property investors with the
                tools and insights they need to succeed.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p>
                To empower property investors with comprehensive data, expert
                analysis, and innovative tools to make informed decisions and
                achieve their financial goals. We are committed to ethical
                practices, diversity, and transparency in all our operations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Values</h2>
              <ul className="list-disc list-inside">
                <li>
                  **Ethical Practices:** We adhere to the highest ethical
                  standards in all our dealings, ensuring fairness and
                  integrity.
                </li>
                <li>
                  **Diversity:** We embrace diversity and inclusion, fostering
                  a welcoming environment for all.
                </li>
                <li>
                  **Transparency:** We are committed to open and honest
                  communication, providing clear and accurate information to our
                  users.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Team</h2>
              <p>
                Our team consists of experienced property professionals, data
                scientists, and technology experts who are passionate about
                helping investors navigate the complexities of the real estate
                market. We are a diverse group of individuals with a shared
                commitment to excellence.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact Us</h2>
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