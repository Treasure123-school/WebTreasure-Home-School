import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
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
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";

// Type definitions for your data
interface UserData { 
  id: string; 
  email: string; 
  full_name: string; 
  role_name: string; 
}

interface Announcement { 
  id: string; 
  title: string; 
  created_at: string; 
}

interface Exam { 
  id: string; 
  title: string; 
  created_at: string; 
}

interface Enrollment { 
  id: string; 
  child_name: string; 
  parent_name: string; 
  child_age: number; 
  status: string; 
  created_at: string; 
}

interface Message { 
  id: string; 
  name: string; 
  email: string; 
  message: string; 
  created_at: string; 
}

interface Gallery { 
  id: string; 
  caption: string; 
  created_at: string; 
}

interface DashboardData {
  users: UserData[];
  announcements: Announcement[];
  exams: Exam[];
  enrollments: Enrollment[];
  messages: Message[];
  gallery: Gallery[];
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Only fetch data when user is fully authenticated
  const { data, isLoading: dataLoading, isError, error } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      console.log('Fetching admin dashboard data...');
      
      // Use Promise.all to fetch all data concurrently for better performance
      const [
        { data: usersData, error: usersError },
        { data: announcementsData, error: announcementsError },
        { data: examsData, error: examsError },
        { data: enrollmentsData, error: enrollmentsError },
        { data: messagesData, error: messagesError },
        { data: galleryData, error: galleryError }
      ] = await Promise.all([
        supabase.from('users').select('id, email, full_name, roles(role_name)').order('created_at', { ascending: false }),
        supabase.from('announcements').select('id, title, created_at').order('created_at', { ascending: false }),
        supabase.from('exams').select('id, title, created_at').order('created_at', { ascending: false }),
        supabase.from('enrollments').select('id, child_name, parent_name, child_age, status, created_at').order('created_at', { ascending: false }),
        supabase.from('messages').select('id, name, email, message, created_at').order('created_at', { ascending: false }),
        supabase.from('gallery').select('id, caption, created_at').order('created_at', { ascending: false })
      ]);

      // Check for errors but don't throw for individual table errors
      const errors = [
        usersError, announcementsError, examsError, 
        enrollmentsError, messagesError, galleryError
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Partial data errors:', errors);
        // We'll still return available data instead of throwing
      }
      
      return {
        users: usersData?.map(u => ({ 
          ...u, 
          role_name: u.roles?.role_name || 'Unknown' 
        })) as UserData[] || [],
        announcements: announcementsData as Announcement[] || [],
        exams: examsData as Exam[] || [],
        enrollments: enrollmentsData as Enrollment[] || [],
        messages: messagesData as Message[] || [],
        gallery: galleryData as Gallery[] || []
      };
    },
    enabled: !!user && !authLoading, // Only fetch when user is fully authenticated
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Show loading if auth is still loading OR data is loading
  if (authLoading || dataLoading) {
    return (
      <Layout type="portal">
        <LoadingSpinner message="Loading dashboard data..." />
      </Layout>
    );
  }

  // If there's a major error and no data at all
  if (isError && !data) {
    console.error('Dashboard query error:', error);
    toast({
      title: "Error",
      description: "Failed to load dashboard data. Please try refreshing the page.",
      variant: "destructive",
    });
    
    return (
      <Layout type="portal">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CardTitle>Dashboard Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                There was a problem loading the dashboard data.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Use fallback empty arrays if data is undefined
  const safeData = data || {
    users: [],
    announcements: [],
    exams: [],
    enrollments: [],
    messages: [],
    gallery: []
  };

  // All data is available, now we can safely derive state and render
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="stat-total-users">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{safeData.users.length}</div>
                  <div className="text-blue-100">Total Users</div>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white" data-testid="stat-active-exams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{safeData.exams.length}</div>
                  <div className="text-green-100">Active Exams</div>
                </div>
                <GraduationCap className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white" data-testid="stat-announcements">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{safeData.announcements.length}</div>
                  <div className="text-orange-100">Announcements</div>
                </div>
                <Megaphone className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white" data-testid="stat-pending-enrollments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{pendingEnrollments.length}</div>
                  <div className="text-purple-100">Pending Enrollments</div>
                </div>
                <UserPlus className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Users Overview */}
          <Card data-testid="users-overview">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Users Overview
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

          {/* Quick Stats */}
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

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Enrollments */}
          <Card data-testid="recent-enrollments">
            <CardHeader>
              <CardTitle>Recent Enrollment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingEnrollments.length === 0 ? (
                <p className="text-textSecondary text-center py-4">No pending enrollment requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingEnrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-backgroundSurface rounded-lg">
                      <div>
                        <div className="font-medium text-textPrimary">{enrollment.child_name}</div>
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

          {/* Recent Messages */}
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
      </div>
    </Layout>
  );
}
