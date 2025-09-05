import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AppUser extends User {
  role_id?: number;
  full_name?: string;
  role_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  const fetchUserWithRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          role_id,
          full_name,
          email,
          roles (role_name)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const redirectBasedOnRole = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        setLocation('/admin');
        break;
      case 'teacher':
        setLocation('/teacher');
        break;
      case 'student':
        setLocation('/student');
        break;
      case 'parent':
        setLocation('/parent');
        break;
      default:
        setLocation('/');
    }
  };

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData = await fetchUserWithRole(session.user.id);
        if (userData) {
          const userWithRole = {
            ...session.user,
            ...userData,
            role_name: userData.roles?.role_name
          };
          setUser(userWithRole);
          redirectBasedOnRole(userData.roles?.role_name);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const userData = await fetchUserWithRole(session.user.id);
          if (userData) {
            const userWithRole = {
              ...session.user,
              ...userData,
              role_name: userData.roles?.role_name
            };
            setUser(userWithRole);
            redirectBasedOnRole(userData.roles?.role_name);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLocation('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // The auth state change listener will handle the redirect
      // after the user is set in the state
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
