import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  UserPlus, 
  Megaphone,
  ArrowRight,
  BookOpen,
  Camera,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  userCount: number;
  announcementCount: number;
  examCount: number;
  pendingEnrollmentCount: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect non-authenticated or non-admin users
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        setLocation('/login');
      } else if (user && user.role_name !== 'Admin') {
        // Not authorized, show message and redirect
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
        setLocation('/');
      }
    }
  }, [user, authLoading, isAuthenticated, setLocation, toast]);

  const { 
    data, 
    isLoading: dataLoading, 
    isError, 
    error,
    refetch 
  } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        return await apiRequest<DashboardStats>('GET', '/api/admin/dashboard-stats');
      } catch (err: any) {
        console.error('Dashboard stats error:', err);
        throw new Error(err.message || 'Failed to fetch dashboard data');
      }
    },
    enabled: !!user && user.role_name === 'Admin',
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout type="admin">
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner message="Verifying access..." />
        </div>
      </Layout>
    );
  }

  // If not authenticated or not admin, don't render the dashboard
  if (!isAuthenticated || (user && user.role_name !== 'Admin')) {
    return (
      <Layout type="admin">
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner message="Redirecting..." />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout type="admin">
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle className="text-destructive">Failed to Load Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'There was an error loading dashboard data.'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => refetch()} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={() => setLocation('/admin')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const stats = data || {
    userCount: 0,
    announcementCount: 0,
    examCount: 0,
    pendingEnrollmentCount: 0,
  };

  return (
    <Layout type="admin">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome, {user?.full_name}! Here's an overview of your school portal.
          </p>
        </div>

        {dataLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Loading dashboard data..." />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Users" 
                value={stats.userCount} 
                icon={Users} 
                link="/admin/users" 
                color="blue" 
              />
              <StatCard 
                title="Total Exams" 
                value={stats.examCount} 
                icon={GraduationCap} 
                link="/admin/exams" 
                color="green" 
              />
              <StatCard 
                title="Announcements" 
                value={stats.announcementCount} 
                icon={Megaphone} 
                link="/admin/announcements" 
                color="orange" 
              />
              <StatCard 
                title="Pending Enrollments" 
                value={stats.pendingEnrollmentCount} 
                icon={UserPlus} 
                link="/admin/enrollments" 
                color="purple" 
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage key areas of the portal from here.
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-center gap-4">
                <ActionLink href="/admin/users" icon={Users}>
                  Manage Users
                </ActionLink>
                <ActionLink href="/admin/users/create" icon={UserPlus}>
                  Create New User
                </ActionLink>
                <ActionLink href="/admin/announcements" icon={Megaphone}>
                  Post Announcement
                </ActionLink>
                <ActionLink href="/admin/exams" icon={BookOpen}>
                  Manage Exams
                </ActionLink>
                <ActionLink href="/admin/gallery" icon={Camera}>
                  Update Gallery
                </ActionLink>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}

// StatCard Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  link: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ title, value, icon: Icon, link, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    orange: "from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
  };

  return (
    <Link href={link}>
      <a className={`group block rounded-xl bg-gradient-to-r p-6 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm font-medium uppercase tracking-wider opacity-80">{title}</div>
          </div>
          <Icon className="h-12 w-12 opacity-50 transition-transform group-hover:scale-110" />
        </div>
        <div className="mt-4 flex items-center text-sm opacity-80">
          <span>View Details</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </a>
    </Link>
  );
}

// ActionLink Component
interface ActionLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function ActionLink({ href, icon: Icon, children }: ActionLinkProps) {
  return (
    <Link href={href}>
      <Button variant="outline" className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {children}
      </Button>
    </Link>
  );
}
