import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-2 pt-8">
          {/* School Logo Section */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
              {/* Replace with your actual logo: */}
              {/* <img src="/school-logo.png" alt="School Logo" className="w-12 h-12" /> */}
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Treasure Home School
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Enter your credentials to access the portal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          {error && (
            <Alert variant="destructive" className="mb-6 border-l-4 border-l-red-500">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
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

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Link href="/forgot-password">
                  <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm">
                    Forgot password?
                  </Button>
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
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Portal'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 text-center">
              <strong>Security Notice:</strong> Ensure you're on the official Treasure Home School portal.
              Never share your credentials with anyone.
            </p>
          </div>

          {/* Back to Home link */}
          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-blue-100/50 to-transparent pointer-events-none"></div>
    </div>
  );
}
