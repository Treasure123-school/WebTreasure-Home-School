import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/Dashboard"; // Fixed import path
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import ExamInterface from "@/pages/exam-interface";
import Login from "@/pages/Login";
import Unauthorized from "@/pages/unauthorized"; // Add this import

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
      <Route path="/landing" component={Landing} />
      <Route path="/unauthorized" component={Unauthorized} />
      
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          {/* Redirect any other route to landing */}
          <Route path="/:rest*">
            {(params) => {
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
          
          {/* Dashboard routes - Fixed to match your admin page redirects */}
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/teacher" component={TeacherDashboard} />
          <Route path="/student" component={StudentDashboard} />
          <Route path="/parent" component={ParentDashboard} />
          
          {/* Admin Routes */}
          {user?.role_name?.toLowerCase() === 'admin' && (
            <>
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
              <Route path="/teacher/exams" component={TeacherExams} />
            </>
          )}
          
          {/* Student Routes */}
          {user?.role_name?.toLowerCase() === 'student' && (
            <>
              <Route path="/student/results" component={StudentResults} />
              <Route path="/exam/:examId" component={TakeExam} />
            </>
          )}
          
          {/* Parent Routes */}
          {user?.role_name?.toLowerCase() === 'parent' && (
            <>
              {/* Add parent specific routes here if needed */}
            </>
          )}
          
          {/* Shared routes */}
          <Route path="/exam/:examId" component={ExamInterface} />
          
          {/* Role-based redirect for authenticated users */}
          <Route path="/:rest*">
            {(params) => {
              // Don't redirect if it's an API route or static file
              const path = params.rest || '';
              if (path.startsWith('api/') || path.includes('.')) {
                return <NotFound />;
              }

              // Redirect to appropriate dashboard based on role
              const role = user?.role_name?.toLowerCase();
              let redirectPath = '/';
              
              switch (role) {
                case 'admin':
                  redirectPath = '/admin';
                  break;
                case 'teacher':
                  redirectPath = '/teacher';
                  break;
                case 'student':
                  redirectPath = '/student';
                  break;
                case 'parent':
                  redirectPath = '/parent';
                  break;
                default:
                  redirectPath = '/';
              }
              
              // Use client-side redirect
              if (typeof window !== 'undefined' && window.location.pathname !== redirectPath) {
                window.location.href = redirectPath;
              }
              
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
