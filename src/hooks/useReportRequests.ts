import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Tables } from '../types/supabase';

export type ReportRequest = Tables<'report_requests'>;
type ReportRequestWithUser = ReportRequest & {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export const useReportRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportRequestWithUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchReportRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First, try to fetch using the simple .eq approach
      const { data, error } = await supabase
        .from('report_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Then, get profile info separately and combine
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.warn('Error fetching profile data:', profileError);
      }
      
      // Combine the data
      const reportsWithProfiles = data.map(report => ({
        ...report,
        profiles: profileData ? {
          full_name: profileData.full_name,
          email: profileData.email
        } : null
      }));
      
      setReports(reportsWithProfiles);
    } catch (err: any) {
      console.error('Error fetching report requests:', err);
      setError(err.message || 'Failed to load report requests');
    } finally {
      setLoading(false);
    }
  };

  const createReportRequest = async (title: string, description: string) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('report_requests')
        .insert([
          { 
            user_id: user.id,
            title,
            description
          }
        ])
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Refresh the list
      await fetchReportRequests();
      
      return data;
    } catch (err: any) {
      console.error('Error creating report request:', err);
      setError(err.message || 'Failed to create report request');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the report details to get the file URL
      const { data: report, error: reportError } = await supabase
        .from('report_requests')
        .select('file_url, file_name')
        .eq('id', reportId)
        .eq('user_id', user?.id)
        .single();
      
      if (reportError) throw reportError;
      
      if (!report?.file_url) {
        throw new Error('No file is available for download');
      }
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = report.file_url;
      link.download = report.file_name || 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (err: any) {
      console.error('Error downloading report:', err);
      setError(err.message || 'Failed to download report');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // For admin functionality - get all reports 
  const getAllReportRequests = async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      // First get all reports
      const { data, error } = await supabase
        .from('report_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Then get all profiles to join manually
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');
        
      if (profilesError) {
        console.warn('Error fetching profiles data:', profilesError);
      }
      
      // Create a map of profiles by id for quick lookup
      const profilesMap = (profilesData || []).reduce((map, profile) => {
        if (profile.id) {
          map[profile.id] = profile;
        }
        return map;
      }, {} as Record<string, typeof profilesData[0]>);
      
      // Join reports with profiles
      const reportsWithProfiles = data.map(report => ({
        ...report,
        profiles: report.user_id && profilesMap[report.user_id] 
          ? {
              full_name: profilesMap[report.user_id].full_name,
              email: profilesMap[report.user_id].email
            }
          : null
      }));
      
      return reportsWithProfiles;
    } catch (err: any) {
      console.error('Error fetching all report requests:', err);
      setError(err.message || 'Failed to load all report requests');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // For admin functionality - update report status
  const updateReportStatus = async (reportId: string, status: ReportRequest['status'], notes?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const updates: any = { status };
      
      if (notes) {
        updates.notes = notes;
      }
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('report_requests')
        .update(updates)
        .eq('id', reportId);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchReportRequests();
      
      return true;
    } catch (err: any) {
      console.error('Error updating report status:', err);
      setError(err.message || 'Failed to update report status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload file to Supabase storage and link it to the report
  const uploadReportFile = async (reportId: string, file: File) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('report_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('report_files')
        .getPublicUrl(filePath);
      
      // Update the report record with the file URL
      const { error: updateError } = await supabase
        .from('report_requests')
        .update({
          file_url: publicUrl,
          file_name: file.name,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (updateError) throw updateError;
      
      // Refresh the list
      await fetchReportRequests();
      
      return true;
    } catch (err: any) {
      console.error('Error uploading report file:', err);
      setError(err.message || 'Failed to upload report file');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load reports when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchReportRequests();
    }
  }, [user]);

  return {
    reports,
    loading,
    error,
    fetchReportRequests,
    createReportRequest,
    downloadReport,
    getAllReportRequests,
    updateReportStatus,
    uploadReportFile
  };
}; 