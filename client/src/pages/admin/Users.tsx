import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, UserPlus, Edit2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  class: string | null;
  created_at: string;
  role_name: string;
  role_id: number;
}

export default function AdminUsers() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role_name !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, [user, authLoading, toast]);

  // Fetch users from Supabase
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          phone,
          class,
          created_at,
          role_id,
          roles (role_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data.map(user => ({
        ...user,
        role_name: user.roles?.role_name || 'Unknown',
        phone: user.phone || '-',
        class: user.class || '-'
      }));
    },
    enabled: !!user && user.role_name === 'admin',
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      // First get the role_id for the new role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', newRole.charAt(0).toUpperCase() + newRole.slice(1))
        .single();

      if (roleError) throw roleError;
      if (!roleData) throw new Error('Role not found');

      // Update the user's role_id
      const { error } = await supabase
        .from('users')
        .update({ role_id: roleData.id })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  // Create new user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; full_name: string; role: string }) => {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });

      if (authError) throw authError;

      // 2. Get role_id
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', userData.role.charAt(0).toUpperCase() + userData.role.slice(1))
        .single();

      if (!roleData) throw new Error('Role not found');

      // 3. Add to users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: userData.email,
          full_name: userData.full_name,
          role_id: roleData.id
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "User has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role_name !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-textSecondary">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u: User) => {
    const matchesSearch = !searchTerm || 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.role_name.toLowerCase() === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'teacher':
        return 'default';
      case 'student':
        return 'secondary';
      case 'parent':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleRoleUpdate = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const handleCreateUser = async (userData: { email: string; password: string; full_name: string; role: string }) => {
    createUserMutation.mutate(userData);
  };

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-users">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">User Management</h1>
          <p className="text-textSecondary">Manage user accounts and roles</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-users"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px]" data-testid="filter-role">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => {
                  // Simple create user form - you can replace this with a modal
                  const email = prompt("Enter user email:");
                  const password = prompt("Enter temporary password:");
                  const fullName = prompt("Enter full name:");
                  const role = prompt("Enter role (admin/teacher/student/parent):");
                  
                  if (email && password && fullName && role) {
                    handleCreateUser({ email, password, full_name: fullName, role });
                  }
                }}
                className="whitespace-nowrap"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u: User) => (
                      <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-textPrimary">
                                {u.full_name}
                              </div>
                              <div className="text-sm text-textSecondary">{u.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(u.role_name)} data-testid={`role-badge-${u.id}`}>
                            {u.role_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.class}</TableCell>
                        <TableCell>
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`user-actions-${u.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleRoleUpdate(u.id, 'admin')}
                                disabled={u.role_name.toLowerCase() === 'admin' || updateRoleMutation.isPending}
                                data-testid={`set-admin-${u.id}`}
                              >
                                Set as Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRoleUpdate(u.id, 'teacher')}
                                disabled={u.role_name.toLowerCase() === 'teacher' || updateRoleMutation.isPending}
                                data-testid={`set-teacher-${u.id}`}
                              >
                                Set as Teacher
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRoleUpdate(u.id, 'student')}
                                disabled={u.role_name.toLowerCase() === 'student' || updateRoleMutation.isPending}
                                data-testid={`set-student-${u.id}`}
                              >
                                Set as Student
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRoleUpdate(u.id, 'parent')}
                                disabled={u.role_name.toLowerCase() === 'parent' || updateRoleMutation.isPending}
                                data-testid={`set-parent-${u.id}`}
                              >
                                Set as Parent
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
