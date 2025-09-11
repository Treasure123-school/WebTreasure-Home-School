import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/Login";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/Dashboard";
import { queryClient } from "./lib/queryClient";
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

// Public routes load immediately without any auth checks
function PublicRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Protected routes handle their own authentication
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          {/* Public Routes - No authentication checks */}
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
          
          <Route path="/unauthorized">
            <PublicRoute>
              <Unauthorized />
            </PublicRoute>
          </Route>

          {/* Protected Routes - Handle auth internally */}
          <Route path="/admin/users/create">
            <CreateUser />
          </Route>
          
          <Route path="/admin/users">
            <AdminUsers />
          </Route>
          
          <Route path="/admin/announcements">
            <AdminAnnouncements />
          </Route>
          
          <Route path="/admin/exams">
            <AdminExams />
          </Route>
          
          <Route path="/admin/gallery">
            <AdminGallery />
          </Route>
          
          <Route path="/admin/enrollments">
            <AdminEnrollments />
          </Route>
          
          <Route path="/admin">
            <AdminDashboard />
          </Route>
          
          <Route path="/teacher">
            <TeacherDashboard />
          </Route>
          
          <Route path="/student">
            <StudentDashboard />
          </Route>
          
          <Route path="/parent">
            <ParentDashboard />
          </Route>
          
          <Route path="/home">
            <Home />
          </Route>

          {/* Fallback 404 Route */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
