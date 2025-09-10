// client/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { supabase from "./supabaseClient";

// ✅ CRITICAL FIX: The API_BASE_URL should be an empty string for Vercel rewrites.
export const API_BASE_URL = '';

// This new helper function will be used for all protected API calls.
export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown | undefined,
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('User session not found. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      // ✅ CRITICAL FIX: The access token from the session is now sent.
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'An unknown API error occurred';
    throw new Error(`API Error: ${errorMessage}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json() as T;
  } else {
    return {} as T;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 1,
    },
  },
});
