-- Add role column to profiles table if it doesn't exist

-- First, check if the user_role enum type exists, create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create the enum type
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
    END IF;
END$$;

-- Now add the role column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Create a function to give the first user admin privileges (useful for setup)
CREATE OR REPLACE FUNCTION setup_first_admin()
RETURNS void AS $$
BEGIN
    -- Make the first user an admin
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Run the function to set up the first admin
SELECT setup_first_admin();

-- Create an index on the role column for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role); 