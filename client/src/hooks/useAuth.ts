import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AppUser extends User {
  role_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Try to get user role, but don't fail if it errors
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('roles(role_name)')
              .eq('id', session.user.id)
              .single();

            setUser({
              ...session.user,
              role_name: userData?.roles?.role_name
            });
          } catch (error) {
            // If role fetch fails, still set the user without role
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut()
  };
}
