import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AppUser extends User {
  role_id?: number;
  full_name?: string;
  role_name?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles?: {
    role_name: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();

  const fetchUserWithRole = async (userId: string): Promise<UserProfile> => {
    console.log('Fetching user profile for ID:', userId);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          role_id,
          roles (role_name)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      console.log('Profile fetched successfully:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      // Re-throw the error to be handled by the caller
      throw error;
    }
  };

  const getTargetPath = (roleName: string | undefined): string => {
    if (!roleName) return '/';
    
    switch (roleName.toLowerCase()) {
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

      // Extract role_name properly from the nested structure
      const role_name = userProfile.roles?.role_name || 'unknown';
      
      const userWithRole: AppUser = {
        ...session.user,
        id: session.user.id,
        email: session.user.email || '',
        role_id: userProfile.role_id,
        full_name: userProfile.full_name,
        role_name: role_name
      };

      setUser(userWithRole);
      
      // Only redirect if we're not already on the correct page and we have a valid role
      if (role_name && role_name !== 'unknown') {
        const targetPath = getTargetPath(role_name);
        const currentPath = location;
        
        // Don't redirect if we're already on the target path or on a specific admin page
        const isAdminPage = currentPath.startsWith('/admin/');
        const isAlreadyOnTarget = currentPath === targetPath;
        
        if (!isAlreadyOnTarget && !isAdminPage) {
          console.log('Redirecting to:', targetPath, 'from:', currentPath);
          setLocation(targetPath);
        } else {
          console.log('Staying on current page:', currentPath);
        }
      }
    } catch (error) {
      console.error('Failed to process user session:', error);
      // Set basic user info without role details
      setUser({
        ...session.user,
        id: session.user.id,
        email: session.user.email || '',
        role_name: 'unknown'
      } as AppUser);
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
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await handleSession(session);
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
  }, [location]);

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
