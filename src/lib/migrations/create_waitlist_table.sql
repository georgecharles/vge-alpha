-- Creates a waitlist table for collecting interested user emails
-- Run this in the Supabase SQL Editor

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited BOOLEAN DEFAULT FALSE,
  invited_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert into waitlist (for signup form)
CREATE POLICY "Allow anonymous signups"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view waitlist entries
CREATE POLICY "Authenticated users can view waitlist"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update waitlist entries
CREATE POLICY "Authenticated users can update waitlist"
  ON public.waitlist
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email); 