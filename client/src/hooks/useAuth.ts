// client/src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export interface AppUser extends User {
  role_name?: string | null;
  full_name?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile with role information
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error: queryError } = await supabase
        .from("users")
        .select(`
          full_name, 
          role_id,
          roles:role_id (role_name)
        `)
        .eq("id", userId)
        .single();

      if (queryError) {
        console.error("Error fetching user profile:", queryError);
        return null;
      }

      return {
        full_name: data?.full_name || "User",
        role_name: data?.roles?.role_name || null,
      };
    } catch (err) {
      console.error("Exception in fetchUserProfile:", err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          return;
        }

        setSession(initialSession);

        if (initialSession?.user) {
          const profile = await fetchUserProfile(initialSession.user.id);
          if (profile) {
            setUser({
              ...initialSession.user,
              ...profile,
            });
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (!newSession) {
          setUser(null);
          setError(null);
          return;
        }

        try {
          const profile = await fetchUserProfile(newSession.user.id);
          if (profile) {
            setUser({
              ...newSession.user,
              ...profile,
            });
            setError(null);
          }
        } catch (err) {
          console.error("Error handling auth change:", err);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Fetch user profile immediately after successful login
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser({
            ...data.user,
            ...profile,
          });
        }
      }

      return { data, error: null };
    } catch (err: any) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout: () => supabase.auth.signOut(),
    clearError: () => setError(null),
  };
}
