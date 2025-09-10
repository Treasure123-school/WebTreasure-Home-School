// client/src/App.tsx
// --- FULLY UPDATED FILE ---

import { Switch, Route, useLocation } from "wouter";
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

/**
 * ✨ NEW: Centralized helper function to determine the dashboard path based on role.
 * This removes duplicated logic from Login.tsx and ProtectedRoute.
 */
const getTargetPathForRole = (roleName?: string | null) => {
  switch (roleName) {
    case 'Admin':
      return '/admin';
    case 'Teacher':
      return '/teacher';
    case 'Student':
      return '/student';
    case 'Parent':
      return '/parent';
    default:
      // Fallback for authenticated users without a specific role dashboard
      return '/home';
  }
};

function AuthChecker({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Initializing..." />
      </div>
    );
  }
  return <>{children}</>;
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Verifying access..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }

  // ✨ IMPROVEMENT: Simplified role-based redirection logic.
  // If a role is required and the user's role doesn't match,
  // redirect them to THEIR OWN correct dashboard.
  if (requiredRole && user?.role_name !== requiredRole) {
    const userDashboardPath = getTargetPathForRole(user?.role_name);
    navigate(userDashboardPath);
    return null;
  }

  // If role matches or no specific role is required, render the component
  return <>{children}</>;
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthChecker>
          <Switch>
            {/* Admin routes */}
            <Route path="/admin/users/create">
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
            <Route path="/admin/exams">
              <ProtectedRoute requiredRole="Admin">
                <AdminExams />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/gallery">
              <ProtectedRoute requiredRole="Admin">
                <AdminGallery />
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

            {/* Other protected routes for different roles */}
            <Route path="/teacher">
              <ProtectedRoute requiredRole="Teacher">
                <TeacherDashboard />
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

            {/* Public routes */}
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/unauthorized" component={Unauthorized} />
            
            {/* A generic authenticated route */}
            <Route path="/home">
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Route>

            {/* Fallback 404 route */}
            <Route component={NotFound} />
          </Switch>
        </AuthChecker>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
