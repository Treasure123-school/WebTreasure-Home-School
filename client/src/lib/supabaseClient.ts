import { createClient } from '@supabase/supabase-js'

// Get environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a dummy client that will fail gracefully
const createDummyClient = () => {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Missing Supabase config') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: new Error('Missing Supabase config') }),
      signOut: () => Promise.resolve({ error: new Error('Missing Supabase config') }),
    }
  };
};

// Create the Supabase client
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createDummyClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

// Temporary: Expose supabase to global scope for debugging
if (import.meta.env.DEV) {
  (window as any).supabase = supabase;
  console.log('Supabase client exposed to window.supabase for debugging');
}

// Optional: Add auth state change listener for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session)
});
