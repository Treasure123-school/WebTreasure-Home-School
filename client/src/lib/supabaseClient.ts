import { createClient } from '@supabase/supabase-js'

// Get environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  
  // In development, throw an error to make it obvious
  if (import.meta.env.DEV) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Debugging in development only
if (import.meta.env.DEV) {
  (window as any).supabase = supabase;
  console.log('Supabase client exposed to window.supabase for debugging');
  
  // Add auth state change listener for debugging
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
  });
}
