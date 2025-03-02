import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure the URL is valid and includes the protocol
const validUrl = supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : `https://${supabaseUrl}`;

export const supabase = createClient(validUrl, supabaseAnonKey); 