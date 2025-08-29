import { API_BASE_URL } from './queryClient'; // ✅ Import from queryClient

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// ✅ If you have API calls in this file, use API_BASE_URL too
