import { createContext, useContext, useEffect, useState } from "react";
    import { supabase } from "./supabase";
    import type { Tables } from "../types/supabase";
    import { useNavigate } from "react-router-dom";
    import { useClerk, useUser } from '@clerk/clerk-react';

    type Profile = Tables<"profiles">;

    interface AuthContextType {
      user: any | null; // Clerk's user object
      profile: Profile | null;
      isLoading: boolean;
      signOut: () => Promise<void>;
      fetchProfile: (userId: string) => Promise<void>; // Add fetchProfile to the context
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export function AuthProvider({ children }: { children: React.ReactNode }) {
      const [profile, setProfile] = useState<Profile | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const navigate = useNavigate();
      const { user: clerkUser, isSignedIn, signOut: clerkSignOut, isLoaded } = useClerk();
      const [user, setUser] = useState(null);

      async function fetchProfile(userId: string) {
        console.log("fetchProfile - START", userId);
        try {
          console.log("fetchProfile - querying Supabase");
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          console.log("fetchProfile - query result", profile, profileError);

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
        } finally {
          console.log("fetchProfile - END");
          setIsLoading(false); // Ensure isLoading is set to false after profile fetch attempt
        }
      }

      const initAuth = async (setUser: React.Dispatch<React.SetStateAction<any>>, fetchProfile: (userId: string) => Promise<void>) => {
        setIsLoading(true);
        try {
          if (isSignedIn && clerkUser) {
            setUser(clerkUser);
            await fetchProfile(clerkUser.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
        } finally {
          setIsLoading(false);
        }
      };

      useEffect(() => {
        console.log("useEffect - AuthProvider - START");
        initAuth(setUser, fetchProfile);

        return () => {
          console.log("useEffect - AuthProvider - CLEANUP");
        };
      }, [isSignedIn, clerkUser]);

      async function signOut() {
        console.log("signOut - START");
        try {
          await clerkSignOut();
          setUser(null);
          setProfile(null);
          localStorage.removeItem("password-protected");
          navigate("/"); // Use navigate for redirect
        } catch (error) {
          console.error("Sign out error:", error);
          throw error;
        } finally {
          console.log("signOut - END");
        }
      }

      const value = {
        user: clerkUser,
        profile,
        isLoading,
        signOut,
        fetchProfile,
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
