import { useState } from 'react';
import { Link } from 'wouter'; // Import Link for navigation
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react'; // Import back arrow icon

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
      // The redirect is now handled by the useAuth hook itself
      // after the user state is updated
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md relative"> {/* Added relative positioning */}
        
        {/* Back to Home button */}
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 left-4 flex items-center gap-2 text-textSecondary hover:text-textPrimary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Treasure Home School</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the portal
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in to Portal'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2 text-sm">Demo Credentials:</h3>
            <p className="text-blue-700 text-xs">
              <strong>Email:</strong> admin@treasure.edu<br />
              <strong>Password:</strong> admin123
            </p>
            <p className="text-blue-600 text-xs mt-2">
              <strong>Note:</strong> You can change this password after first login
            </p>
          </div>

          {/* Additional back to home link at bottom for mobile users */}
          <div className="mt-4 text-center lg:hidden">
            <Link href="/">
              <Button variant="link" className="text-textSecondary hover:text-textPrimary">
                ← Back to Homepage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
