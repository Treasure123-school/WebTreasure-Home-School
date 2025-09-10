// client/src/pages/admin/Dashboard.tsx
// --- FULLY UPDATED AND CORRECTED FILE ---

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  Camera
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// ✅ FIX: This interface now EXACTLY matches the data sent by your backend API.
interface DashboardStats {
  userCount: number;
  announcementCount: number;
  examCount: number;
  pendingEnrollmentCount: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // The useQuery hook now expects the correct DashboardStats type.
  const { data, isLoading: dataLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // The API call remains the same, but the expected result is different.
      return apiRequest<DashboardStats>('GET', '/api/admin/dashboard-stats');
    },
    // This logic is perfect, no changes needed here.
    enabled: !!user && !authLoading && user.role_name === 'Admin',
    retry: 1, // Don't retry on failure, show an error instead.
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes.
    throwOnError: true, // Let react-query handle the error state.
  });

  if (authLoading || (dataLoading && !data)) {
    return (
      <Layout type="portal">
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner message="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  // ✅ IMPROVEMENT: A much cleaner way to handle the error state.
  if (isError) {
    return (
        <Layout type="portal">
            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <Card className="w-full max-w-md text-center bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Failed to Load Dashboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive/80 mb-4">
                            There was an error communicating with the server. Please check your network connection.
                        </p>
                        <Button onClick={() => refetch()} variant="destructive">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
  }

  // Use default values for a seamless display even if data is temporarily null.
  const stats = data || {
    userCount: 0,
    announcementCount: 0,
    examCount: 0,
    pendingEnrollmentCount: 0,
  };

  return (
    <Layout type="portal">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-textSecondary">
            Welcome back, {user?.full_name}! Here's a summary of the school portal.
          </p>
        </div>

        {/* --- STATS CARDS --- */}
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

        {/* --- QUICK ACTIONS --- */}
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4">
                <ActionLink href="/admin/users" icon={Users}>Manage Users</ActionLink>
                <ActionLink href="/admin/users/create" icon={UserPlus}>Create User</ActionLink>
                <ActionLink href="/admin/announcements" icon={Megaphone}>Post Announcement</ActionLink>
                <ActionLink href="/admin/exams" icon={BookOpen}>Manage Exams</ActionLink>
                <ActionLink href="/admin/gallery" icon={Camera}>Update Gallery</ActionLink>
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


// --- Reusable Helper Components for a Cleaner Layout ---

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  link: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ title, value, icon: Icon, link, color }: StatCardProps) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 text-blue-100",
        green: "from-green-500 to-green-600 text-green-100",
        orange: "from-orange-500 to-orange-600 text-orange-100",
        purple: "from-purple-500 to-purple-600 text-purple-100",
    }
  return (
    <Link href={link}>
      <a className={`group block rounded-lg bg-gradient-to-r p-6 text-white shadow-lg transition-transform hover:-translate-y-1 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm font-medium uppercase tracking-wider">{title}</div>
          </div>
          <Icon className="h-12 w-12 opacity-50 transition-transform group-hover:scale-110" />
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span>View Details</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </a>
    </Link>
  );
}

interface ActionLinkProps {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
}

function ActionLink({ href, icon: Icon, children }: ActionLinkProps) {
    return (
        <Link href={href}>
            <Button variant="outline" as="a" className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {children}
            </Button>
        </Link>
    );
}
