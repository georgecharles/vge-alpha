-- Create waitlist table for storing prospective user emails
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited BOOLEAN DEFAULT FALSE,
  invited_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Add RLS policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow insertions from anonymous users (for the waitlist signup)
CREATE POLICY "Allow anonymous signups" ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only allow authenticated users with admin access to read the waitlist
CREATE POLICY "Allow admins to read waitlist" ON public.waitlist
  FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'is_admin' = 'true');

-- Only allow authenticated users with admin access to update/delete waitlist
CREATE POLICY "Allow admins to manage waitlist" ON public.waitlist
  FOR ALL
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'is_admin' = 'true');

-- Add indexes for performance
CREATE INDEX idx_waitlist_email ON public.waitlist (email);
CREATE INDEX idx_waitlist_invited ON public.waitlist (invited); 