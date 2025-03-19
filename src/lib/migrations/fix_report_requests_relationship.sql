-- Fix the relationship between report_requests and profiles tables

-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS public.report_requests 
  DROP CONSTRAINT IF EXISTS report_requests_user_id_fkey;

-- Re-add the foreign key constraint to auth.users
ALTER TABLE public.report_requests
  ADD CONSTRAINT report_requests_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create a view that joins report_requests with profiles
CREATE OR REPLACE VIEW report_requests_with_profiles AS
SELECT 
  r.*,
  p.full_name,
  p.email
FROM 
  public.report_requests r
LEFT JOIN 
  public.profiles p ON r.user_id = p.id;

-- Admin policy to view all records (including the joined view)
CREATE POLICY "Admins can view all report requests" ON public.report_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 