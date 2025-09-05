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
          {/* Redirect any other route to landing */}
          <Route path="/:rest*" component={Landing} />
        </>
      ) : (
        <>
          {/* Protected routes */}
          <Route path="/" component={Home} />
          
          {/* Dashboard routes - match useAuth redirects */}
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
              
              {/* Redirect /admin to /admin/dashboard */}
              <Route path="/admin">
                {(params) => {
                  window.location.href = '/admin/dashboard';
                  return null;
                }}
              </Route>
            </>
          )}
          
          {/* Teacher Routes */}
          {user?.role_name?.toLowerCase() === 'teacher' && (
            <>
              <Route path="/teacher" component={TeacherDashboard} />
              <Route path="/teacher/exams" component={TeacherExams} />
              
              {/* Redirect /teacher to /teacher/dashboard */}
              <Route path="/teacher">
                {(params) => {
                  window.location.href = '/teacher/dashboard';
                  return null;
                }}
              </Route>
            </>
          )}
          
          {/* Student Routes */}
          {user?.role_name?.toLowerCase() === 'student' && (
            <>
              <Route path="/student" component={StudentDashboard} />
              <Route path="/student/results" component={StudentResults} />
              <Route path="/exam/:examId" component={TakeExam} />
              
              {/* Redirect /student to /student/dashboard */}
              <Route path="/student">
                {(params) => {
                  window.location.href = '/student/dashboard';
                  return null;
                }}
              </Route>
            </>
          )}
          
          {/* Parent Routes */}
          {user?.role_name?.toLowerCase() === 'parent' && (
            <>
              <Route path="/parent" component={ParentDashboard} />
              
              {/* Redirect /parent to /parent/dashboard */}
              <Route path="/parent">
                {(params) => {
                  window.location.href = '/parent/dashboard';
                  return null;
                }}
              </Route>
            </>
          )}
          
          {/* Shared exam interface */}
          <Route path="/exam/:examId" component={ExamInterface} />
          
          {/* Redirect root to appropriate dashboard based on role */}
          <Route path="/">
            {(params) => {
              switch (user?.role_name?.toLowerCase()) {
                case 'admin':
                  window.location.href = '/admin/dashboard';
                  break;
                case 'teacher':
                  window.location.href = '/teacher/dashboard';
                  break;
                case 'student':
                  window.location.href = '/student/dashboard';
                  break;
                case 'parent':
                  window.location.href = '/parent/dashboard';
                  break;
                default:
                  window.location.href = '/';
              }
              return null;
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
