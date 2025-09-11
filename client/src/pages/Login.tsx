// client/src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

function Login() {
  const { login, user, isLoading, error, clearError } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    const { error } = await login(email, password);

    if (error) {
      console.error("Login error:", error.message || error);
    }

    setSubmitting(false);
  };

  // 🔑 Redirect only after role_name is loaded
  useEffect(() => {
    if (user && user.role_name) {
      console.log("Redirecting user with role:", user.role_name);

      switch (user.role_name) {
        case "Admin":
          setLocation("/admin");
          break;
        case "Teacher":
          setLocation("/teacher");
          break;
        case "Student":
          setLocation("/student");
          break;
        case "Parent":
          setLocation("/parent");
          break;
        default:
          setLocation("/home"); // fallback
      }
    }
  }, [user, user?.role_name, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent 
                       rounded-md shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       disabled:opacity-50"
          >
            {submitting || isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
