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

  // Function to create a basic user profile if one doesn't exist
  const createBasicUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Creating basic user profile for:', email);
      
      // Get default role (Student)
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', 'Student')
        .single();

      if (roleError) {
        console.error('Error fetching default role:', roleError);
        return null;
      }

      // Create basic user profile
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          full_name: email.split('@')[0], // Use email prefix as name
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

      if (createError) {
        console.error('Error creating user profile:', createError);
        return null;
      }

      console.log('User profile created successfully:', newUser);
      return newUser;
    } catch (error) {
      console.error('Exception in createBasicUserProfile:', error);
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
        
        // If user doesn't exist in your table, create a basic profile
        if (error.code === 'PGRST116') { // Record not found
          console.log('User not found in users table, creating basic profile...');
          return await createBasicUserProfile(userId, email);
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
