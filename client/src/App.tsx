import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/Dashboard";
import TeacherDashboard from "@/pages/teacher/Dashboard";
import StudentDashboard from "@/pages/student/Dashboard";
import ParentDashboard from "@/pages/parent/Dashboard";
import ExamInterface from "@/pages/exam-interface";
import Login from "@/pages/Login";
import Unauthorized from "@/pages/unauthorized";
import AdminUsers from "@/pages/admin/Users";
import AdminAnnouncements from "@/pages/admin/Announcements";
import AdminGallery from "@/pages/admin/Gallery";
import AdminExams from "@/pages/admin/Exams";
import AdminEnrollments from "@/pages/admin/Enrollments";
import CreateUser from "@/pages/admin/CreateUser"; // ADD THIS IMPORT
import TeacherExams from "@/pages/teacher/Exams";
import StudentResults from "@/pages/student/Results";
import TakeExam from "@/pages/student/TakeExam";
import { queryClient } from "./lib/queryClient";
import LoadingSpinner from "@/components/LoadingSpinner";

// Protected Route Component for role-based access
function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (requiredRole && user?.role_name !== requiredRole) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

// Public Route Component - allows access to all, but shows different content for authenticated users
function PublicRoute({ children }: { 
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return <>{children}</>;
}

// Router Component
function Router() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <Switch>
      {/* Public Routes - Accessible to all, with different content for auth users */}
      <Route path="/">
        <PublicRoute>
          <Landing />
        </PublicRoute>
      </Route>
      
      <Route path="/login">
        {isAuthenticated ? (
          // If already authenticated, redirect to appropriate dashboard
          (() => {
            let targetPath = '/home';
            switch (user?.role_name?.toLowerCase()) {
              case 'admin':
                targetPath = '/admin';
                break;
              case 'teacher':
                targetPath = '/teacher';
                break;
              case 'student':
                targetPath = '/student';
                break;
              case 'parent':
                targetPath = '/parent';
                break;
              default:
                targetPath = '/home';
            }
            return <Redirect to={targetPath} />;
          })()
        ) : (
          // If not authenticated, show login page
          <Login />
        )}
      </Route>

      <Route path="/unauthorized" component={Unauthorized} />

      {/* Protected Routes */}
      <Route path="/home">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>

      {/* Admin Routes */}
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
      <Route path="/admin/create-user">
        <ProtectedRoute requiredRole="Admin">
          <CreateUser />
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
        <ProtectedRoute requiredRole="Student">
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

      {/* 404 Not Found Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Main App Component
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
