import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Plus,
  Camera,
  Megaphone,
  GraduationCap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TeacherDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not teacher
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'teacher')) {
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

  const { data: exams = [] } = useQuery({
    queryKey: ['/api/exams'],
    enabled: !!user && user.role === 'teacher',
    retry: false,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
    enabled: !!user && user.role === 'teacher',
    retry: false,
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ['/api/gallery'],
    enabled: !!user && user.role === 'teacher',
    retry: false,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get exams created by this teacher
  const myExams = exams.filter((exam: any) => exam.createdBy === user.id);
  const myAnnouncements = announcements.filter((announcement: any) => announcement.createdBy === user.id);

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="teacher-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary" data-testid="dashboard-title">
            Teacher Dashboard
          </h1>
          <p className="text-textSecondary mt-2">
            Welcome back, {user.firstName}! Manage your classes, exams, and content here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="stat-my-exams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{myExams.length}</div>
                  <div className="text-blue-100">My Exams</div>
                </div>
                <GraduationCap className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white" data-testid="stat-my-announcements">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{myAnnouncements.length}</div>
                  <div className="text-green-100">My Announcements</div>
                </div>
                <Megaphone className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white" data-testid="stat-total-gallery">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{gallery.length}</div>
                  <div className="text-orange-100">Gallery Images</div>
                </div>
                <Camera className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white" data-testid="stat-active-exams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{exams.filter((e: any) => e.isActive).length}</div>
                  <div className="text-purple-100">Active Exams</div>
                </div>
                <BookOpen className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="quick-action-create-exam">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-textPrimary mb-2">Create New Exam</h3>
              <p className="text-textSecondary mb-4">Set up a new examination for your students</p>
              <Button className="w-full" data-testid="button-create-exam">
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="quick-action-create-announcement">
            <CardContent className="p-6 text-center">
              <Megaphone className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-textPrimary mb-2">New Announcement</h3>
              <p className="text-textSecondary mb-4">Share important information with students</p>
              <Button className="w-full bg-secondary hover:bg-green-700" data-testid="button-create-announcement">
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="quick-action-upload-gallery">
            <CardContent className="p-6 text-center">
              <Camera className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-textPrimary mb-2">Upload to Gallery</h3>
              <p className="text-textSecondary mb-4">Add new photos to the school gallery</p>
              <Button className="w-full bg-accent hover:bg-orange-600" data-testid="button-upload-gallery">
                <Plus className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Recent Exams */}
          <Card data-testid="recent-exams">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Recent Exams</span>
                <Link href="/teacher/exams">
                  <Button variant="outline" size="sm" data-testid="view-all-exams">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myExams.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                  <p className="text-textSecondary">No exams created yet</p>
                  <Button className="mt-4" data-testid="create-first-exam">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Exam
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myExams.slice(0, 5).map((exam: any) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-backgroundSurface rounded-lg">
                      <div>
                        <div className="font-medium text-textPrimary">{exam.title}</div>
                        <div className="text-sm text-textSecondary">
                          {exam.subject} • {exam.className} • {exam.duration} mins
                        </div>
                      </div>
                      <Badge 
                        variant={exam.isActive ? 'default' : 'secondary'}
                        data-testid={`exam-status-${exam.id}`}
                      >
                        {exam.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Recent Announcements */}
          <Card data-testid="recent-announcements">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Recent Announcements</span>
                <Link href="/teacher/announcements">
                  <Button variant="outline" size="sm" data-testid="view-all-announcements">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myAnnouncements.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                  <p className="text-textSecondary">No announcements created yet</p>
                  <Button className="mt-4 bg-secondary hover:bg-green-700" data-testid="create-first-announcement">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Announcement
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAnnouncements.slice(0, 5).map((announcement: any) => (
                    <div key={announcement.id} className="p-3 bg-backgroundSurface rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-textPrimary">{announcement.title}</div>
                        <Badge variant="outline" data-testid={`announcement-audience-${announcement.id}`}>
                          {announcement.audience}
                        </Badge>
                      </div>
                      <div className="text-sm text-textSecondary line-clamp-2">
                        {announcement.body}
                      </div>
                      <div className="text-xs text-textSecondary mt-1">
                        {new Date(announcement.createdAt).toLocaleDateString()}
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
