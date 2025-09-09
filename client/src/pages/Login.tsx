// client/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Helper function to determine redirection path
  const getTargetPath = (roleName?: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      case 'parent':
        return '/parent';
      default:
        return '/home';
    }
  };

  // Effect to handle redirection after login
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const targetPath = getTargetPath(user.role_name);
      setLocation(targetPath);
      // Optional: Add a toast notification for successful redirection
      toast({
        title: "Redirecting...",
        description: `Welcome, ${user.full_name}!`,
        variant: "default",
      });
    }
  }, [isAuthenticated, user, isLoading, setLocation, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: loginError } = await login(email, password);
      
      if (loginError) {
        throw new Error(loginError.message || 'Login failed');
      }
      
      // The useEffect hook will handle the redirection after the state updates
      toast({
        title: "Success",
        description: "Logged in successfully!",
        variant: "default",
      });

    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
      toast({
        title: "Error",
        description: err.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the component remains the same)
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner />
        <span className="ml-4 text-textSecondary">Checking authentication...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-textPrimary">
      <div className="w-full flex justify-center items-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md bg-backgroundSurface border-border shadow-lg">
          <CardHeader className="flex flex-col items-center text-center space-y-2">
            <GraduationCap className="h-10 w-10 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Treasure Home School
            </CardTitle>
            <CardDescription className="text-textSecondary">
              Enter your credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="p-3 text-sm">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline transition-colors duration-200">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In to Portal'
                )}
              </Button>
            </form>
            <div className="text-center text-sm text-textSecondary space-y-2">
              <p>
                Security Notice: Ensure you're on the official Treasure Home School portal. Never share your credentials with anyone.
              </p>
              <Link href="/" className="text-primary hover:underline flex items-center justify-center transition-colors duration-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
