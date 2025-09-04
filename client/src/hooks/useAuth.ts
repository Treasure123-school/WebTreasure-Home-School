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
    // Check authentication status on mount
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile from your database
        await fetchUserProfile(session.user.id);
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

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile from your API
      const response = await fetch(`/api/users/${userId}`);
      
      if (response.ok) {
        const userProfile = await response.json();
        
        // Get the Supabase auth user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Combine auth user with profile data
          setUser({ ...authUser, ...userProfile });
          localStorage.setItem('user', JSON.stringify({ ...authUser, ...userProfile }));
        }
      } else {
        console.error('Failed to fetch user profile');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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

      if (data.user) {
        // Fetch the user profile from your database
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLocation('/login');
    }
  };

  const signup = async (email: string, password: string, userData: any): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role_id: userData.role_id
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create user profile in your database
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userData,
            id: data.user.id
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create user profile');
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    logout,
    signup
  };
}
