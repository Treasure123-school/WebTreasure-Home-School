// client/src/hooks/useAuth.ts
// --- STABLE VERSION TO FIX THE INFINITE LOOP ---

import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

// This interface is correct and does not need changes.
export interface AppUser extends User {
  role_name?: string | null;
  full_name?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // isLoading should only be true on the very first load of the application.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs once when the component mounts.
    // It checks for an existing session and sets up a listener for auth changes.
    
    const getInitialSessionAndUser = async () => {
      // Get the session from Supabase.
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      if (initialSession?.user) {
        // If a user exists, fetch their profile data (role, full name).
        const { data: userData, error } = await supabase
          .from('users')
          .select('full_name, roles(role_name)')
          .eq('id', initialSession.user.id)
          .single();

        if (error) {
          console.error("Error fetching initial user profile:", error);
        }
        
        setUser({
          ...initialSession.user,
          full_name: userData?.full_name ?? 'User',
          role_name: (userData?.roles as any)?.role_name ?? null,
        });

      }
      // CRITICAL FIX: Set loading to false *after* the initial check is complete.
      setIsLoading(false);
    };

    getInitialSessionAndUser();

    // Set up a subscription to listen for future changes (login, logout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        
        // If the user logs out, newSession will be null, and we set user to null.
        // If the user logs in, we fetch their profile.
        if (newSession?.user) {
           const { data: userData, error } = await supabase
            .from('users')
            .select('full_name, roles(role_name)')
            .eq('id', newSession.user.id)
            .single();
            
           if (error) {
             console.error("Error fetching user profile on auth change:", error);
           }

           setUser({
              ...newSession.user,
              full_name: userData?.full_name ?? 'User',
              role_name: (userData?.roles as any)?.role_name ?? null,
           });
        } else {
          setUser(null);
        }
      }
    );

    // Cleanup the subscription when the component unmounts.
    return () => {
      subscription.unsubscribe();
    };
  }, []); // This empty dependency array ensures the effect runs only ONCE.

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    // The login/logout functions are simple wrappers. The subscription handles the state updates.
    login: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut(),
  };
}

