import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { User, Session } from '@supabase/supabase-js';

// Define the types for our user profile
export type UserProfile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  created_at?: string;
  role?: "user" | "admin" | "moderator" | null;
  stripe_customer_id?: string | null;
  subscription_status?: string | null;
  subscription_tier?: "free" | "basic" | "pro" | "premium" | null;
  updated_at?: string;
  avatar_url?: string | null;
};

// Type for our auth context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {}
});

// Helper function to fetch user profile
const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    console.log('Fetched profile data:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('Error in fetchProfile:', error);
    return null;
  }
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh the session and user data
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      console.log('Refreshing session...');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      console.log('Session data:', data);
      setSession(data.session);
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize and set up auth listener
  useEffect(() => {
    // First, get the current session
    const initializeAuth = async () => {
      setIsLoading(true);
      console.log('Initializing auth...');
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log('Initial session data:', data);
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          const profile = await fetchProfile(data.session.user.id);
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
      
      // Set up the auth state change listener
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
      });
      
      // Return the unsubscribe function
      return () => {
        data.subscription.unsubscribe();
      };
    };

    const unsubscribe = initializeAuth();
    
    // Cleanup
    return () => {
      unsubscribe.then(fn => fn && fn());
    };
  }, []);

  // Create the context value
  const contextValue = {
    user,
    session,
    profile,
    isLoading,
    signOut,
    refreshSession
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
} 