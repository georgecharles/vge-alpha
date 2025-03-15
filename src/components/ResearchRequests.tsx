import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileQuestion, Check, Clock, AlertTriangle, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ResearchRequestsProps {
  user?: any;
  profile?: any;
}

const ResearchRequests: React.FC<ResearchRequestsProps> = ({ user, profile }) => {
  const [requestType, setRequestType] = useState<string>("property");
  const [requestDetails, setRequestDetails] = useState<string>("");
  const [requestPriority, setRequestPriority] = useState<string>("standard");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequests, setSubmittedRequests] = useState<any[]>([
    {
      id: 1,
      type: "Market Analysis",
      details: "Detailed analysis of the Leeds property market, focusing on rental yields and capital growth potential in different neighborhoods.",
      priority: "high",
      status: "in-progress",
      submittedAt: "2024-05-01T10:30:00Z",
      estimatedCompletion: "2024-05-08T10:30:00Z"
    },
    {
      id: 2,
      type: "Property",
      details: "Research on the historical price trends and planning permissions for 123 High Street, Manchester, M1 1AA.",
      priority: "standard",
      status: "completed",
      submittedAt: "2024-04-15T14:45:00Z",
      completedAt: "2024-04-20T09:15:00Z"
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: submittedRequests.length + 1,
        type: requestType === "property" ? "Property" : "Market Analysis",
        details: requestDetails,
        priority: requestPriority,
        status: "pending",
        submittedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setSubmittedRequests([newRequest, ...submittedRequests]);
      setRequestDetails("");
      setIsSubmitting(false);
    }, 1500);
  };

  const isSubscriber = profile?.subscription_tier !== "free";
  const canSubmitHighPriority = isSubscriber;
  const requestsRemaining = isSubscriber ? "Unlimited" : "2 / 3";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-semibold">Request Custom Research</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="request-type">Request Type</Label>
                <Select 
                  value={requestType} 
                  onValueChange={setRequestType}
                >
                  <SelectTrigger id="request-type">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Property Research</SelectItem>
                    <SelectItem value="market">Market Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="request-details">Details</Label>
                <Textarea
                  id="request-details"
                  placeholder="Please provide specific details about what you'd like us to research..."
                  rows={5}
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="request-priority">Priority</Label>
                <Select 
                  value={requestPriority} 
                  onValueChange={setRequestPriority}
                  disabled={!canSubmitHighPriority && requestPriority === "high"}
                >
                  <SelectTrigger id="request-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (7 days)</SelectItem>
                    <SelectItem value="high" disabled={!canSubmitHighPriority}>
                      High Priority (3 days)
                      {!canSubmitHighPriority && " - Premium Feature"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Requests remaining this month: <span className="font-medium">{requestsRemaining}</span>
          </div>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={!requestDetails.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Your Research Requests</h3>
        </CardHeader>
        <CardContent>
          {submittedRequests.length > 0 ? (
            <div className="space-y-4">
              {submittedRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileQuestion className="h-4 w-4" />
                        <h4 className="font-medium">{request.type} Request</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{request.details}</p>
                      <div className="text-xs text-muted-foreground">
                        Submitted: {formatDate(request.submittedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="text-sm font-medium capitalize">
                        {request.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                  
                  {request.status === 'in-progress' && (
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      Estimated completion: {formatDate(request.estimatedCompletion)}
                    </div>
                  )}
                  
                  {request.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No requests yet</h3>
              <p className="text-muted-foreground">
                You haven't submitted any research requests yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchRequests; 