import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/Dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import ExamInterface from "@/pages/exam-interface";
import Login from "@/pages/Login";
import Unauthorized from "@/pages/unauthorized";

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

// Protected Route Component for role-based access
function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  if (requiredRole && user.role_name !== requiredRole) {
    setLocation('/unauthorized');
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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
          {/* Show 404 for unknown routes instead of redirecting */}
          <Route component={NotFound} />
        </>
      ) : (
        <>
          {/* Protected routes - each route handles its own authentication */}
          <Route path="/">
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          </Route>
          
          <Route path="/home">
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          </Route>

          {/* Dashboard routes - each handles its own role protection */}
          <Route path="/admin">
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/users">
            <ProtectedRoute requiredRole="Admin">
              <AdminUsers />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/announcements">
            <ProtectedRoute requiredRole="Admin">
              <AdminAnnouncements />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/gallery">
            <ProtectedRoute requiredRole="Admin">
              <AdminGallery />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/exams">
            <ProtectedRoute requiredRole="Admin">
              <AdminExams />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin/enrollments">
            <ProtectedRoute requiredRole="Admin">
              <AdminEnrollments />
            </ProtectedRoute>
          </Route>
          
          {/* Teacher Routes */}
          <Route path="/teacher">
            <ProtectedRoute requiredRole="Teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/teacher/exams">
            <ProtectedRoute requiredRole="Teacher">
              <TeacherExams />
            </ProtectedRoute>
          </Route>
          
          {/* Student Routes */}
          <Route path="/student">
            <ProtectedRoute requiredRole="Student">
              <StudentDashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/student/results">
            <ProtectedRoute requiredRole="Student">
              <StudentResults />
            </ProtectedRoute>
          </Route>
          
          <Route path="/exam/:examId">
            <ProtectedRoute>
              <TakeExam />
            </ProtectedRoute>
          </Route>
          
          {/* Parent Routes */}
          <Route path="/parent">
            <ProtectedRoute requiredRole="Parent">
              <ParentDashboard />
            </ProtectedRoute>
          </Route>
          
          {/* Shared exam route */}
          <Route path="/exam/:examId/interface">
            <ProtectedRoute>
              <ExamInterface />
            </ProtectedRoute>
          </Route>
          
          {/* 404 for all other routes - NO REDIRECTS */}
          <Route component={NotFound} />
        </>
      )}
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
