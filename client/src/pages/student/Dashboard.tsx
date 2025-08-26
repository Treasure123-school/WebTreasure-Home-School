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
  FileText, 
  Trophy,
  Clock,
  CheckCircle,
  Download,
  Play,
  Megaphone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
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
    enabled: !!user && user.role === 'student',
    retry: false,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: [`/api/submissions/student/${user?.id}`],
    enabled: !!user && user.role === 'student',
    retry: false,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
    enabled: !!user && user.role === 'student',
    retry: false,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const availableExams = exams.filter((exam: any) => 
    exam.isActive && !submissions.some((sub: any) => sub.examId === exam.id)
  );
  
  const completedExams = submissions.length;
  const averageScore = submissions.length > 0 
    ? Math.round(submissions.reduce((sum: number, sub: any) => sum + sub.percentage, 0) / submissions.length)
    : 0;

  // Filter announcements for students
  const studentAnnouncements = announcements.filter((announcement: any) => 
    announcement.audience === 'students' || announcement.audience === 'all'
  );

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="student-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary" data-testid="dashboard-title">
            Student Dashboard
          </h1>
          <p className="text-textSecondary mt-2">
            Welcome back, {user.firstName}! Here's your academic overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="stat-available-exams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{availableExams.length}</div>
                  <div className="text-blue-100">Available Exams</div>
                </div>
                <BookOpen className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white" data-testid="stat-average-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{averageScore}%</div>
                  <div className="text-green-100">Average Score</div>
                </div>
                <Trophy className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white" data-testid="stat-completed-exams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{completedExams}</div>
                  <div className="text-orange-100">Completed Exams</div>
                </div>
                <CheckCircle className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Available Exams */}
          <Card data-testid="available-exams">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Exams</span>
                {availableExams.length > 0 && (
                  <Badge variant="secondary" data-testid="available-count">
                    {availableExams.length} Available
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableExams.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                  <p className="text-textSecondary">No exams available at the moment</p>
                  <p className="text-sm text-textSecondary mt-2">Check back later for new exams</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableExams.slice(0, 5).map((exam: any) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-backgroundSurface rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-textPrimary">{exam.title}</div>
                        <div className="text-sm text-textSecondary flex items-center space-x-4 mt-1">
                          <span>{exam.subject}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {exam.duration} mins
                          </span>
                          <span>{exam.totalMarks} marks</span>
                        </div>
                      </div>
                      <Link href={`/exam/${exam.id}`}>
                        <Button size="sm" data-testid={`start-exam-${exam.id}`}>
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {availableExams.length > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-textSecondary">
                        And {availableExams.length - 5} more exams available
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card data-testid="recent-results">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Results</span>
                <Link href="/student/results">
                  <Button variant="outline" size="sm" data-testid="view-all-results">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                  <p className="text-textSecondary">No exam results yet</p>
                  <p className="text-sm text-textSecondary mt-2">Take your first exam to see results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission: any) => {
                    // Find the exam details
                    const exam = exams.find((e: any) => e.id === submission.examId);
                    return (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-backgroundSurface rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-textPrimary">
                            {exam?.title || 'Unknown Exam'}
                          </div>
                          <div className="text-sm text-textSecondary">
                            {exam?.subject} • Score: {submission.score}/{submission.totalMarks} • {submission.percentage}%
                          </div>
                          <div className="text-xs text-textSecondary mt-1">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={submission.percentage >= 80 ? "default" : submission.percentage >= 60 ? "secondary" : "destructive"}
                            data-testid={`result-grade-${submission.id}`}
                          >
                            {submission.percentage >= 80 ? "A" : submission.percentage >= 60 ? "B" : "C"}
                          </Badge>
                          <Button variant="outline" size="sm" data-testid={`download-result-${submission.id}`}>
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card data-testid="quick-action-take-exam">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-textPrimary mb-2">Take an Exam</h3>
              <p className="text-textSecondary mb-4">
                {availableExams.length > 0 
                  ? `You have ${availableExams.length} exam${availableExams.length === 1 ? '' : 's'} waiting`
                  : 'No exams available at the moment'
                }
              </p>
              {availableExams.length > 0 ? (
                <Link href={`/exam/${availableExams[0].id}`}>
                  <Button className="w-full" data-testid="button-take-exam">
                    <Play className="mr-2 h-4 w-4" />
                    Start Next Exam
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full" data-testid="button-no-exams">
                  <Clock className="mr-2 h-4 w-4" />
                  Check Back Later
                </Button>
              )}
            </CardContent>
          </Card>

          <Card data-testid="quick-action-view-results">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-textPrimary mb-2">View Results</h3>
              <p className="text-textSecondary mb-4">
                {submissions.length > 0 
                  ? `Review your ${submissions.length} exam result${submissions.length === 1 ? '' : 's'}`
                  : 'No results available yet'
                }
              </p>
              <Link href="/student/results">
                <Button className="w-full bg-secondary hover:bg-green-700" data-testid="button-view-results">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Announcements */}
        <Card data-testid="student-announcements">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="mr-2 h-5 w-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">No announcements available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentAnnouncements.slice(0, 3).map((announcement: any) => (
                  <div key={announcement.id} className="p-4 bg-backgroundSurface rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-textPrimary">{announcement.title}</div>
                      <div className="text-xs text-textSecondary">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-textSecondary line-clamp-2">
                      {announcement.body}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="mt-2"
                      data-testid={`announcement-audience-${announcement.id}`}
                    >
                      {announcement.audience}
                    </Badge>
                  </div>
                ))}
                {studentAnnouncements.length > 3 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm" data-testid="view-all-announcements">
                      View All Announcements
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
