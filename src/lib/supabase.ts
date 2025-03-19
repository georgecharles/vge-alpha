import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL status:", supabaseUrl ? "✅ URL defined" : "❌ URL missing");
console.log("Supabase Key status:", supabaseAnonKey ? "✅ Key defined" : "❌ Key missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.error("Please check your .env.local file and ensure it contains:");
  console.error("VITE_SUPABASE_URL=https://your-project.supabase.co");
  console.error("VITE_SUPABASE_ANON_KEY=your-anon-key");
  throw new Error("Missing Supabase environment variables");
}

// Create and configure the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    // Add headers for better debugging
    headers: {
      'x-client-info': 'vge-property-app'
    }
  },
  db: {
    schema: 'public'
  }
});

// Log successful client creation
console.log("Supabase client initialized");

// Function to test Supabase connection and permissions
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    console.log("Testing Supabase connection...");
    
    // Test 1: Check if we can get the user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return { 
        success: false, 
        message: "Failed to get user session", 
        details: sessionError 
      };
    }
    
    const isAuthenticated = !!sessionData.session;
    console.log("Authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated");
    
    // Test 2: Try to get the Supabase version (should work without auth)
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.warn("Version check failed:", versionError);
    } else {
      console.log("Supabase version:", versionData);
    }
    
    // Test 3: Get list of tables in public schema
    const { data: tablesData, error: tablesError } = await supabase.from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);
      
    if (tablesError) {
      console.warn("Failed to get table list:", tablesError);
    } else {
      console.log("Available tables:", tablesData);
    }
    
    // Test 4: Try a simple select from scraper_cache
    let cacheExists = false;
    try {
      const { data: cacheData, error: cacheError } = await supabase
        .from('scraper_cache')
        .select('count(*)')
        .limit(1)
        .single();
        
      if (!cacheError) {
        console.log("scraper_cache table exists!");
        cacheExists = true;
      } else if (cacheError.code === '42P01') {
        console.log("scraper_cache table does not exist");
      } else {
        console.warn("Error checking scraper_cache:", cacheError);
      }
    } catch (err) {
      console.error("Exception checking scraper_cache:", err);
    }
    
    return { 
      success: true, 
      message: "Supabase connection diagnostic completed", 
      details: { 
        isAuthenticated,
        sessionExists: !!sessionData.session,
        user: sessionData.session?.user?.email || "Not authenticated",
        cacheTableExists: cacheExists
      } 
    };
  } catch (error) {
    console.error("Unexpected error testing Supabase connection:", error);
    return { 
      success: false, 
      message: "Unexpected error testing Supabase connection", 
      details: error 
    };
  }
};
