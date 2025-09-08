import { useState, useEffect, useRef } from "react";
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
  role_id?: number;
  roles?: {
    role_name: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();
  const initialLoad = useRef(true);
  const redirecting = useRef(false);

  const fetchUserWithRole = async (userId: string): Promise<UserProfile> => {
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

      return data as UserProfile;
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      throw error;
    }
  };

  const getTargetPath = (roleName: string | undefined): string => {
    if (!roleName) return '/home';
    
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
        return '/home';
    }
  };

  const shouldRedirect = (currentPath: string, targetPath: string): boolean => {
    // Don't redirect if we're already on the target path
    if (currentPath === targetPath) return false;
    
    // Don't redirect from admin sub-pages to admin dashboard
    if (currentPath.startsWith('/admin/') && targetPath === '/admin') return false;
    
    // Don't redirect from other role-specific sub-pages
    if (currentPath.startsWith('/teacher/') && targetPath === '/teacher') return false;
    if (currentPath.startsWith('/student/') && targetPath === '/student') return false;
    if (currentPath.startsWith('/parent/') && targetPath === '/parent') return false;
    
    // Don't redirect if we're on auth pages
    if (currentPath === '/login' || currentPath === '/unauthorized') return false;
    
    return true;
  };

  const handleSession = async (session: Session | null, isInitialLoad: boolean = false) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      
      // Only redirect to login on initial load if not already there
      if (isInitialLoad && location !== '/login' && !redirecting.current) {
        redirecting.current = true;
        setLocation('/login');
      }
      return;
    }

    try {
      const userProfile = await fetchUserWithRole(session.user.id);
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
      
      // Handle redirects only on initial load
      if (isInitialLoad && role_name && role_name !== 'unknown') {
        const targetPath = getTargetPath(role_name);
        
        if (shouldRedirect(location, targetPath) && !redirecting.current) {
          redirecting.current = true;
          console.log('Initial redirect to:', targetPath);
          setLocation(targetPath);
        }
      }
    } catch (error) {
      console.error('Failed to process user session:', error);
      // Set basic user info without role details but don't redirect
      setUser({
        ...session.user,
        id: session.user.id,
        email: session.user.email || '',
        role_name: 'unknown'
      } as AppUser);
    } finally {
      setLoading(false);
      initialLoad.current = false;
    }
  };

  useEffect(() => {
    console.log('useAuth useEffect running, location:', location);

    // First, check existing session - only on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session, true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'initialLoad:', initialLoad.current);
        
        // For subsequent auth changes, don't handle redirects
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await handleSession(session, false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          // Only redirect to login if we're not already there and not already redirecting
          if (location !== '/login' && !redirecting.current) {
            redirecting.current = true;
            setLocation('/login');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Remove location dependency to prevent infinite loops

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
