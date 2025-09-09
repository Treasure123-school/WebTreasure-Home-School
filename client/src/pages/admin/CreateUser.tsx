import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter"; // Corrected import
import { ArrowLeft, RefreshCw } from "lucide-react";
import Layout from "@/components/Layout";

// Class options array remains the same
const CLASS_OPTIONS = [
  'Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Kindergarten',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'
];

// Role options array based on your SQL file
const ROLE_OPTIONS = [
  'Admin', 'Teacher', 'Student', 'Parent'
];

export default function CreateUser() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation(); // Correct way to get the navigate function
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'Student', // Default to 'Student'
    class: '',
    phone: '',
    gender: '' as 'Male' | 'Female' | '',
    dob: ''
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not an admin
  useEffect(() => {
    if (!authLoading && (!user || user.role_name !== 'Admin')) {
      toast({
        title: "Unauthorized",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      navigate('/unauthorized');
    }
  }, [user, authLoading, toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user || user.role_name !== 'Admin') {
        throw new Error('Admin privileges required.');
      }

      // Validate required fields
      if (formData.role === 'Student' && !formData.class) {
        throw new Error('Class is required for students.');
      }
      
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', formData.role)
        .single();
      
      if (roleError || !roleData) {
        throw new Error('Could not find role ID for ' + formData.role);
      }
      
      const roleId = roleData.id;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role_id: roleId,
            class: formData.class || null,
            phone: formData.phone || null,
            gender: formData.gender || null,
            dob: formData.dob || null
          }
        }
      });
      
      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('User was not created in the auth system.');
      }

      toast({
        title: "Success",
        description: "User created successfully. A confirmation email has been sent.",
        variant: "success",
      });
      
      setFormData({ 
        email: '', 
        password: '', 
        fullName: '', 
        role: 'Student',
        class: '',
        phone: '',
        gender: '',
        dob: ''
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
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

  if (authLoading || !user || user.role_name !== 'Admin') {
    return (
      <Layout type="portal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <p className="text-textSecondary">Add new members to the school portal system.</p>
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="John Doe"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="user@example.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  <p className="text-xs text-muted-foreground">The user can change this password later.</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Account Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">User Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value, class: value !== 'Student' ? '' : formData.class })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.role === 'Student' && (
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select
                        value={formData.class}
                        onValueChange={(value) => setFormData({ ...formData, class: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASS_OPTIONS.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Optional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g., +2348012345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: 'Male' | 'Female') => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
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
