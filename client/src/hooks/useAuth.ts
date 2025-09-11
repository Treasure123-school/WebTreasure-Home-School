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

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string): Promise<{ full_name?: string; role_name?: string } | null> => {
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('full_name, roles(role_name)')
        .eq('id', userId)
        .maybeSingle();

      if (queryError) {
        console.error("Error fetching user profile:", queryError);
        return null;
      }

      return {
        full_name: data?.full_name || 'User',
        role_name: (data?.roles as any)?.role_name || null
      };
    } catch (err) {
      console.error("Exception in fetchUserProfile:", err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (isMounted) {
          setSession(initialSession);
        }

        // If user is authenticated, fetch their profile
        if (initialSession?.user) {
          const userProfile = await fetchUserProfile(initialSession.user.id);
          
          if (isMounted && userProfile) {
            setUser({
              ...initialSession.user,
              full_name: userProfile.full_name,
              role_name: userProfile.role_name,
            });
          }
        }
      } catch (err: any) {
        console.error("Error initializing auth:", err);
        if (isMounted) {
          setError(err.message || "Authentication initialization failed");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        setSession(newSession);
        
        if (!newSession) {
          // User signed out
          setUser(null);
          setError(null);
          return;
        }
        
        // User signed in or session refreshed
        try {
          const userProfile = await fetchUserProfile(newSession.user.id);
          
          if (userProfile) {
            setUser({
              ...newSession.user,
              full_name: userProfile.full_name,
              role_name: userProfile.role_name,
            });
            setError(null);
          }
        } catch (err: any) {
          console.error("Error handling auth state change:", err);
          setError(err.message || "Failed to process authentication change");
        }
      }
    );

    authSubscription = subscription;

    // Cleanup function
    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Enhanced login function with better error handling
  const enhancedLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Fetch user profile after successful login
      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        if (userProfile) {
          const updatedUser = {
            ...data.user,
            full_name: userProfile.full_name,
            role_name: userProfile.role_name,
          };
          setUser(updatedUser);
          return { data: { user: updatedUser }, error: null };
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
    login: enhancedLogin,
    logout: () => supabase.auth.signOut(),
    clearError: () => setError(null),
    refreshUser: async () => {
      if (user) {
        const userProfile = await fetchUserProfile(user.id);
        if (userProfile) {
          setUser({
            ...user,
            full_name: userProfile.full_name,
            role_name: userProfile.role_name,
          });
        }
      }
    },
  };
}
