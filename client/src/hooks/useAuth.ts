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
  role_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Function to fetch user profile data from your custom users table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles (role_name)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  const redirectBasedOnRole = (roleName: string) => {
    console.log('Redirecting based on role:', roleName);
    
    switch (roleName?.toLowerCase()) {
      case 'admin':
        console.log('Redirecting to /admin');
        setLocation('/admin');
        break;
      case 'teacher':
        console.log('Redirecting to /teacher');
        setLocation('/teacher');
        break;
      case 'student':
        console.log('Redirecting to /student');
        setLocation('/student');
        break;
      case 'parent':
        console.log('Redirecting to /parent');
        setLocation('/parent');
        break;
      default:
        console.log('Redirecting to /');
        setLocation('/');
    }
  };

  useEffect(() => {
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch the user's profile data from your custom table
          const userProfile = await fetchUserProfile(session.user.id);
          const userWithProfile = {
            ...session.user,
            ...userProfile,
            role_name: userProfile?.roles?.role_name
          };
          setUser(userWithProfile as AppUser);
          
          // Redirect based on role
          redirectBasedOnRole(userProfile?.roles?.role_name);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLocation('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch the user's profile data from your custom table
        const userProfile = await fetchUserProfile(session.user.id);
        const userWithProfile = {
          ...session.user,
          ...userProfile,
          role_name: userProfile?.roles?.role_name
        };
        setUser(userWithProfile as AppUser);
        
        // Redirect based on role if already authenticated
        redirectBasedOnRole(userProfile?.roles?.role_name);
      } else {
        setUser(null);
      }
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
        const userProfile = await fetchUserProfile(data.user.id);
        const userWithProfile = {
          ...data.user,
          ...userProfile,
          role_name: userProfile?.roles?.role_name
        };
        setUser(userWithProfile as AppUser);
        
        // Redirect based on role
        redirectBasedOnRole(userProfile?.roles?.role_name);
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
