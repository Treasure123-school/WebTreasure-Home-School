// client/src/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";

// 🐛 FIX: Ensure your backend URL is correct.
const API_BASE_URL = 'https://webtreasure-home-school.onrender.com';

// A new helper function to make authenticated API requests
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
            // ✅ CRITICAL FIX: Add the Authorization header
            "Authorization": `Bearer ${session.access_token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'An unknown API error occurred';
        throw new Error(`API Error: ${errorMessage}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json() as T;
    } else {
        // Return an empty object for non-JSON responses
        return {} as T;
    }
}


// You had some unused code here related to getQueryFn, which is not needed with the new apiRequest.
// I've removed it to keep the code clean and focused on the correct implementation.

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
