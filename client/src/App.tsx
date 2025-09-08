import { Switch, Route, Redirect } from "wouter";
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
import CreateUser from "@/pages/admin/CreateUser";
import TeacherExams from "@/pages/teacher/Exams";
import StudentResults from "@/pages/student/Results";
import TakeExam from "@/pages/student/TakeExam";
import { queryClient } from "./lib/queryClient";
import LoadingSpinner from "@/components/LoadingSpinner";

function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (requiredRole && user.role_name !== requiredRole) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { 
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Redirect to="/home" />;
  }

  return <>{children}</>;
}

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <PublicRoute>
          <Landing />
        </PublicRoute>
      </Route>
      
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>

      <Route path="/unauthorized" component={Unauthorized} />

      {/* Protected Routes - Specific routes first */}
      <Route path="/admin/create-user">
        <ProtectedRoute requiredRole="Admin">
          <CreateUser />
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

      <Route path="/admin">
        <ProtectedRoute requiredRole="Admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      {/* Other role routes */}
      <Route path="/teacher/exams">
        <ProtectedRoute requiredRole="Teacher">
          <TeacherExams />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher">
        <ProtectedRoute requiredRole="Teacher">
          <TeacherDashboard />
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

      <Route path="/student">
        <ProtectedRoute requiredRole="Student">
          <StudentDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/parent">
        <ProtectedRoute requiredRole="Parent">
          <ParentDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/home">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>

      {/* Shared exam route */}
      <Route path="/exam/:examId/interface">
        <ProtectedRoute>
          <ExamInterface />
        </ProtectedRoute>
      </Route>

      {/* 404 Route */}
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
