-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'joined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view waitlist
CREATE POLICY "Authenticated users can view waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to add to waitlist
CREATE POLICY "Authenticated users can add to waitlist"
  ON waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update waitlist entries they created
CREATE POLICY "Authenticated users can update their entries"
  ON waitlist
  FOR UPDATE
  TO authenticated
  USING (invited_by = auth.uid());

-- Allow unauthenticated users to add to waitlist
CREATE POLICY "Public can add to waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create function to update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_waitlist_updated_at
BEFORE UPDATE ON waitlist
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);
CREATE INDEX IF NOT EXISTS waitlist_status_idx ON waitlist (status); 