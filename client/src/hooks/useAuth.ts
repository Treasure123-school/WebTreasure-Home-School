import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AppUser extends User {
  role_id?: number;
  full_name?: string;
  class?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user as AppUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user as AppUser || null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // After successful login, get the full user data with profile
      if (data.user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser as AppUser);
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
