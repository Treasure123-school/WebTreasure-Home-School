import { useEffect, useState } from "react";
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

interface User {
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

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeExams: 0,
    announcements: 0,
    pendingEnrollments: 0,
    galleryImages: 0,
    messages: 0
  });

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

  // Fetch all data for dashboard
  const { data: dashboardData, isLoading: dataLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, full_name, role_name')
        .order('created_at', { ascending: false });

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      // Fetch exams
      const { data: examsData } = await supabase
        .from('exams')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      // Fetch enrollments
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('id, child_name, parent_name, child_age, status, created_at')
        .order('created_at', { ascending: false });

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, name, email, message, created_at')
        .order('created_at', { ascending: false });

      // Fetch gallery
      const { data: galleryData } = await supabase
        .from('gallery')
        .select('id, caption, created_at')
        .order('created_at', { ascending: false });

      return {
        users: usersData || [],
        announcements: announcementsData || [],
        exams: examsData || [],
        enrollments: enrollmentsData || [],
        messages: messagesData || [],
        gallery: galleryData || []
      };
    },
    enabled: !!user && user.role_name === 'admin',
  });

  // Calculate stats when data loads
  useEffect(() => {
    if (dashboardData) {
      const pendingEnrollments = dashboardData.enrollments.filter((e: Enrollment) => e.status === 'pending');
      
      setStats({
        totalUsers: dashboardData.users.length,
        activeExams: dashboardData.exams.length,
        announcements: dashboardData.announcements.length,
        pendingEnrollments: pendingEnrollments.length,
        galleryImages: dashboardData.gallery.length,
        messages: dashboardData.messages.length
      });
    }
  }, [dashboardData]);

  if (authLoading || dataLoading) {
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

  const usersByRole = {
    admin: dashboardData?.users.filter((u: User) => u.role_name === 'Admin') || [],
    teacher: dashboardData?.users.filter((u: User) => u.role_name === 'Teacher') || [],
    student: dashboardData?.users.filter((u: User) => u.role_name === 'Student') || [],
    parent: dashboardData?.users.filter((u: User) => u.role_name === 'Parent') || [],
  };

  const pendingEnrollments = dashboardData?.enrollments.filter((e: Enrollment) => e.status === 'pending') || [];
  const recentMessages = dashboardData?.messages.slice(0, 5) || [];

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary" data-testid="dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-textSecondary mt-2">
            Welcome back, {user.full_name}! Here's an overview of your school management system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="stat-total-users">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
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
                  <div className="text-3xl font-bold">{stats.activeExams}</div>
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
                  <div className="text-3xl font-bold">{stats.announcements}</div>
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
                  <div className="text-3xl font-bold">{stats.pendingEnrollments}</div>
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
                  <Badge variant="outline">{stats.galleryImages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">Messages</span>
                  </div>
                  <Badge variant="outline">{stats.messages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">Total Exams</span>
                  </div>
                  <Badge variant="outline">{stats.activeExams}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">Active Announcements</span>
                  </div>
                  <Badge variant="outline">{stats.announcements}</Badge>
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
                  {pendingEnrollments.slice(0, 5).map((enrollment: Enrollment) => (
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
                  {recentMessages.map((message: Message) => (
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
