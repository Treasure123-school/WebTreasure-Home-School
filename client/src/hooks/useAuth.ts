import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AppUser extends User {
  role_id?: number;
  full_name?: string;
  role_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          // Fetch user profile with role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              full_name,
              email,
              role_id,
              roles (role_name)
            `)
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user profile:', userError);
          }

          setUser({
            ...session.user,
            full_name: userData?.full_name,
            role_id: userData?.role_id,
            role_name: userData?.roles?.role_name
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            // Fetch user profile with role
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select(`
                id,
                full_name,
                email,
                role_id,
                roles (role_name)
              `)
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user profile:', userError);
            }

            setUser({
              ...session.user,
              full_name: userData?.full_name,
              role_id: userData?.role_id,
              role_name: userData?.roles?.role_name
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
