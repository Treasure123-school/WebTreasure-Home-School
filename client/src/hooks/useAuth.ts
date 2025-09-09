import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AppUser extends User {
  role_name?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRole = async (sessionUser: User | null) => {
      console.log('Fetching user and role...');
      if (sessionUser) {
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('roles(role_name)')
            .eq('id', sessionUser.id)
            .single();

          if (error) {
            console.error("Supabase user data fetch error:", error);
            throw error;
          }
          
          const userRole = userData?.roles?.role_name;
          console.log('User role fetched:', userRole);
          
          setUser({
            ...sessionUser,
            role_name: userRole || null
          });
        } catch (error) {
          console.error("Failed to fetch user role, setting to null:", error);
          setUser({ ...sessionUser, role_name: null });
        }
      } else {
        console.log('No user session found.');
        setUser(null);
      }
      setIsLoading(false);
      console.log('Auth check complete.');
    };

    const getInitialSession = async () => {
      console.log('Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUserAndRole(session?.user ?? null);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setIsLoading(true);
        fetchUserAndRole(session?.user ?? null);
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
