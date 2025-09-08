import { useState, useEffect } from 'react'; // ADD useEffect
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter"; // ADD useLocation
import { ArrowLeft, RefreshCw } from "lucide-react";

const CLASS_OPTIONS = [
  'Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Kindergarten',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'
];

export default function CreateUser() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation(); // ADD this
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

  // ADD this useEffect to check authentication
  useEffect(() => {
    if (!user || user.role_name !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "Redirecting to dashboard...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/admin');
      }, 2000);
    }
  }, [user, toast, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Validate required fields based on role
      if (formData.role === 'student' && !formData.class) {
        throw new Error('Class is required for students');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Call the secure backend endpoint to create the user
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
        description: "User created successfully. A welcome email has been sent.",
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
      
      // Invalidate users query to refresh the list
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

  // ADD loading state
  if (!user || user.role_name !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Complete all required fields to create a new user account. The user will receive login credentials via email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
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

            {/* Role and Class Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Role & Classification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      role: value, 
                      class: value !== 'student' ? '' : formData.class
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Select 
                      value={formData.class} 
                      onValueChange={(value) => setFormData({...formData, class: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS.map((classOption) => (
                          <SelectItem key={classOption} value={classOption}>
                            {classOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+234 800 000 0000"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value: 'Male' | 'Female') => setFormData({...formData, gender: value})}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full"
                />
              </div>
            </div>

            {/* Form Actions */}
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
  );
}
