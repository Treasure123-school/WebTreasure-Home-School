import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Trophy, 
  Download, 
  FileText,
  Search,
  TrendingUp,
  Calendar,
  BookOpen
} from "lucide-react";

export default function StudentResults() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: [`/api/submissions/student/${user?.id}`],
    enabled: !!user && user.role === 'student',
    retry: false,
  });

  // We would need to join with exams data in a real implementation
  // For now, we'll work with submission data only
  const { data: exams = [] } = useQuery({
    queryKey: ['/api/exams'],
    enabled: !!user,
    retry: false,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Create a map of exam IDs to exam details
  const examMap = exams.reduce((acc: any, exam: any) => {
    acc[exam.id] = exam;
    return acc;
  }, {});

  // Enhance submissions with exam details
  const enhancedSubmissions = submissions.map((submission: any) => ({
    ...submission,
    exam: examMap[submission.examId] || { title: 'Unknown Exam', subject: 'Unknown' }
  }));

  // Filter submissions based on search term
  const filteredSubmissions = enhancedSubmissions.filter((submission: any) =>
    !searchTerm || 
    submission.exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalExams = submissions.length;
  const averageScore = totalExams > 0 
    ? Math.round(submissions.reduce((sum: number, sub: any) => sum + sub.percentage, 0) / totalExams)
    : 0;
  const highestScore = totalExams > 0 
    ? Math.max(...submissions.map((sub: any) => sub.percentage))
    : 0;
  const recentImprovement = totalExams > 1
    ? submissions[0]?.percentage - submissions[1]?.percentage || 0
    : 0;

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: "default", grade: "A+", color: "text-green-600" };
    if (percentage >= 80) return { variant: "default", grade: "A", color: "text-green-600" };
    if (percentage >= 70) return { variant: "secondary", grade: "B", color: "text-blue-600" };
    if (percentage >= 60) return { variant: "outline", grade: "C", color: "text-yellow-600" };
    if (percentage >= 50) return { variant: "outline", grade: "D", color: "text-orange-600" };
    return { variant: "destructive", grade: "F", color: "text-red-600" };
  };

  const handleDownloadResult = (submissionId: string) => {
    // In a real implementation, this would generate and download a PDF
    toast({
      title: "Download Started",
      description: "Your result slip is being generated and will download shortly.",
    });
  };

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="student-results">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">My Results</h1>
          <p className="text-textSecondary">View and download your exam results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="stat-total-exams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{totalExams}</div>
                  <div className="text-blue-100">Total Exams</div>
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

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white" data-testid="stat-highest-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{highestScore}%</div>
                  <div className="text-orange-100">Highest Score</div>
                </div>
                <TrendingUp className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white" data-testid="stat-improvement">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {recentImprovement > 0 ? '+' : ''}{recentImprovement}%
                  </div>
                  <div className="text-purple-100">Recent Change</div>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary h-4 w-4" />
                <Input
                  placeholder="Search by exam title or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-results"
                />
              </div>
              <div className="text-sm text-textSecondary">
                {filteredSubmissions.length} of {submissions.length} results
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Exam Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                {submissions.length === 0 ? (
                  <>
                    <FileText className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                    <p className="text-textSecondary mb-4">No exam results yet</p>
                    <p className="text-sm text-textSecondary">Take your first exam to see results here</p>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                    <p className="text-textSecondary">No results found for "{searchTerm}"</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date Taken</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission: any) => {
                      const gradeBadge = getGradeBadge(submission.percentage);
                      return (
                        <TableRow key={submission.id} data-testid={`result-row-${submission.id}`}>
                          <TableCell>
                            <div className="font-medium text-textPrimary">
                              {submission.exam.title}
                            </div>
                          </TableCell>
                          <TableCell>{submission.exam.subject}</TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {submission.score}/{submission.totalMarks}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`font-semibold ${gradeBadge.color}`}>
                                {submission.percentage}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={gradeBadge.variant as any}
                              data-testid={`grade-badge-${submission.id}`}
                            >
                              {gradeBadge.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-textSecondary">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResult(submission.id)}
                              data-testid={`download-result-${submission.id}`}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        {submissions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-backgroundSurface rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">{averageScore}%</div>
                  <div className="text-sm text-textSecondary">Overall Average</div>
                </div>
                <div className="text-center p-4 bg-backgroundSurface rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{highestScore}%</div>
                  <div className="text-sm text-textSecondary">Best Performance</div>
                </div>
                <div className="text-center p-4 bg-backgroundSurface rounded-lg">
                  <div className={`text-2xl font-bold mb-2 ${recentImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recentImprovement > 0 ? '+' : ''}{recentImprovement}%
                  </div>
                  <div className="text-sm text-textSecondary">Recent Trend</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
