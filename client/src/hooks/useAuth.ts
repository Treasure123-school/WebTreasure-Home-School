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
    const fetchUserAndRole = async (sessionUser: User | null) => {
      if (sessionUser) {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('roles(role_name)')
            .eq('id', sessionUser.id)
            .single();

          setUser({
            ...sessionUser,
            role_name: userData?.roles?.role_name
          });
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setUser(sessionUser); // Still set the user even if role fetch fails
        }
      } else {
        setUser(null);
      }
      setIsLoading(false); // This is the crucial line: set loading to false after processing
    };

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUserAndRole(session?.user ?? null);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoading(true); // Set loading to true while a change is being processed
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
