import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "../types/supabase";
import { GoogleSignupModal } from "../components/GoogleSignupModal";
import { useToast } from '../components/ui/use-toast';

// Add TypeScript declaration for import.meta.env
declare global {
  interface ImportMeta {
    env: {
      MODE: string;
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      [key: string]: string | undefined;
    };
  }
}

type Profile = Tables<"profiles">;

interface AuthContextType {
  session: User | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSession?: () => Promise<void>; // Add this for compatibility with App.tsx
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const redirectUrl = import.meta.env.MODE === 'production' 
  ? 'https://myvge.com/auth/callback'
  : 'http://localhost:5173/auth/callback';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Update the profile selection fields everywhere
  const PROFILE_SELECT = `
    *,
    subscription_tier,
    subscription_status,
    avatar_url
  `;

  async function fetchProfile(userId: string) {
    try {
      console.log('Fetching profile for user:', userId);
      console.log('Using Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        console.error("Supabase config:", {
          url: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });
        setProfile(null);
        return;
      }

      console.log("Fetched profile data:", profile);
      setProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  }

  // Add refreshSession function for compatibility with App.tsx
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          setSession(sessionData.session.user);
          setUser(sessionData.session.user);
          // Update this query
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select(PROFILE_SELECT)
            .eq('id', sessionData.session.user.id)
            .single();

          console.log('Initial profile load:', existingProfile);
          setProfile(existingProfile);
        }
        setIsLoading(false);

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state change:', event, newSession);
            
            if (mounted) {
              if (newSession?.user) {
                setUser(newSession.user);
                
                // Update this query
                const { data: profile } = await supabase
                  .from('profiles')
                  .select(PROFILE_SELECT)
                  .eq('id', newSession.user.id)
                  .single();

                console.log('Profile after auth change:', profile);
                setProfile(profile);
              } else {
                setUser(null);
                setProfile(null);
              }
              setIsLoading(false);
            }
          }
        );

        return () => {
          mounted = false;
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  // Update the Google redirect handler
  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Error getting session:', error);
      
      if (session?.user) {
        // Update this query
        const { data: profile } = await supabase
          .from('profiles')
          .select(PROFILE_SELECT)
          .eq('id', session.user.id)
          .single();

        console.log('Profile after Google redirect:', profile);
        setProfile(profile);
      }
    };

    if (window.location.hash.includes('access_token')) {
      handleRedirect();
    }
  }, []);

  // Add a session recovery effect
  useEffect(() => {
    const recoverSession = async () => {
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      }
    };

    recoverSession();
  }, [user]);

  async function signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create the profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          full_name: `${firstName} ${lastName}`,
          role: "user",
          subscription_tier: "free",
          subscription_status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error details:", error);
        if (error.message.includes("Email not confirmed")) {
          throw new Error(
            "Please confirm your email address before signing in.",
          );
        }
        throw error;
      }

      // After successful sign in, fetch the profile
      if (data.user) {
        await fetchProfile(data.user.id); // Simplified
      }

      return data.user;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      
      // Clear auth state
      setUser(null);
      setProfile(null);
      
      // Clear storage
      window.localStorage.clear(); // Clear all localStorage
      
      // Redirect
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { useAuth };
