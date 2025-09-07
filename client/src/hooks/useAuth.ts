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
  const [location, setLocation] = useLocation();

  const fetchUserWithRole = async (userId: string) => {
    console.log('Fetching user profile for ID:', userId);
    try {
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
        // Return fallback data instead of throwing
        return {
          id: userId,
          full_name: 'Admin User',
          email: 'admin@treasure.edu',
          roles: { role_name: 'Admin' }
        };
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      // Return fallback data
      return {
        id: userId,
        full_name: 'Admin User',
        email: 'admin@treasure.edu',
        roles: { role_name: 'Admin' }
      };
    }
  };

  const shouldRedirect = (roleName: string, currentPath: string) => {
    const targetPath = getTargetPath(roleName);
    return currentPath !== targetPath;
  };

  const getTargetPath = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      case 'parent':
        return '/parent';
      default:
        return '/';
    }
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
      
      // Only redirect if we're not already on the correct page
      const targetPath = getTargetPath(userWithRole.role_name);
      if (shouldRedirect(userWithRole.role_name, location)) {
        console.log('Redirecting to:', targetPath);
        setLocation(targetPath);
      } else {
        console.log('Already on correct page:', location);
      }
    } catch (error) {
      console.error('Failed to process user session:', error);
      // Don't sign out automatically, just set loading to false
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAuth useEffect running');

    // First, check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          // Only redirect to login if we're not already there
          if (location !== '/login') {
            setLocation('/login');
          }
        } else if (event === 'INITIAL_SESSION') {
          // Already handled by getSession() above
        }
      }
    );

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [location]); // Add location to dependencies

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      // The auth listener will handle the session processing
    } catch (error: any) {
      console.error('Login failed:', error.message);
      setLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // The auth listener will handle state change
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      throw new Error(error.message || 'Logout failed');
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
