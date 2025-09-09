import { useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AppUser extends User {
  role_name?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // A ref to prevent re-fetching on every render
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    
    const fetchUserAndRole = async (sessionUser: User | null) => {
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
          setUser({
            ...sessionUser,
            role_name: userRole || null
          });
        } catch (error) {
          console.error("Failed to fetch user role, setting to null:", error);
          setUser({ ...sessionUser, role_name: null });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      await fetchUserAndRole(initialSession?.user ?? null);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
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
    session,
    isLoading,
    isAuthenticated: !!user,
    login: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut()
  };
}
