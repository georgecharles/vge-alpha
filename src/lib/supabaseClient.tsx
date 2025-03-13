import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Initialize the database by creating required tables if they don't exist
export async function initializeDatabase() {
  try {
    // Check if we have admin privileges
    const { data: hasPrivileges, error: privError } = await supabase.rpc('check_admin_privileges');
    
    if (privError) {
      console.log('Unable to check privileges or insufficient privileges:', privError);
      return;
    }
    
    if (hasPrivileges) {
      // Create SQL function to create market_insights table
      await supabase.rpc('create_market_insights_table');
      console.log('Database initialization completed successfully');
    } else {
      console.log('Insufficient privileges to create tables automatically');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Call once when the application starts
// Comment this out if it causes issues - user might not have privileges
// initializeDatabase();

// Export SQL for creating the table - to be executed by an admin
export const CREATE_MARKET_INSIGHTS_TABLE_SQL = `
-- Function to create the market_insights table
CREATE OR REPLACE FUNCTION create_market_insights_table()
RETURNS VOID AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'market_insights'
  ) THEN
    -- Create the table
    CREATE TABLE public.market_insights (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      content TEXT NOT NULL,
      generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add appropriate indexes
    CREATE INDEX market_insights_generated_at_idx ON public.market_insights (generated_at);
    
    -- Set up RLS (Row Level Security)
    ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow anonymous read access" 
      ON public.market_insights FOR SELECT 
      USING (true);
      
    CREATE POLICY "Allow authenticated insert" 
      ON public.market_insights FOR INSERT 
      TO authenticated 
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if the user has admin privileges
CREATE OR REPLACE FUNCTION check_admin_privileges()
RETURNS BOOLEAN AS $$
BEGIN
  -- Try to create a temporary table as a privilege check
  BEGIN
    CREATE TEMPORARY TABLE privilege_check (id INT);
    DROP TABLE privilege_check;
    RETURN TRUE;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql;
`;

// Usage instructions for the SQL:
// 1. Log into the Supabase dashboard
// 2. Go to the SQL Editor
// 3. Paste the SQL above and run it
// 4. This will create functions that can be called to create the required tables 