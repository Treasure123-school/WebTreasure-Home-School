// client/src/pages/admin/Dashboard.tsx
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  FileText, 
  UserPlus, 
  BookOpen,
  Megaphone,
  Camera,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface UserData { 
  id: string; 
  email: string; 
  full_name: string; 
  role_name: string; 
}

interface DashboardData {
  users: UserData[];
  announcements: any[];
  exams: any[];
  enrollments: any[];
  messages: any[];
  gallery: any[];
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data, isLoading: dataLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      console.log('Fetching admin dashboard data...');
      try {
        const response = await apiRequest<DashboardData>('GET', '/api/admin/dashboard-stats');
        return response;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
        return {
          users: [],
          announcements: [],
          exams: [],
          enrollments: [],
          messages: [],
          gallery: []
        };
      }
    },
    enabled: !!user && !authLoading && user.role_name === 'Admin',
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (authLoading || dataLoading) {
    return (
      <Layout type="portal">
        <LoadingSpinner message="Loading dashboard data..." />
      </Layout>
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

  const safeData = data || {
    users: [],
    announcements: [],
    exams: [],
    enrollments: [],
    messages: [],
    gallery: []
  };

  const hasData = Object.values(safeData).some(array => array.length > 0);

  if (!hasData) {
    return (
      <Layout type="portal">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Users className="mr-2 h-6 w-6" />
                Welcome to Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your dashboard is ready, but there's no data to display yet.
              </p>
              <p className="text-sm text-textSecondary mb-6">
                Start by adding users, announcements, exams, or other content to see statistics here.
              </p>
              <div className="space-y-3">
                <Button onClick={() => refetch()} variant="outline" className="w-full">
                  Check for New Data
                </Button>
                <Link href="/admin/users">
                  <Button className="w-full">
                    Manage Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const usersByRole = {
    admin: safeData.users.filter((u) => u.role_name === 'Admin'),
    teacher: safeData.users.filter((u) => u.role_name === 'Teacher'),
    student: safeData.users.filter((u) => u.role_name === 'Student'),
    parent: safeData.users.filter((u) => u.role_name === 'Parent'),
  };
    
  const pendingEnrollments = safeData.enrollments.filter((e) => e.status === 'pending');
  const recentMessages = safeData.messages.slice(0, 5);

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary" data-testid="dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-textSecondary mt-2">
            Welcome back, {user?.full_name}! Here's an overview of your school management system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/users">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer group" data-testid="stat-total-users">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{safeData.users.length}</div>
                    <div className="text-blue-100">Total Users</div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-12 w-12 text-blue-200" />
                    <ArrowRight className="h-5 w-5 ml-2 text-blue-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/exams">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all cursor-pointer group" data-testid="stat-active-exams">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{safeData.exams.length}</div>
                    <div className="text-green-100">Active Exams</div>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-12 w-12 text-green-200" />
                    <ArrowRight className="h-5 w-5 ml-2 text-green-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/announcements">
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer group" data-testid="stat-announcements">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{safeData.announcements.length}</div>
                    <div className="text-orange-100">Announcements</div>
                  </div>
                  <div className="flex items-center">
                    <Megaphone className="h-12 w-12 text-orange-200" />
                    <ArrowRight className="h-5 w-5 ml-2 text-orange-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/enrollments">
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer group" data-testid="stat-pending-enrollments">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{pendingEnrollments.length}</div>
                    <div className="text-purple-100">Pending Enrollments</div>
                  </div>
                  <div className="flex items-center">
                    <UserPlus className="h-12 w-12 text-purple-200" />
                    <ArrowRight className="h-5 w-5 ml-2 text-purple-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Link href="/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group" data-testid="users-overview">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Users Overview
                  </div>
                  <ArrowRight className="h-4 w-4 text-textSecondary group-hover:text-primary transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-textSecondary">Administrators</span>
                    <Badge variant="outline">{usersByRole.admin.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-textSecondary">Teachers</span>
                    <Badge variant="outline">{usersByRole.teacher.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-textSecondary">Students</span>
                    <Badge variant="outline">{usersByRole.student.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-textSecondary">Parents</span>
                    <Badge variant="outline">{usersByRole.parent.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card data-testid="quick-stats">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="mr-2 h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">Gallery Images</span>
                  </div>
                  <Badge variant="outline">{safeData.gallery.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">Messages</span>
                  </div>
                  <Badge variant="outline">{safeData.messages.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">Total Exams</span>
                  </div>
                  <Badge variant="outline">{safeData.exams.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">Active Announcements</span>
                  </div>
                  <Badge variant="outline">{safeData.announcements.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Link href="/admin/enrollments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group" data-testid="recent-enrollments">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Enrollment Requests
                  <ArrowRight className="h-4 w-4 text-textSecondary group-hover:text-primary transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingEnrollments.length === 0 ? (
                  <p className="text-textSecondary text-center py-4">No pending enrollment requests</p>
                ) : (
                  <div className="space-y-4">
                    {pendingEnrollments.slice(0, 5).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 bg-backgroundSurface rounded-lg">
                        <div>
                          <div className="font-medium text-textPrimary">
                            {enrollment.child_name}
                          </div>
                          <div className="text-sm text-textSecondary">
                            Parent: {enrollment.parent_name} • Age: {enrollment.child_age}
                          </div>
                        </div>
                        <Badge 
                          variant={enrollment.status === 'pending' ? 'secondary' : 'default'}
                          data-testid={`enrollment-status-${enrollment.id}`}
                        >
                          {enrollment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Card data-testid="recent-messages">
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <p className="text-textSecondary text-center py-4">No messages received</p>
              ) : (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="p-3 bg-backgroundSurface rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-textPrimary">{message.name}</div>
                        <div className="text-xs text-textSecondary">
                          {new Date(message.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-textSecondary line-clamp-2">
                        {message.message}
                      </div>
                      <div className="text-xs text-textSecondary mt-1">
                        {message.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/admin/users">
            <Button className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/users/create">
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create New User
            </Button>
          </Link>
          <Link href="/admin/announcements">
            <Button variant="outline" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Post Announcement
            </Button>
          </Link>
          <Link href="/admin/exams">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manage Exams
            </Button>
          </Link>
          <Link href="/admin/gallery">
            <Button variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Manage Gallery
            </Button>
          </Link>
          <Link href="/admin/enrollments">
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              View Enrollments
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
