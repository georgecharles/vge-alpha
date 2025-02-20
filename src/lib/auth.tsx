import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "../types/supabase";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProfile(userId: string) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
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
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session); // Keep this for debugging
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        localStorage.removeItem("password-protected"); // Clear password protection
        localStorage.removeItem("supabase.auth.token"); // Clear supabase token
        localStorage.removeItem("supabase.auth.session"); // Clear supabase session
        window.location.href = "/"; // Use window.location.href for redirect
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          emailRedirectTo: "https://myvge.com/auth/callback",
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
          redirectTo: 'https://myvge.com/auth/callback',
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      localStorage.removeItem("password-protected"); // Clear password protection
      localStorage.removeItem("supabase.auth.token"); // Clear supabase session
      localStorage.removeItem("supabase.auth.session"); // Clear supabase session
      window.location.href = "/"; // Use window.location.href for redirect
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
    signInWithGoogle, // Add to context
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { useAuth };
