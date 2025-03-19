-- DIAGNOSTIC SECTION: Show information about current database
SELECT current_database() as current_database;
SELECT current_setting('role') as current_role;

-- Show if scraper_cache table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'scraper_cache'
) as scraper_cache_table_exists;

-- Drop table if it exists and we want to recreate it (comment out if you don't want to drop)
-- DROP TABLE IF EXISTS public.scraper_cache;

-- Create the scraper_cache table
CREATE TABLE IF NOT EXISTS public.scraper_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS scraper_cache_key_idx ON public.scraper_cache (key);
CREATE INDEX IF NOT EXISTS scraper_cache_created_at_idx ON public.scraper_cache (created_at);

-- Create function to purge expired cache entries
CREATE OR REPLACE FUNCTION purge_expired_cache() 
RETURNS integer 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count integer;
BEGIN
  -- Delete cache entries older than the specified TTL (12 hours by default)
  DELETE FROM public.scraper_cache
  WHERE created_at < (now() - interval '12 hours');
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Create function to mark properties as inactive
CREATE OR REPLACE FUNCTION mark_property_inactive(property_id text) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cache_key text;
  cache_data jsonb;
BEGIN
  -- Find all cache entries that might contain this property
  FOR cache_key, cache_data IN 
    SELECT key, data FROM public.scraper_cache
    WHERE key LIKE 'rightmove:search:%'
  LOOP
    -- Update the property's is_active status in the cache
    WITH properties AS (
      SELECT jsonb_array_elements(data->'properties') AS property
    )
    UPDATE public.scraper_cache
    SET data = jsonb_set(
      data,
      '{properties}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN property->>'id' = property_id THEN 
              jsonb_set(property, '{is_active}', 'false')
            ELSE property
          END
        )
        FROM properties
      )
    )
    WHERE key = cache_key
    AND data->'properties' @> json_build_array(json_build_object('id', property_id))::jsonb;
  END LOOP;
END;
$$;

-- Create a simple test function to verify RPC works
CREATE OR REPLACE FUNCTION test_table_creation() 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN true;
END;
$$;

-- Create RPC function that app can call to set up the table
CREATE OR REPLACE FUNCTION create_scraper_cache_table() 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the scraper_cache table
  CREATE TABLE IF NOT EXISTS public.scraper_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  
  -- Add indexes
  CREATE INDEX IF NOT EXISTS scraper_cache_key_idx ON public.scraper_cache (key);
  CREATE INDEX IF NOT EXISTS scraper_cache_created_at_idx ON public.scraper_cache (created_at);
  
  -- Set up RLS and policies
  ALTER TABLE public.scraper_cache ENABLE ROW LEVEL SECURITY;
  
  -- Check if policy exists before creating it
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'scraper_cache' 
    AND policyname = 'Allow authenticated users to read/write cache'
  ) THEN
    CREATE POLICY "Allow authenticated users to read/write cache"
      ON public.scraper_cache
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
  
  -- Also create policy for public access (if needed)
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'scraper_cache' 
    AND policyname = 'Allow public read access to cache'
  ) THEN
    CREATE POLICY "Allow public read access to cache"
      ON public.scraper_cache
      FOR SELECT
      TO anon
      USING (true);
  END IF;
  
  RETURN true;
END;
$$;

-- Grant necessary permissions
ALTER TABLE public.scraper_cache ENABLE ROW LEVEL SECURITY;

-- Create/update policies
DROP POLICY IF EXISTS "Allow authenticated users to read/write cache" ON public.scraper_cache;
CREATE POLICY "Allow authenticated users to read/write cache"
  ON public.scraper_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add public read access policy
DROP POLICY IF EXISTS "Allow public read access to cache" ON public.scraper_cache;
CREATE POLICY "Allow public read access to cache"
  ON public.scraper_cache
  FOR SELECT
  TO anon
  USING (true);

-- Insert a test record
INSERT INTO public.scraper_cache (key, data, created_at)
VALUES 
  ('test-init-record', 
   jsonb_build_object('created', now()::text, 'message', 'Cache table verified'), 
   now())
ON CONFLICT (key) 
DO UPDATE SET data = jsonb_build_object('updated', now()::text, 'message', 'Cache table verified');

-- Validate setup by checking if the table exists and has our test record
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'scraper_cache'
) as table_exists,
EXISTS (
  SELECT FROM public.scraper_cache
  WHERE key = 'test-init-record'
) as test_record_exists; 