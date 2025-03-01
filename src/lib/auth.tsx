import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "../types/supabase";
import { GoogleSignupModal } from "../components/GoogleSignupModal";

type Profile = Tables<"profiles">;

interface AuthContextType {
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const redirectUrl = import.meta.env.MODE === 'production' 
  ? 'https://myvge.com/auth/callback'
  : 'http://localhost:5173/auth/callback';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoogleSignupModal, setShowGoogleSignupModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);

  async function fetchProfile(userId: string) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, avatar_url")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setProfile(null);
        return;
      }

      console.log("Fetched profile:", profile);
      setProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Check if profile exists for this user
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!existingProfile) {
              // New user from Google sign-in
              console.log('New Google user detected');
              setPendingGoogleUser(session.user);
              setShowGoogleSignupModal(true);
            } else {
              setProfile(existingProfile);
            }
          }
          setIsLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, session);
            
            if (mounted) {
              if (session?.user) {
                setUser(session.user);
                
                // Check if profile exists
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (!profile && event === 'SIGNED_IN') {
                  console.log('New Google user detected on auth change');
                  setPendingGoogleUser(session.user);
                  setShowGoogleSignupModal(true);
                } else {
                  setProfile(profile);
                }
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
          subscription.unsubscribe();
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

  // Add this effect to handle Google redirect
  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Error getting session:', error);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          console.log('New Google user detected after redirect');
          setPendingGoogleUser(session.user);
          setShowGoogleSignupModal(true);
        }
      }
    };

    // Check if this is a redirect from Google
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

  const value = {
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showGoogleSignupModal && pendingGoogleUser && (
        <GoogleSignupModal
          isOpen={showGoogleSignupModal}
          onClose={() => {
            setShowGoogleSignupModal(false);
            setPendingGoogleUser(null);
          }}
          googleUser={pendingGoogleUser}
        />
      )}
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
