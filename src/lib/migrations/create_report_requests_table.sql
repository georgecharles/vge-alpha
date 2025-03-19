-- Creates a report_requests table for storing user research report requests
-- Run this in the Supabase SQL Editor

-- Create the report_requests table
CREATE TABLE IF NOT EXISTS public.report_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.report_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert report requests
CREATE POLICY "Users can create report requests"
  ON public.report_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own report requests
CREATE POLICY "Users can view their own report requests"
  ON public.report_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own report requests (limited fields)
CREATE POLICY "Users can update their own report requests"
  ON public.report_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a function to protect certain fields from user updates
CREATE OR REPLACE FUNCTION check_report_request_update()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if the user is an admin, handling the case where role column might not exist
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_admin;
  EXCEPTION
    WHEN undefined_column THEN
      -- Role column doesn't exist, so no one is an admin yet
      is_admin := FALSE;
  END;

  -- If the user is not an admin, prevent updates to restricted fields
  IF NOT is_admin THEN
    -- Prevent updates to these fields
    NEW.status = OLD.status;
    NEW.file_url = OLD.file_url;
    NEW.file_name = OLD.file_name;
    NEW.completed_at = OLD.completed_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to protect fields during update
CREATE TRIGGER protect_report_request_fields
BEFORE UPDATE ON public.report_requests
FOR EACH ROW
EXECUTE FUNCTION check_report_request_update();

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = uid AND role = 'admin'
    ) INTO result;
  EXCEPTION
    WHEN undefined_column THEN
      -- Role column doesn't exist, so no one is an admin yet
      result := FALSE;
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Allow admins to update all report requests
CREATE POLICY "Admins can update all report requests"
  ON public.report_requests
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create a storage bucket for report files
-- Note: This needs to be run separately if you don't have bucket creation privileges
-- CREATE BUCKET IF NOT EXISTS report_files;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_report_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_report_requests_updated_at
BEFORE UPDATE ON public.report_requests
FOR EACH ROW
EXECUTE FUNCTION update_report_requests_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_report_requests_user_id ON public.report_requests(user_id);
CREATE INDEX idx_report_requests_status ON public.report_requests(status);
CREATE INDEX idx_report_requests_created_at ON public.report_requests(created_at); 