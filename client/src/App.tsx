import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import ExamInterface from "@/pages/exam-interface";
import Login from "@/pages/Login";

// Admin pages
import AdminUsers from "@/pages/admin/Users";
import AdminAnnouncements from "@/pages/admin/Announcements";
import AdminGallery from "@/pages/admin/Gallery";
import AdminExams from "@/pages/admin/Exams";
import AdminEnrollments from "@/pages/admin/Enrollments";

// Teacher pages
import TeacherExams from "@/pages/teacher/Exams";

// Student pages
import StudentResults from "@/pages/student/Results";
import TakeExam from "@/pages/student/TakeExam";

import { queryClient } from "./lib/queryClient";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/landing" component={Landing} />
          {/* Redirect any other route to login */}
          <Route path="/:rest*">
            {(params) => {
              // Don't redirect if already on login page
              if (typeof params.rest === 'string' && params.rest.startsWith('login')) {
                return <Login />;
              }
              return <Landing />;
            }}
          </Route>
        </>
      ) : (
        <>
          {/* Protected routes */}
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          
          {/* Dashboard routes */}
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/teacher/dashboard" component={TeacherDashboard} />
          <Route path="/student/dashboard" component={StudentDashboard} />
          <Route path="/parent/dashboard" component={ParentDashboard} />
          
          {/* Admin Routes */}
          {user?.role_name?.toLowerCase() === 'admin' && (
            <>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/announcements" component={AdminAnnouncements} />
              <Route path="/admin/gallery" component={AdminGallery} />
              <Route path="/admin/exams" component={AdminExams} />
              <Route path="/admin/enrollments" component={AdminEnrollments} />
            </>
          )}
          
          {/* Teacher Routes */}
          {user?.role_name?.toLowerCase() === 'teacher' && (
            <>
              <Route path="/teacher" component={TeacherDashboard} />
              <Route path="/teacher/exams" component={TeacherExams} />
            </>
          )}
          
          {/* Student Routes */}
          {user?.role_name?.toLowerCase() === 'student' && (
            <>
              <Route path="/student" component={StudentDashboard} />
              <Route path="/student/results" component={StudentResults} />
              <Route path="/exam/:examId" component={TakeExam} />
            </>
          )}
          
          {/* Parent Routes */}
          {user?.role_name?.toLowerCase() === 'parent' && (
            <>
              <Route path="/parent" component={ParentDashboard} />
            </>
          )}
          
          {/* Shared routes accessible to all authenticated users */}
          <Route path="/exam/:examId" component={ExamInterface} />
          
          {/* Redirect handlers for dashboard routes */}
          <Route path="/admin">
            {() => {
              window.location.href = '/admin/dashboard';
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Redirecting to Admin Dashboard...</span>
                </div>
              );
            }}
          </Route>
          
          <Route path="/teacher">
            {() => {
              window.location.href = '/teacher/dashboard';
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Redirecting to Teacher Dashboard...</span>
                </div>
              );
            }}
          </Route>
          
          <Route path="/student">
            {() => {
              window.location.href = '/student/dashboard';
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Redirecting to Student Dashboard...</span>
                </div>
              );
            }}
          </Route>
          
          <Route path="/parent">
            {() => {
              window.location.href = '/parent/dashboard';
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Redirecting to Parent Dashboard...</span>
                </div>
              );
            }}
          </Route>
          
          {/* Fallback for authenticated users accessing unauthorized routes */}
          <Route path="/:rest*">
            {(params) => {
              // Check if the user is trying to access a role-specific route they don't have access to
              const path = params.rest || '';
              
              if (path.startsWith('admin/') && user?.role_name?.toLowerCase() !== 'admin') {
                return (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
                      <p className="text-textSecondary">You don't have permission to access admin pages.</p>
                    </div>
                  </div>
                );
              }
              
              if (path.startsWith('teacher/') && user?.role_name?.toLowerCase() !== 'teacher') {
                return (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
                      <p className="text-textSecondary">You don't have permission to access teacher pages.</p>
                    </div>
                  </div>
                );
              }
              
              if (path.startsWith('student/') && user?.role_name?.toLowerCase() !== 'student') {
                return (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
                      <p className="text-textSecondary">You don't have permission to access student pages.</p>
                    </div>
                  </div>
                );
              }
              
              if (path.startsWith('parent/') && user?.role_name?.toLowerCase() !== 'parent') {
                return (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
                      <p className="text-textSecondary">You don't have permission to access parent pages.</p>
                    </div>
                  </div>
                );
              }
              
              // Redirect to appropriate dashboard based on role
              const role = user?.role_name?.toLowerCase();
              let redirectUrl = '/';
              
              switch (role) {
                case 'admin':
                  redirectUrl = '/admin/dashboard';
                  break;
                case 'teacher':
                  redirectUrl = '/teacher/dashboard';
                  break;
                case 'student':
                  redirectUrl = '/student/dashboard';
                  break;
                case 'parent':
                  redirectUrl = '/parent/dashboard';
                  break;
                default:
                  redirectUrl = '/';
              }
              
              window.location.href = redirectUrl;
              
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Redirecting to your dashboard...</span>
                </div>
              );
            }}
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
