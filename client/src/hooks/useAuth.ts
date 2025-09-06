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

  // Function to create or update user profile
  const upsertUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Upserting user profile for:', email);
      
      // Try to get the user's role from auth metadata first, default to Admin for admin@treasure.edu
      const { data: authUser } = await supabase.auth.getUser();
      let roleName = 'Student'; // default
      
      if (authUser.user?.email === 'admin@treasure.edu') {
        roleName = 'Admin';
      } else if (authUser.user?.user_metadata?.role) {
        roleName = authUser.user.user_metadata.role;
      }

      // Get the role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', roleName)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      // Use UPSERT to handle both insert and update cases
      const { data: userData, error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          full_name: authUser.user?.user_metadata?.full_name || email.split('@')[0],
          role_id: role.id
        })
        .select(`
          id,
          role_id,
          full_name,
          email,
          roles (role_name)
        `)
        .single();

      if (upsertError) {
        console.error('Error upserting user profile:', upsertError);
        return null;
      }

      console.log('User profile upserted successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Exception in upsertUserProfile:', error);
      return null;
    }
  };

  // Single query to get user data with role
  const fetchUserWithRole = async (userId: string, email: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
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
        
        // If user doesn't exist or has permission issues, upsert the profile
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('User not found or permission denied, upserting profile...');
          return await upsertUserProfile(userId, email);
        }
        
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception in fetchUserWithRole:', error);
      return null;
    }
  };

  const redirectBasedOnRole = (roleName: string | undefined) => {
    console.log('Redirecting based on role:', roleName);
    
    // Fallback if no role is found
    if (!roleName) {
      console.log('No role found, redirecting to home');
      setLocation('/');
      return;
    }

    switch (roleName.toLowerCase()) {
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

  // Process user authentication and data fetching
  const processUserAuth = async (sessionUser: User) => {
    try {
      const userData = await fetchUserWithRole(sessionUser.id, sessionUser.email!);
      
      if (userData) {
        const userWithRole = {
          ...sessionUser,
          ...userData,
          role_name: userData.roles?.role_name
        };
        setUser(userWithRole);
        redirectBasedOnRole(userData.roles?.role_name);
      } else {
        // If we can't get user data, still set basic user and redirect to home
        const fallbackUser = {
          ...sessionUser,
          full_name: sessionUser.email?.split('@')[0],
          role_name: 'student'
        };
        setUser(fallbackUser as AppUser);
        setLocation('/');
      }
    } catch (error) {
      console.error('Error processing user auth:', error);
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
        } else if (event === 'USER_UPDATED') {
          console.log('User updated, refreshing data');
          if (session?.user) {
            await processUserAuth(session.user);
          }
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
