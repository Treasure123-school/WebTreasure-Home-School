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
  const [isLoading, setIsLoading] = useState(false); // Start as false for public routes
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth in background without blocking UI
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        setSession(initialSession);

        if (initialSession?.user) {
          // Fetch user profile in background
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name, roles(role_name)')
            .eq('id', initialSession.user.id)
            .maybeSingle();

          if (!userError && userData) {
            setUser({
              ...initialSession.user,
              full_name: userData.full_name || 'User',
              role_name: (userData.roles as any)?.role_name || null,
            });
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
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
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name, roles(role_name)')
            .eq('id', newSession.user.id)
            .maybeSingle();

          if (!userError && userData) {
            setUser({
              ...newSession.user,
              full_name: userData.full_name || 'User',
              role_name: (userData.roles as any)?.role_name || null,
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

      if (authError) throw authError;
      return { data, error: null };
    } catch (err: any) {
      setError(err.message || "Login failed");
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
