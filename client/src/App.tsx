// client/src/App.tsx
// --- FULLY UPDATED AND CORRECTED FILE ---

import { Switch, Route, useLocation, Redirect } from "wouter";
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
 * ✅ IMPROVEMENT: AuthReadyGuard
 * This component's only job is to show a loading screen while the useAuth hook
 * is performing its initial check. This prevents the rest of the app from rendering
 * prematurely and avoids race conditions.
 */
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

/**
 * ✅ IMPROVEMENT: ProtectedRoute
 * This logic is now safer and more robust. It handles one responsibility:
 * ensuring a user is logged in and has the correct role. It no longer performs
 * complex redirects, which prevents the race condition crash.
 */
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { isAuthenticated, user } = useAuth();

  // 1. If the user is not authenticated at all, redirect to the login page.
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  // 2. If a specific role is required, and the user's role does not match,
  //    render the Unauthorized component. This is safer than a redirect.
  if (requiredRole && user?.role_name !== requiredRole) {
    return <Unauthorized />;
  }
  
  // 3. If all checks pass, render the protected component.
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthReadyGuard>
          <Switch>
            {/* --- ADMIN ROUTES --- */}
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
            
            {/* --- OTHER ROLE ROUTES --- */}
            <Route path="/teacher">
              <ProtectedRoute requiredRole="Teacher"><TeacherDashboard /></ProtectedRoute>
            </Route>
            <Route path="/student">
              <ProtectedRoute requiredRole="Student"><StudentDashboard /></ProtectedRoute>
            </Route>
            <Route path="/parent">
              <ProtectedRoute requiredRole="Parent"><ParentDashboard /></ProtectedRoute>
            </Route>

            {/* --- GENERIC AUTHENTICATED ROUTE --- */}
            <Route path="/home">
              <ProtectedRoute><Home /></ProtectedRoute>
            </Route>

            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/unauthorized" component={Unauthorized} />
            
            {/* Fallback 404 Route */}
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </AuthReadyGuard>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
