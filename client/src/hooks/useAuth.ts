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
      console.log('Fetching user profile for ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          roles (role_name)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        // Log the error and re-throw it to be caught by the calling function
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;

    } catch (error) {
      console.error('Exception in fetchUserWithRole:', error);
      // Let the error propagate up the call stack
      throw error;
    }
  };

  const redirectBasedOnRole = (roleName: string) => {
    let path = '/';
    switch (roleName.toLowerCase()) {
      case 'admin':
        path = '/admin';
        break;
      case 'teacher':
        path = '/teacher';
        break;
      case 'student':
        path = '/student';
        break;
      case 'parent':
        path = '/parent';
        break;
      default:
        path = '/';
    }
    console.log('Redirecting to:', path);
    setLocation(path);
  };

  const handleSession = async (session: any) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile from the database
      const userProfile = await fetchUserWithRole(session.user.id);
      
      // Combine Supabase auth user data with the fetched profile data
      const userWithRole = {
        ...session.user,
        ...userProfile,
        role_name: userProfile.roles?.role_name || 'default'
      };
      
      setUser(userWithRole as AppUser);
      redirectBasedOnRole(userWithRole.role_name);

    } catch (error) {
      console.error('Failed to process user session:', error);
      // If profile fetch fails, sign out the user and redirect to login
      await supabase.auth.signOut();
      setUser(null);
      setLocation('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAuth useEffect running');
    
    // Check for initial session on component mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session found:', session);
      handleSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          handleSession(session);
        } else if (event === 'SIGNED_OUT') {
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      console.log('Login successful. Auth state listener will handle redirection.');
    } catch (error: any) {
      console.error('Login failed:', error.message);
      setLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setLocation('/login');
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      throw new Error(error.message || 'Logout failed');
    } finally {
      setLoading(false);
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
