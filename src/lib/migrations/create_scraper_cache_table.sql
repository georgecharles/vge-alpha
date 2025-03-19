-- Create the scraper_cache table for storing cached property search results
CREATE TABLE IF NOT EXISTS public.scraper_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add an index on the key for faster lookups
CREATE INDEX IF NOT EXISTS scraper_cache_key_idx ON public.scraper_cache (key);

-- Add an index on created_at for faster expiration checks
CREATE INDEX IF NOT EXISTS scraper_cache_created_at_idx ON public.scraper_cache (created_at);

-- Create a function to purge expired cache entries
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

-- Create a function to mark a property as inactive
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