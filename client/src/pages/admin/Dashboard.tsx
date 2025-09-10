// client/src/pages/admin/Dashboard.tsx
// --- THIS IS THE FINAL, CORRECTED VERSION ---

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
  ShieldCheck
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// This interface matches the summary data from your API.
interface DashboardStats {
  userCount: number;
  announcementCount: number;
  examCount: number;
  pendingEnrollmentCount: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading: dataLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => apiRequest<DashboardStats>('GET', '/api/admin/dashboard-stats'),
    enabled: !!user && !authLoading && user.role_name === 'Admin',
    retry: 1,
    staleTime: 5 * 60 * 1000,
    throwOnError: true,
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

  if (isError) {
    return (
        <Layout type="portal">
            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <Card className="w-full max-w-md text-center bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Failed to Load Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive/80 mb-4">
                            There was an error communicating with the server. Please check your network.
                        </p>
                        <Button onClick={() => refetch()} variant="destructive">Try Again</Button>
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
    <Layout type="portal">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-textPrimary">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-textSecondary">
            Welcome, {user?.full_name}! Here's a summary of your school portal.
          </p>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={stats.userCount} icon={Users} link="/admin/users" color="blue" />
          <StatCard title="Total Exams" value={stats.examCount} icon={GraduationCap} link="/admin/exams" color="green" />
          <StatCard title="Announcements" value={stats.announcementCount} icon={Megaphone} link="/admin/announcements" color="orange" />
          <StatCard title="Pending Enrollments" value={stats.pendingEnrollmentCount} icon={UserPlus} link="/admin/enrollments" color="purple" />
        </div>

        {/* --- QUICK ACTIONS --- */}
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-sm text-muted-foreground">Manage key areas of the portal from here.</p>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4">
                <ActionLink href="/admin/users" icon={Users}>Manage Users</ActionLink>
                <ActionLink href="/admin/users/create" icon={UserPlus}>Create New User</ActionLink>
                <ActionLink href="/admin/announcements" icon={Megaphone}>Post Announcement</ActionLink>
                <ActionLink href="/admin/exams" icon={BookOpen}>Manage Exams</ActionLink>
                <ActionLink href="/admin/gallery" icon={Camera}>Update Gallery</ActionLink>
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// --- Reusable Helper Components ---

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
    }
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

