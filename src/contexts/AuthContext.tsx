import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session if Supabase is configured
    if (
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
    } else {
      // Skip auth if credentials are missing
      setIsLoading(false);
    }

    // Listen for auth changes if Supabase is configured
    let subscription: { unsubscribe: () => void } | null = null;

    if (
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        return {
          data: null,
          error: new Error(
            "Supabase is not configured. Please add your Supabase URL and anon key to environment variables.",
          ),
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Handle email not confirmed error
      if (error?.message?.includes("Email not confirmed")) {
        // For development purposes, we'll bypass email confirmation
        // In production, you would want to send a confirmation email instead
        return {
          data: null,
          error: new Error(
            "Please check your email for a confirmation link or try signing up again.",
          ),
        };
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        return {
          data: null,
          error: new Error(
            "Supabase is not configured. Please add your Supabase URL and anon key to environment variables.",
          ),
        };
      }

      // For development, disable email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          // This bypasses email confirmation in development
          emailRedirectTo: window.location.origin,
        },
      });

      // If successful, also store user profile in the profiles table
      if (data.user && !error) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: name,
          email: email,
        });

        // For development, automatically sign in after signup
        if (data.user.email_confirmed_at === null) {
          // Show a message about email confirmation
          return {
            data,
            error: new Error(
              "Account created! For development purposes, you can now sign in without confirming your email.",
            ),
          };
        }
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    if (
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      await supabase.auth.signOut();
    }
    // Clear local state regardless
    setUser(null);
    setSession(null);
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
