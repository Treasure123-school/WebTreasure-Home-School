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
  const [isLoading, setIsLoading] = useState(false); // Start false for public routes
  const [error, setError] = useState<string | null>(null);

  // 🔹 Helper: safely extract role_name (handles object vs array shape)
  const extractRoleName = (roles: any): string | null => {
    if (!roles) return null;
    if (Array.isArray(roles) && roles.length > 0) {
      return roles[0]?.role_name ?? null;
    }
    if (typeof roles === "object") {
      return (roles as any).role_name ?? null;
    }
    return null;
  };

  // 🔹 Fetch user profile + role from DB
  const fetchUserProfile = async (userId: string) => {
    const { data, error: userError } = await supabase
      .from("users")
      .select(`
        full_name,
        role_id,
        roles!inner (
          role_name
        )
      `)
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user profile:", userError);
      return null;
    }

    if (data) {
      return {
        full_name: data.full_name || "User",
        role_name: extractRoleName(data.roles),
      };
    }

    return null;
  };

  useEffect(() => {
    // Initialize auth in background
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
              full_name: profile.full_name,
              role_name: profile.role_name,
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
      async (_event, newSession) => {
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
              full_name: profile.full_name,
              role_name: profile.role_name,
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

  // 🔹 Login method
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
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
