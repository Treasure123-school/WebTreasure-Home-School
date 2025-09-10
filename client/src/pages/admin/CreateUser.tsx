// client/src/pages/admin/CreateUser.tsx
// --- FULLY UPDATED AND CORRECTED FILE ---

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, RefreshCw, UserPlus } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from '@/components/LoadingSpinner';

// --- Constants for Form Options ---
const CLASS_OPTIONS = [
  'Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Kindergarten',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'
];

const ROLE_OPTIONS = ['Admin', 'Teacher', 'Student', 'Parent'];

// --- Type Definition for Form Data ---
interface UserFormData {
    email: string;
    password: string;
    full_name: string;
    role: string;
    class: string | null;
    phone: string | null;
    gender: 'Male' | 'Female' | null;
    dob: string | null;
}

export default function CreateUser() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'Student',
    class: '',
    phone: '',
    gender: '' as 'Male' | 'Female' | '',
    dob: ''
  });

  // ✅ IMPROVEMENT: Use React Query's `useMutation` for cleaner API logic.
  const mutation = useMutation({
    mutationFn: (newUser: UserFormData) => apiRequest('POST', '/api/admin/users', newUser),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `User "${formData.fullName}" has been created.`,
        variant: "default",
      });
      // ✅ FIX: Invalidate the correct query keys to refresh data automatically.
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      
      // ✅ IMPROVEMENT: Navigate back to the user list after creation.
      navigate('/admin/users');
    },
    onError: (error: Error) => {
        toast({
            title: "Creation Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.role === 'Student' && !formData.class) {
      toast({ title: "Validation Error", description: "Class is required for students.", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    
    mutation.mutate({
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      role: formData.role,
      class: formData.class || null,
      phone: formData.phone || null,
      gender: formData.gender || null,
      dob: formData.dob || null
    });
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({...formData, password: pass });
  };

  // --- Render Logic ---
  if (authLoading) {
    return <Layout type="portal"><LoadingSpinner message="Verifying permissions..." /></Layout>;
  }
  
  // Unauthorized access check
  if (!user || user.role_name !== 'Admin') {
    navigate('/unauthorized');
    return null; 
  }

  return (
    <Layout type="portal">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
            <Link href="/admin/users">
                <Button variant="outline" className="mb-4 flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to User List
                </Button>
            </Link>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-textPrimary">
                <UserPlus className="h-8 w-8 text-primary"/>
                Create New User
            </h1>
            <p className="text-textSecondary">Add a new member to the school portal system.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Complete all required fields (*) to create a new user account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* --- Basic Information Section --- */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="user@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="flex space-x-2">
                        <Input id="password" type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Minimum 6 characters" minLength={6}/>
                        <Button type="button" variant="outline" onClick={generateRandomPassword}>
                            <RefreshCw className="h-4 w-4 mr-2" /> Generate
                        </Button>
                    </div>
                </div>
              </div>

              {/* --- Account Details Section --- */}
              <div className="space-y-4 border-t pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">User Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value, class: value !== 'Student' ? '' : formData.class })}>
                      <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.role === 'Student' && (
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                        <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                        <SelectContent>
                            {CLASS_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* --- Optional Information Section --- */}
              <div className="space-y-4 border-t pt-6">
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female') => setFormData({ ...formData, gender: value })}>
                          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                    </div>
                 </div>
              </div>
              
              {/* --- Submission Buttons --- */}
              <div className="flex justify-end gap-4 border-t pt-6">
                <Link href="/admin/users"><Button type="button" variant="ghost">Cancel</Button></Link>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
