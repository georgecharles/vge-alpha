import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useReportRequests, ReportRequest } from '../hooks/useReportRequests';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
import { useToast } from '../components/ui/use-toast';
import { 
  Clock, 
  Upload, 
  FileText, 
  User, 
  AlertCircle, 
  Loader2, 
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../components/ui/badge';

// Define a type that extends ReportRequest to include the user profiles
type ReportRequestWithProfiles = ReportRequest & {
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function AdminReports() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    loading, 
    error, 
    getAllReportRequests,
    updateReportStatus,
    uploadReportFile
  } = useReportRequests();
  
  const [reports, setReports] = useState<ReportRequestWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportRequestWithProfiles | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportRequest['status'] | 'all'>('all');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<ReportRequest['status']>('pending');

  // Check if user is admin
  useEffect(() => {
    if (user && profile) {
      const isAdmin = profile.role === 'admin' || user.app_metadata?.role === 'admin';
      if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [user, profile, navigate, toast]);

  // Load all report requests
  useEffect(() => {
    const loadReports = async () => {
      const isAdmin = profile?.role === 'admin' || user?.app_metadata?.role === 'admin';
      if (user && isAdmin) {
        setIsLoading(true);
        const allReports = await getAllReportRequests();
        setReports(allReports);
        setIsLoading(false);
      }
    };
    
    loadReports();
  }, [user, profile, getAllReportRequests]);

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedReport) return;
    
    try {
      const success = await updateReportStatus(selectedReport.id, newStatus, notes);
      
      if (success) {
        toast({
          title: "Status updated",
          description: `Report status has been updated to ${newStatus}.`,
        });
        
        // Refresh reports list
        const allReports = await getAllReportRequests();
        setReports(allReports);
        
        setUpdateDialogOpen(false);
        setNotes('');
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err: any) {
      toast({
        title: "Error updating status",
        description: err.message || "There was a problem updating the report status.",
        variant: "destructive",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedReport || !selectedFile) return;
    
    try {
      const success = await uploadReportFile(selectedReport.id, selectedFile);
      
      if (success) {
        toast({
          title: "File uploaded",
          description: "The report file has been uploaded successfully.",
        });
        
        // Refresh reports list
        const allReports = await getAllReportRequests();
        setReports(allReports);
        
        setUploadDialogOpen(false);
        setSelectedFile(null);
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (err: any) {
      toast({
        title: "Error uploading file",
        description: err.message || "There was a problem uploading the report file.",
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

  // Filter reports based on status
  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === statusFilter);

  // Render a message if the user is not an admin
  if (!user || (profile?.role !== 'admin' && user.app_metadata?.role !== 'admin')) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Reports Dashboard</CardTitle>
            <CardDescription>
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please log in with an admin account to manage report requests.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Report Requests Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and process user research report requests
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle>Report Requests</CardTitle>
          <CardDescription>
            Manage user research report requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No report requests found</p>
              <p className="mt-1">There are no report requests matching your filter criteria</p>
            </div>
          ) : (
            <Table>
              <TableCaption>List of report requests</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium max-w-[280px] truncate">
                      {report.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>
                          {report.profiles?.full_name || report.profiles?.email || 'Unknown user'}
                        </span>
                      </div>
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
                                    <p className="text-sm font-semibold">User:</p>
                                    <p className="text-sm">
                                      {report.profiles?.full_name || 'No name'} ({report.profiles?.email || 'No email'})
                                    </p>
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
                                  
                                  {report.file_url && (
                                    <div>
                                      <p className="text-sm font-semibold">File:</p>
                                      <p className="text-sm">
                                        <a 
                                          href={report.file_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:underline"
                                        >
                                          {report.file_name || 'View uploaded file'}
                                        </a>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report);
                            setNewStatus(report.status);
                            setNotes(report.notes || '');
                            setUpdateDialogOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setUploadDialogOpen(true);
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Update the status of the report request and add notes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Report Title
              </label>
              <p className="text-sm text-muted-foreground">
                {selectedReport?.title}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Status
              </label>
              <p className="text-sm text-muted-foreground">
                {selectedReport?.status}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                New Status
              </label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Admin Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the report status, progress, or any additional information..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleStatusChange}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Upload File Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Report File</DialogTitle>
            <DialogDescription>
              Upload a file for the requested report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Report Title
              </label>
              <p className="text-sm text-muted-foreground">
                {selectedReport?.title}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                File
              </label>
              <div className="mt-2">
                <input
                  type="file"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported file types: PDF, DOCX, XLSX, PNG, JPG
              </p>
            </div>
            
            {selectedFile && (
              <div>
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Uploading a file will automatically set the report status to "completed".
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleFileUpload}
              disabled={!selectedFile}
            >
              Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 