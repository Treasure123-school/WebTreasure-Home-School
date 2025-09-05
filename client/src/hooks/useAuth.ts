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

  // Single query to get user data with role
  const fetchUserWithRole = async (userId: string) => {
    console.log('Fetching user profile for:', userId);
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

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      console.log('User profile fetched:', data);
      return data;
    } catch (error) {
      console.error('Exception in fetchUserWithRole:', error);
      return null;
    }
  };

  const redirectBasedOnRole = (roleName: string) => {
    console.log('Redirecting based on role:', roleName);
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
    console.log('useAuth useEffect running');
    
    // Check initial auth state
    const checkAuth = async () => {
      console.log('Checking auth state...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Session found, fetching user data');
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
          console.log('No session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, fetching profile');
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
          console.log('User signed out');
          setUser(null);
          setLocation('/login');
        }
      }
    );

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('Login attempt for:', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message);
      }

      console.log('Login successful, fetching user profile');
      
      // After successful login, fetch the user profile
      if (data.user) {
        const userData = await fetchUserWithRole(data.user.id);
        if (userData) {
          const userWithRole = {
            ...data.user,
            ...userData,
            role_name: userData.roles?.role_name
          };
          setUser(userWithRole);
          redirectBasedOnRole(userData.roles?.role_name);
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('Logging out');
    try {
      await supabase.auth.signOut();
      setUser(null);
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
