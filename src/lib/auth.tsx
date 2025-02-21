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
      fetchProfile: (userId: string) => Promise<void>;
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export function AuthProvider({ children }: { children: React.ReactNode }) {
      const [profile, setProfile] = useState<Profile | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const navigate = useNavigate();
      const { user: clerkUser, isSignedIn, signOut: clerkSignOut, isLoaded } = useClerk();

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


      useEffect(() => {
        console.log("AuthProvider useEffect - START");
        setIsLoading(true); // Set isLoading to true when auth state changes

        const initAuth = async () => {
          if (isSignedIn && clerkUser) {
            setUser(clerkUser);
            await fetchProfile(clerkUser.id);
          } else {
            setUser(null);
            setProfile(null);
            setIsLoading(false); // Set isLoading to false when not signed in
          }
        };

        initAuth();
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
