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

  useEffect(() => {
    let isMounted = true;
    
    const getInitialSessionAndUser = async () => {
      try {
        // Get the session from Supabase
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (isMounted) {
          setSession(initialSession);
        }

        if (initialSession?.user) {
          // If a user exists, fetch their profile data (role, full name)
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name, roles(role_name)')
            .eq('id', initialSession.user.id)
            .maybeSingle();

          if (userError) {
            console.error("Error fetching initial user profile:", userError);
            setError("Failed to load user profile");
          }
          
          if (isMounted && userData) {
            setUser({
              ...initialSession.user,
              full_name: userData?.full_name || 'User',
              role_name: (userData?.roles as any)?.role_name || null,
            });
          }
        }
      } catch (err: any) {
        console.error("Error in getInitialSessionAndUser:", err);
        if (isMounted) {
          setError(err.message || "Authentication error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSessionAndUser();

    // Set up a subscription to listen for future changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        
        setSession(newSession);
        
        // If the user logs out, newSession will be null, and we set user to null
        if (!newSession) {
          setUser(null);
          setError(null);
          return;
        }
        
        // If the user logs in, we fetch their profile
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name, roles(role_name)')
            .eq('id', newSession.user.id)
            .maybeSingle();
            
          if (userError) {
            console.error("Error fetching user profile on auth change:", userError);
            setError("Failed to load user profile");
            return;
          }

          setUser({
            ...newSession.user,
            full_name: userData?.full_name || 'User',
            role_name: (userData?.roles as any)?.role_name || null,
          });
          setError(null);
        } catch (err: any) {
          console.error("Error in auth state change handler:", err);
          setError(err.message || "Authentication error");
        }
      }
    );

    // Cleanup the subscription when the component unmounts
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    login: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut(),
    clearError: () => setError(null),
  };
}
