import { createClient } from '@supabase/supabase-js'

// Get environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env file.';
  console.error(errorMsg);
  
  // In development, throw an error to make it obvious
  if (import.meta.env.DEV) {
    throw new Error(errorMsg);
  }
} else {
  console.log('Supabase environment variables found');
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

// Add a health check function
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('roles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
};
