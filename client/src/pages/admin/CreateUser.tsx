import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Layout from "@/components/Layout";

const CLASS_OPTIONS = [
  'Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Kindergarten',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'
];

export default function CreateUser() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'student',
    class: '',
    phone: '',
    gender: '' as 'Male' | 'Female' | '',
    dob: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role_name !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
    }
  }, [user, authLoading, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user || user.role_name !== 'admin') {
        throw new Error('Admin privileges required');
      }

      // Validate required fields
      if (formData.role === 'student' && !formData.class) {
        throw new Error('Class is required for students');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          role: formData.role,
          class: formData.class || null,
          phone: formData.phone || null,
          gender: formData.gender || null,
          dob: formData.dob || null
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "User created successfully.",
        variant: "success",
      });
      
      // Reset form
      setFormData({ 
        email: '', 
        password: '', 
        fullName: '', 
        role: 'student',
        class: '',
        phone: '',
        gender: '',
        dob: ''
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({...formData, password});
  };

  if (authLoading) {
    return (
      <Layout type="portal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role_name !== 'admin') {
    return (
      <Layout type="portal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
            <p className="text-textSecondary mb-6">You need admin privileges to access this page.</p>
            <Link href="/admin">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center space-x-4">
          <Link href="/admin/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">Create New User</h1>
            <p className="text-textSecondary">Add new members to the school portal system</p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Complete all required fields to create a new user account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields remain the same as before */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      placeholder="user@example.com"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        placeholder="Minimum 6 characters"
                        minLength={6}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={generateRandomPassword}
                        className="whitespace-nowrap"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                    placeholder="John Doe"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rest of the form remains the same */}
              {/* ... */}

              <div className="flex space-x-4 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      Creating User...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
                
                <Link href="/admin/users">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
