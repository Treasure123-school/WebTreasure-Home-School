// client/src/hooks/useAuth.ts
// --- FULLY UPDATED AND CORRECTED FILE ---

import { useState, useEffect, useCallback } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

// The AppUser interface remains the same.
export interface AppUser extends User {
  role_name?: string | null;
  full_name?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ IMPROVEMENT: Encapsulated the role-fetching logic into a reusable function.
  const fetchUserWithRole = useCallback(async (sessionUser: User | null): Promise<AppUser | null> => {
    if (!sessionUser) return null;

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('full_name, roles(role_name)')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        // This is a critical error, we must throw it to be caught by the caller.
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return {
        ...sessionUser,
        role_name: (userData?.roles as any)?.role_name || null,
        full_name: userData?.full_name || 'User',
      };
    } catch (error) {
      console.error("Error in fetchUserWithRole:", error);
      // Return the base user object even if role fetching fails, but log the error.
      return { ...sessionUser, role_name: null, full_name: 'User' };
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const fullUser = await fetchUserWithRole(initialSession?.user ?? null);
      setUser(fullUser);
      setIsLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const fullUser = await fetchUserWithRole(session?.user ?? null);
        setUser(fullUser);
        // Only show loading on initial load, not on subsequent changes.
        if (isLoading) setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserWithRole, isLoading]);


  // ✅ FIX: The login function is now a powerful, atomic async operation.
  const login = async (email: string, password: string): Promise<AppUser> => {
    // 1. Attempt to sign in.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;
    if (!data.user) throw new Error("Login succeeded but no user object was returned.");

    // 2. Immediately fetch the user's role and full profile.
    const fullUser = await fetchUserWithRole(data.user);
    if (!fullUser) throw new Error("Could not retrieve user profile after login.");
    
    // 3. Update the global state.
    setUser(fullUser);

    // 4. Return the complete user object to the caller.
    return fullUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };


  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
