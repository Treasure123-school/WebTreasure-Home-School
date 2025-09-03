import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  // First, get the Supabase auth user
  const { data: authUser, isLoading: authLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
    staleTime: Infinity,
  });

  // Then, get the user data from your database if authenticated
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["users", authUser?.id],
    queryFn: getQueryFn({ on401: "returnNull" }), // ✅ Use your API query function
    enabled: !!authUser?.id, // Only run if we have an authenticated user
  });

  // Combine the data
  const user = authUser && userData ? { ...authUser, ...userData } : null;

  return {
    user,
    isLoading: authLoading || userLoading,
    isAuthenticated: !!user,
  };
}
