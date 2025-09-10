import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/Login";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/Dashboard";
import { queryClient } from "./lib/queryClient";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminUsers from "@/pages/admin/Users";
import CreateUser from "@/pages/admin/CreateUser";
import AdminAnnouncements from "@/pages/admin/Announcements";
import AdminExams from "@/pages/admin/Exams";
import AdminGallery from "@/pages/admin/Gallery";
import AdminEnrollments from "@/pages/admin/Enrollments";
import Unauthorized from "@/pages/unauthorized";
import StudentDashboard from "@/pages/student/Dashboard";
import TeacherDashboard from "@/pages/teacher/Dashboard";
import ParentDashboard from "@/pages/parent/Dashboard";

function AuthReadyGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner message="Initializing Application..." />
      </div>
    );
  }
  
  return <>{children}</>;
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Checking access..." />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }
  
  if (requiredRole && user.role_name !== requiredRole) {
    return <Unauthorized />;
  }
  
  return <>{children}</>;
}

// New component to handle public routes without waiting for auth
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          {/* Public Routes - These don't wait for auth check */}
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
          
          {/* Protected Routes - These require auth check */}
          <Route path="/admin/users/create">
            <ProtectedRoute requiredRole="Admin"><CreateUser /></ProtectedRoute>
          </Route>
          <Route path="/admin/users">
            <ProtectedRoute requiredRole="Admin"><AdminUsers /></ProtectedRoute>
          </Route>
          <Route path="/admin/announcements">
            <ProtectedRoute requiredRole="Admin"><AdminAnnouncements /></ProtectedRoute>
          </Route>
          <Route path="/admin/exams">
            <ProtectedRoute requiredRole="Admin"><AdminExams /></ProtectedRoute>
          </Route>
          <Route path="/admin/gallery">
            <ProtectedRoute requiredRole="Admin"><AdminGallery /></ProtectedRoute>
          </Route>
          <Route path="/admin/enrollments">
            <ProtectedRoute requiredRole="Admin"><AdminEnrollments /></ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>
          </Route>
          
          {/* Other Protected Routes */}
          <Route path="/teacher">
            <ProtectedRoute requiredRole="Teacher"><TeacherDashboard /></ProtectedRoute>
          </Route>
          <Route path="/student">
            <ProtectedRoute requiredRole="Student"><StudentDashboard /></ProtectedRoute>
          </Route>
          <Route path="/parent">
            <ProtectedRoute requiredRole="Parent"><ParentDashboard /></ProtectedRoute>
          </Route>
          <Route path="/home">
            <ProtectedRoute><Home /></ProtectedRoute>
          </Route>
          
          {/* More Public Routes */}
          <Route path="/unauthorized" component={Unauthorized} />
          
          {/* Fallback 404 Route */}
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
