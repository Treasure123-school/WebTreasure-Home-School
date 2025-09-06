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

  // Function with timeout to prevent hanging queries
  const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    );
    return Promise.race([promise, timeout]);
  };

  // Function to create or update user profile
  const upsertUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Upserting user profile for:', email);
      
      // For admin@treasure.edu, always use Admin role
      const roleName = email === 'admin@treasure.edu' ? 'Admin' : 'Student';

      // Get the role ID with timeout
      const { data: role, error: roleError } = await withTimeout(
        supabase.from('roles').select('id').eq('role_name', roleName).single()
      );

      if (roleError) {
        console.error('Error fetching role:', roleError);
        // Fallback to role_id = 1 (assuming Admin is first)
        return { id: userId, email, full_name: 'Admin User', role_id: 1, roles: { role_name: 'Admin' } };
      }

      // Use UPSERT to handle both insert and update cases
      const { data: userData, error: upsertError } = await withTimeout(
        supabase.from('users').upsert({
          id: userId,
          email: email,
          full_name: email === 'admin@treasure.edu' ? 'Admin User' : email.split('@')[0],
          role_id: role.id
        }).select(`
          id,
          role_id,
          full_name,
          email,
          roles (role_name)
        `).single()
      );

      if (upsertError) {
        console.error('Error upserting user profile:', upsertError);
        // Return fallback user data
        return { id: userId, email, full_name: 'Admin User', role_id: 1, roles: { role_name: 'Admin' } };
      }

      console.log('User profile upserted successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Exception in upsertUserProfile:', error);
      // Return fallback user data
      return { id: userId, email, full_name: 'Admin User', role_id: 1, roles: { role_name: 'Admin' } };
    }
  };

  // Single query to get user data with role
  const fetchUserWithRole = async (userId: string, email: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // First, test if we can access the database
      try {
        const { error: testError } = await withTimeout(
          supabase.from('roles').select('count').limit(1),
          3000
        );
        
        if (testError) {
          console.log('Database access failed, using fallback');
          throw new Error('Database unavailable');
        }
      } catch (testError) {
        console.log('Database test failed, using fallback data');
        return await upsertUserProfile(userId, email);
      }

      // Try to fetch user data with timeout
      const { data, error } = await withTimeout(
        supabase.from('users').select(`
          id,
          role_id,
          full_name,
          email,
          roles (role_name)
        `).eq('id', userId).single(),
        5000
      );

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If user doesn't exist or has permission issues, upsert the profile
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('User not found or permission denied, upserting profile...');
          return await upsertUserProfile(userId, email);
        }
        
        // For other errors, use fallback
        return await upsertUserProfile(userId, email);
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception in fetchUserWithRole:', error);
      // Use fallback data
      return await upsertUserProfile(userId, email);
    }
  };

  const redirectBasedOnRole = (roleName: string | undefined) => {
    console.log('Redirecting based on role:', roleName);
    
    // Use window.location for more reliable redirects
    const redirectTo = (path: string) => {
      console.log('Redirecting to:', path);
      window.location.href = path;
    };

    // Fallback if no role is found
    if (!roleName) {
      console.log('No role found, redirecting to home');
      redirectTo('/');
      return;
    }

    switch (roleName.toLowerCase()) {
      case 'admin':
        redirectTo('/admin');
        break;
      case 'teacher':
        redirectTo('/teacher');
        break;
      case 'student':
        redirectTo('/student');
        break;
      case 'parent':
        redirectTo('/parent');
        break;
      default:
        redirectTo('/');
    }
  };

  // Process user authentication and data fetching
  const processUserAuth = async (sessionUser: User) => {
    try {
      console.log('Processing user auth for:', sessionUser.email);
      
      // Use fallback if database is slow
      const userData = await Promise.race([
        fetchUserWithRole(sessionUser.id, sessionUser.email!),
        new Promise(resolve => setTimeout(() => resolve(null), 6000)) // 6 second timeout
      ]);

      if (userData) {
        const userWithRole = {
          ...sessionUser,
          ...userData,
          role_name: (userData as any).roles?.role_name || 'Admin'
        };
        setUser(userWithRole as AppUser);
        redirectBasedOnRole((userData as any).roles?.role_name);
      } else {
        // If timeout or no data, use fallback
        console.log('Using fallback user data due to timeout');
        const fallbackUser = {
          ...sessionUser,
          full_name: sessionUser.email === 'admin@treasure.edu' ? 'Admin User' : sessionUser.email?.split('@')[0],
          role_name: sessionUser.email === 'admin@treasure.edu' ? 'Admin' : 'Student'
        };
        setUser(fallbackUser as AppUser);
        redirectBasedOnRole(sessionUser.email === 'admin@treasure.edu' ? 'Admin' : 'Student');
      }
    } catch (error) {
      console.error('Error processing user auth:', error);
      // Final fallback
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
          console.log('Session found, processing user data');
          await processUserAuth(session.user);
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
          console.log('User signed in, processing user data');
          await processUserAuth(session.user);
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

      console.log('Login successful, user data will be processed by auth listener');
      
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
      throw new Error('Logout failed');
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
