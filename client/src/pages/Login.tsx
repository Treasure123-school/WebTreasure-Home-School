// client/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const getTargetPath = (roleName?: string | null) => {
    switch (roleName) {
      case 'Admin': return '/admin';
      case 'Teacher': return '/teacher';
      case 'Student': return '/student';
      case 'Parent': return '/parent';
      default: return '/home';
    }
  };

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      const targetPath = getTargetPath(user.role_name);
      setLocation(targetPath);
    }
  }, [isAuthenticated, isAuthLoading, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await login(email, password);
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Fetch user profile after successful login
        const { data: userData, error: userError } = await useAuth().user;
        
        if (userError) {
          throw userError;
        }
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userData?.full_name || 'User'}. Redirecting...`,
          variant: 'default',
        });
        
        const targetPath = getTargetPath(userData?.role_name);
        setLocation(targetPath);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return <LoadingSpinner message="Checking session..." />;
  }

  if (isAuthenticated) {
    return <LoadingSpinner message="Redirecting..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-bold">Treasure Home School</CardTitle>
          <CardDescription>Sign in to the portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
              ) : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
