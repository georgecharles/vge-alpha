import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FileText, Download, Calendar, Tag } from "lucide-react";
import { formatDistance } from "date-fns";

interface ResearchReportsProps {
  user?: any;
  profile?: any;
}

const ResearchReports: React.FC<ResearchReportsProps> = ({ user, profile }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch of research reports
    const fetchReports = async () => {
      try {
        setLoading(true);
        // This would be an API call in a real app
        setTimeout(() => {
          setReports([
            {
              id: 1,
              title: "UK Property Market Outlook 2024",
              summary: "Comprehensive analysis of the UK property market trends, investment opportunities, and forecasts for 2024.",
              date: "2024-05-15",
              author: "Property Analysis Team",
              category: "Market Analysis",
              isPremium: true,
              downloadUrl: "#",
            },
            {
              id: 2,
              title: "Regional Investment Hotspots",
              summary: "Detailed report on emerging regional investment opportunities across the UK, with focus on yields and growth potential.",
              date: "2024-04-22",
              author: "Investment Research Division",
              category: "Investment",
              isPremium: true,
              downloadUrl: "#",
            },
            {
              id: 3,
              title: "First-Time Buyer Guide 2024",
              summary: "Essential information and advice for first-time buyers navigating the property market in 2024.",
              date: "2024-03-10",
              author: "Homebuyer Advisory Team",
              category: "Guides",
              isPremium: false,
              downloadUrl: "#",
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching research reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const isSubscriber = profile?.subscription_tier !== "free";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </Card>
            ))
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <Card key={report.id} className="overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{report.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDistance(new Date(report.date), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                {report.isPremium && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    Premium
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {report.summary}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {report.category}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                {report.isPremium && !isSubscriber ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = "/pricing"}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upgrade to Access
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <a href={report.downloadUrl} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports available</h3>
            <p className="text-muted-foreground">
              There are currently no research reports available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchReports;
