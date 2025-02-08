import React from "react";
import Header from "./Header";
import { useAuth } from "../lib/auth";
import { Card, CardContent } from "./ui/card";
import { Calendar, Clock } from "lucide-react";

interface ArticlePageProps {
  title: string;
  content: string;
  date: string;
  readTime?: string;
}

export function ArticlePage({
  title = "Understanding the Current Real Estate Market",
  content = "Default content",
  date = new Date().toISOString(),
  readTime = "5 min read",
}: ArticlePageProps) {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={!!user} userProfile={profile || undefined} />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>

              <div className="flex items-center gap-4 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readTime}</span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                {content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
