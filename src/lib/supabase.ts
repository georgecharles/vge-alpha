import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zcuapuvvygahkzljuhyg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWFwdXZ2eWdhaGt6bGp1aHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTQwMzcsImV4cCI6MjA1MzQ5MDAzN30.GIhphzkznmDXgrUApGW479uHHluqDWqy_9cfG5sU5Xc";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "my-vge-auth",
    storage: window.localStorage,
  },
});
