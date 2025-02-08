import React from "react";
import { Layout } from "./Layout";
import HeroSection from "./HeroSection";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { PageTransition } from "./ui/page-transition";

export default function BlogPage() {
  const { user, profile } = useAuth();

  const blogPosts = [
    {
      title: "Understanding Property Market Cycles",
      excerpt:
        "A comprehensive guide to property market cycles and how to identify market phases for optimal investment timing.",
      category: "Market Analysis",
      date: "2024-03-20",
      readTime: "8 min read",
      image:
        "https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3",
    },
    {
      title: "Buy-to-Let Investment Strategy Guide",
      excerpt:
        "Expert insights into creating a successful buy-to-let investment strategy in today's market conditions.",
      category: "Investment",
      date: "2024-03-18",
      readTime: "10 min read",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3",
    },
    {
      title: "Property Tax Changes in 2024",
      excerpt:
        "Stay updated with the latest property tax regulations and how they affect property investors and homeowners.",
      category: "Legal",
      date: "2024-03-15",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3",
    },
  ];

  return (
    <PageTransition>
      <Layout>
        <HeroSection
          title="Property Investment Blog"
          subtitle="Expert insights and analysis on the UK property market"
          backgroundImage="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3"
          showSearch={false}
          showStats={false}
          height="h-[400px]"
        />
        <main className="container mx-auto px-4 py-8 pt-24 sm:pt-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <Card
                  key={index}
                  className="flex flex-col h-full hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground">
                      {post.category}
                    </span>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="group hover:text-primary"
                        onClick={() => {
                          window.location.href = `/blog/${post.title.toLowerCase().replace(/ /g, "-")}`;
                        }}
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </Layout>
    </PageTransition>
  );
}
