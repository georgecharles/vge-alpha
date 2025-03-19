import React, { useState } from 'react';
// import { Helmet } from 'react-helmet';  // We'll remove this line temporarily until the package is installed
import { useAuth } from '../lib/auth';
import { useReportRequests, ReportRequest } from '../hooks/useReportRequests';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../components/ui/form';
import { useToast } from '../components/ui/use-toast';
import { 
  Clock, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  PlusCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '../components/ui/badge';

// Form schema for creating a new report request
const reportRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters"),
});

type ReportRequestFormValues = z.infer<typeof reportRequestSchema>;

export default function ResearchAndReports() {
  const { user, profile } = useAuth();
  const { 
    reports, 
    loading, 
    error, 
    createReportRequest, 
    downloadReport,
    fetchReportRequests 
  } = useReportRequests();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ReportRequestFormValues>({
    resolver: zodResolver(reportRequestSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: ReportRequestFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to request a report.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await createReportRequest(data.title, data.description);
      
      if (result) {
        toast({
          title: "Report request submitted",
          description: "Your research report request has been submitted successfully.",
        });
        
        form.reset();
        setIsRequestDialogOpen(false);
      } else {
        throw new Error("Failed to create report request");
      }
    } catch (err: any) {
      toast({
        title: "Error submitting request",
        description: err.message || "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const success = await downloadReport(reportId);
      
      if (!success) {
        toast({
          title: "Download failed",
          description: "The report file couldn't be downloaded. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error downloading report",
        description: err.message || "There was a problem downloading the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to get badge color based on status
  const getStatusBadge = (status: ReportRequest['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  // Render a message if the user is not logged in
  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Research & Reports</CardTitle>
            <CardDescription>
              You need to be logged in to access research reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please log in or create an account to request and view property research reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* <Helmet>
        <title>Research & Reports | VGE Alpha</title>
        <meta name="description" content="Request and download custom property market research reports for your investment analysis." />
      </Helmet> */}

      <div className="container mx-auto py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Research & Reports</h1>
            <p className="text-muted-foreground mt-1">
              Request custom research reports for your property investment analysis
            </p>
          </div>
          
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>Request New Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request a Research Report</DialogTitle>
                <DialogDescription>
                  Provide details about the research report you need for your property investment analysis.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Manchester Rental Market Analysis" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A clear title describing the report you need
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe in detail what information you need in this report..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about the property types, locations, and metrics you want analyzed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsRequestDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle>Your Report Requests</CardTitle>
            <CardDescription>
              View the status of your research report requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No report requests yet</p>
                <p className="mt-1">Request your first research report to get started</p>
              </div>
            ) : (
              <Table>
                <TableCaption>List of your report requests</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium max-w-[280px] truncate">
                        {report.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Details
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{report.title}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  <div className="space-y-4 mt-2">
                                    <div>
                                      <p className="text-sm font-semibold">Status: {report.status}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Requested: {new Date(report.created_at).toLocaleDateString()}, {new Date(report.created_at).toLocaleTimeString()}
                                      </p>
                                      {report.completed_at && (
                                        <p className="text-sm text-muted-foreground">
                                          Completed: {new Date(report.completed_at).toLocaleDateString()}, {new Date(report.completed_at).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-semibold">Description:</p>
                                      <p className="text-sm whitespace-pre-line">{report.description}</p>
                                    </div>
                                    
                                    {report.notes && (
                                      <div>
                                        <p className="text-sm font-semibold">Admin Notes:</p>
                                        <p className="text-sm whitespace-pre-line">{report.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                                {report.status === 'completed' && report.file_url && (
                                  <AlertDialogAction asChild>
                                    <Button onClick={() => handleDownloadReport(report.id)}>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Report
                                    </Button>
                                  </AlertDialogAction>
                                )}
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          {report.status === 'completed' && report.file_url && (
                            <Button 
                              size="sm" 
                              onClick={() => handleDownloadReport(report.id)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Information about report types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive analysis of property markets in specific locations, including price trends, rental yields, and growth forecasts.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Investment Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed comparison of investment potential across different property types and locations to help you make informed decisions.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Custom Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tailored research based on your specific investment criteria, including demographic analysis, regulatory insights, and more.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 