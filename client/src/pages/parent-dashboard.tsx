import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Trophy, 
  FileText,
  TrendingUp,
  Calendar,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ParentDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not parent
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'parent')) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements', { audience: 'parents' }],
    enabled: !!user && user.role === 'parent',
    retry: false,
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ['/api/gallery'],
    enabled: !!user && user.role === 'parent',
    retry: false,
  });

  // In a real implementation, we would have child-parent relationships
  // and fetch specific child data. For now, we'll show placeholder data.
  const mockChildData = {
    name: "Your Child", // Would come from child-parent relationship
    class: "Primary 5",
    recentExams: [],
    averageScore: 0,
    attendance: 95,
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="parent-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary" data-testid="dashboard-title">
            Parent Dashboard
          </h1>
          <p className="text-textSecondary mt-2">
            Welcome back, {user.firstName}! Here's your child's academic progress overview.
          </p>
        </div>

        {/* Child Info Card */}
        <Card className="mb-8" data-testid="child-info">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-backgroundSurface rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-textPrimary">{mockChildData.name}</h3>
                  <p className="text-textSecondary">Class: {mockChildData.class}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-textSecondary">Attendance Rate</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-textSecondary text-sm">
                To view specific child progress, please contact the school administration to link your child's account.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="stat-academic-performance">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">B+</div>
                  <div className="text-blue-100">Academic Grade</div>
                </div>
                <GraduationCap className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white" data-testid="stat-attendance">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-green-100">Attendance</div>
                </div>
                <Calendar className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white" data-testid="stat-exams-taken">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-orange-100">Exams Taken</div>
                </div>
                <BookOpen className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white" data-testid="stat-improvement">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">+5%</div>
                  <div className="text-purple-100">Improvement</div>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Academic Progress Placeholder */}
          <Card data-testid="academic-progress">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Academic Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <GraduationCap className="h-16 w-16 text-textSecondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-textPrimary mb-2">Child Progress Tracking</h3>
                <p className="text-textSecondary mb-4">
                  Detailed academic progress and exam results will be available once your child's account is linked.
                </p>
                <div className="text-left space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between items-center p-2 bg-backgroundSurface rounded">
                    <span className="text-textSecondary">Mathematics</span>
                    <Badge variant="outline">A-</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-backgroundSurface rounded">
                    <span className="text-textSecondary">English</span>
                    <Badge variant="outline">B+</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-backgroundSurface rounded">
                    <span className="text-textSecondary">Science</span>
                    <Badge variant="outline">A</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card data-testid="recent-activity">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-backgroundSurface rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-textPrimary">Excellent Performance</div>
                    <div className="text-sm text-textSecondary">Scored 95% in Mathematics Test</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-backgroundSurface rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-textPrimary">Perfect Attendance</div>
                    <div className="text-sm text-textSecondary">No absences this week</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-backgroundSurface rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-textPrimary">Homework Submitted</div>
                    <div className="text-sm text-textSecondary">All assignments completed on time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Announcements for Parents */}
        <Card data-testid="parent-announcements">
          <CardHeader>
            <CardTitle>School Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">No announcements for parents at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 5).map((announcement: any) => (
                  <div key={announcement.id} className="p-4 bg-backgroundSurface rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-textPrimary">{announcement.title}</div>
                      <div className="text-xs text-textSecondary">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-textSecondary line-clamp-3">
                      {announcement.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
