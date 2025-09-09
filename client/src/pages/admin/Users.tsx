// client/src/pages/admin/Users.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Import the new helper
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
import { Search, Users, UserPlus, Edit2, MoreHorizontal, Mail, Trash2, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateUser from "./CreateUser";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  class: string | null;
  created_at: string;
  role_name: string;
  role_id: number;
  gender: string | null;
  dob: string | null;
}

export default function AdminUsers() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role_name !== 'Admin')) {
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

  // FIX: Fetch users from your backend API
  const { data: usersData, isLoading: usersLoading, refetch } = useQuery({
    queryKey: ['users', searchTerm, roleFilter, classFilter],
    queryFn: async () => {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (roleFilter !== 'all') params.append('role', roleFilter);
        if (classFilter !== 'all') params.append('class', classFilter);

        const url = `/api/admin/users?${params.toString()}`;
        return await apiRequest('GET', url);
    },
    enabled: !!user && user.role_name === 'Admin',
  });
  
  const users: User[] = (usersData?.users || []).map((u: any) => ({
      ...u,
      role_name: u.roles?.role_name || 'Unknown',
      phone: u.phone || '-',
      class: u.class || '-',
      gender: u.gender || '-',
      dob: u.dob || '-'
  }));


  // FIX: Update user role mutation to use backend API
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      await apiRequest('PUT', `/api/admin/users/${userId}/role`, { role: newRole });
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

  // FIX: Delete user mutation to use backend API
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  // FIX: Send welcome email mutation to use backend API
  const sendWelcomeEmailMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('POST', `/api/admin/users/${userId}/send-welcome`);
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Welcome email has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send welcome email.",
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

  if (!user || user.role_name !== 'Admin') {
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
    
    const matchesRole = roleFilter === "all" || u.role_name.toLowerCase() === roleFilter.toLowerCase();
    
    const matchesClass = classFilter === "all" || u.class === classFilter;
    
    return matchesSearch && matchesRole && matchesClass;
  });

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(users
    .filter((u: User) => u.class && u.class !== '-')
    .map((u: User) => u.class as string)
  ));

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

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSendWelcomeEmail = (userId: string, userName: string) => {
    if (confirm(`Send welcome email to ${userName}?`)) {
      sendWelcomeEmailMutation.mutate(userId);
    }
  };

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-users">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">User Management</h1>
            <p className="text-textSecondary">Manage user accounts and roles</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system. They will receive an email with login instructions.
                </DialogDescription>
              </DialogHeader>
              <CreateUser onSuccess={() => {
                setIsCreateDialogOpen(false);
                refetch();
              }} />
            </DialogContent>
          </Dialog>
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
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="filter-role">
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
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="filter-class">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((classOption) => (
                    <SelectItem key={classOption} value={classOption}>
                      {classOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              All Users ({users.length})
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={usersLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">No users found</p>
                {searchTerm || roleFilter !== 'all' || classFilter !== 'all' ? (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setClassFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                ) : null}
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
                      <TableHead>Gender</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: User) => (
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
                        <TableCell>{u.gender}</TableCell>
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
                                onClick={() => handleSendWelcomeEmail(u.id, u.full_name)}
                                disabled={sendWelcomeEmailMutation.isPending}
                                data-testid={`send-welcome-${u.id}`}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Welcome Email
                              </DropdownMenuItem>
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
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(u.id, u.full_name)}
                                disabled={deleteUserMutation.isPending}
                                className="text-destructive focus:text-destructive"
                                data-testid={`delete-user-${u.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
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
