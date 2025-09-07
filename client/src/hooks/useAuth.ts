import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, Session } from "@supabase/supabase-js";
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
      console.error('Error fetching user profile:', error);
      throw error;
    }

    console.log('Profile fetched successfully:', data);
    return data;
  };

  const redirectBasedOnRole = (roleName: string) => {
    let path = '/';
    switch (roleName?.toLowerCase()) {
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
    // Use the { replace: true } option to prevent back button loops
    setLocation(path, { replace: true });
  };

  const handleSession = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userProfile = await fetchUserWithRole(session.user.id);

      const userWithRole = {
        ...session.user,
        ...userProfile,
        role_name: userProfile.roles?.role_name || 'default'
      };

      setUser(userWithRole as AppUser);
      redirectBasedOnRole(userWithRole.role_name);
    } catch (error) {
      console.error('Failed to process user session:', error);
      await supabase.auth.signOut();
      setUser(null);
      setLocation('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAuth useEffect running');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLocation('/login', { replace: true });
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
      // The auth listener will now handle the session processing and redirection
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
      // The auth listener will now handle state change and redirection
      console.log('Logout successful.');
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
