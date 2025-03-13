import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that the environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing from environment variables');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Export a function to check if a user is currently authenticated
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Debug function to log the current user
export const debugCurrentUser = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    console.log('Current session:', data.session);
    console.log('Current user:', data.session?.user);
    return data.session?.user;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}; 