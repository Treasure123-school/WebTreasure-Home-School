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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔑 Safe two-step fetch (avoids recursion)
  const fetchUserProfile = async (userId: string) => {
    try {
      // Step 1: fetch base user (without roles join)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("full_name, role_id")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user (step 1):", userError);
        return null;
      }
      if (!userData) return null;

      // Step 2: fetch role name separately
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("role_name")
        .eq("id", userData.role_id)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching role (step 2):", roleError);
        return {
          full_name: userData.full_name || "User",
          role_name: null,
        };
      }

      return {
        full_name: userData.full_name || "User",
        role_name: roleData?.role_name ?? null,
      };
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
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
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);

      if (!newSession) {
        setUser(null);
        setError(null);
        return;
      }

      const profile = await fetchUserProfile(newSession.user.id);
      if (profile) {
        setUser({
          ...newSession.user,
          ...profile,
        });
        setError(null);
      }
    });

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
