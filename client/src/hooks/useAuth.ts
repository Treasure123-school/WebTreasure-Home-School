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

  // Function to create admin user if it doesn't exist
  const ensureAdminUserExists = async (userId: string, email: string) => {
    try {
      console.log('Ensuring admin user exists:', email);
      
      // First, try to get the Admin role ID
      const { data: role, error: roleError } = await withTimeout(
        supabase.from('roles').select('id').eq('role_name', 'Admin').single()
      );

      if (roleError) {
        console.error('Error fetching Admin role:', roleError);
        return 1; // Fallback to role_id 1
      }

      // Check if admin user already exists
      const { data: existingUser, error: checkError } = await withTimeout(
        supabase.from('users').select('id').eq('id', userId).maybeSingle()
      );

      if (checkError) {
        console.error('Error checking if admin exists:', checkError);
      }

      // If admin user doesn't exist, create it
      if (!existingUser) {
        console.log('Creating admin user in database...');
        const { error: insertError } = await withTimeout(
          supabase.from('users').insert({
            id: userId,
            email: email,
            full_name: 'Admin User',
            role_id: role.id
          })
        );

        if (insertError) {
          console.error('Error creating admin user:', insertError);
        } else {
          console.log('Admin user created successfully');
        }
      }

      return role.id;
    } catch (error) {
      console.error('Exception in ensureAdminUserExists:', error);
      return 1; // Fallback to role_id 1
    }
  };

  // Single query to get user data with role
  const fetchUserWithRole = async (userId: string, email: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // For admin user, ensure it exists first
      if (email === 'admin@treasure.edu') {
        await ensureAdminUserExists(userId, email);
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
        
        // If user doesn't exist, create a basic profile
        if (error.code === 'PGRST116') {
          console.log('User not found, creating basic profile...');
          const roleId = await ensureAdminUserExists(userId, email);
          return { 
            id: userId, 
            email, 
            full_name: email === 'admin@treasure.edu' ? 'Admin User' : email.split('@')[0],
            role_id: roleId,
            roles: { role_name: email === 'admin@treasure.edu' ? 'Admin' : 'Student' }
          };
        }
        
        // For permission errors or other issues, return fallback data
        return { 
          id: userId, 
          email, 
          full_name: email === 'admin@treasure.edu' ? 'Admin User' : email.split('@')[0],
          role_id: 1,
          roles: { role_name: email === 'admin@treasure.edu' ? 'Admin' : 'Student' }
        };
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception in fetchUserWithRole:', error);
      // Use fallback data
      return { 
        id: userId, 
        email, 
        full_name: email === 'admin@treasure.edu' ? 'Admin User' : email.split('@')[0],
        role_id: 1,
        roles: { role_name: email === 'admin@treasure.edu' ? 'Admin' : 'Student' }
      };
    }
  };

  const redirectBasedOnRole = (roleName: string | undefined) => {
    console.log('Redirecting based on role:', roleName);
    
    // Use a small delay to ensure state is updated
    setTimeout(() => {
      let path = '/';
      
      if (!roleName) {
        console.log('No role found, redirecting to home');
      } else {
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
      }
      
      console.log('Redirecting to:', path);
      setLocation(path);
    }, 100); // Small delay to ensure state updates
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
          role_name: (userData as any).roles?.role_name || 
                     (sessionUser.email === 'admin@treasure.edu' ? 'Admin' : 'Student')
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
      // Final fallback - redirect to home
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
