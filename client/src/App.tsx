import { Switch, Route } from "wouter";
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
import AdminUsers from "@/pages/admin/Users";
import AdminAnnouncements from "@/pages/admin/Announcements";
import AdminGallery from "@/pages/admin/Gallery";
import AdminExams from "@/pages/admin/Exams";
import AdminEnrollments from "@/pages/admin/Enrollments";
import TeacherExams from "@/pages/teacher/Exams";
import StudentResults from "@/pages/student/Results";
import TakeExam from "@/pages/student/TakeExam";
import { queryClient } from "./lib/queryClient";

// Protected Route Component
function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (requiredRole && user?.role_name !== requiredRole) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

// Router Component
function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
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
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

// Main App Component
function App() {
  const { isLoading } = useAuth(); // Call useAuth once at the top
  
  // This top-level check for loading prevents any route from rendering prematurely
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-primary"></div>
      </div>
    );
  }

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

Update it fully
