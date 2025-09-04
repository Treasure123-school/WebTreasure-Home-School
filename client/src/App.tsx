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
import Login from "@/pages/Login"; // ADD THIS IMPORT

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

// Add this - you might need to import queryClient differently
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
      {/* ADD LOGIN ROUTE - Accessible to both authenticated and non-authenticated users */}
      <Route path="/login" component={Login} />
      
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          {/* Redirect any other route to login */}
          <Route path="/:rest*" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          
          {/* Admin Routes */}
          {user?.roleId === 1 && (
            <>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/announcements" component={AdminAnnouncements} />
              <Route path="/admin/gallery" component={AdminGallery} />
              <Route path="/admin/exams" component={AdminExams} />
              <Route path="/admin/enrollments" component={AdminEnrollments} />
            </>
          )}
          
          {/* Teacher Routes */}
          {user?.roleId === 2 && (
            <>
              <Route path="/teacher" component={TeacherDashboard} />
              <Route path="/teacher/exams" component={TeacherExams} />
            </>
          )}
          
          {/* Student Routes */}
          {user?.roleId === 3 && (
            <>
              <Route path="/student" component={StudentDashboard} />
              <Route path="/student/results" component={StudentResults} />
              <Route path="/exam/:examId" component={TakeExam} />
            </>
          )}
          
          {/* Parent Routes */}
          {user?.roleId === 4 && (
            <>
              <Route path="/parent" component={ParentDashboard} />
            </>
          )}
          
          {/* Shared exam interface */}
          <Route path="/exam/:examId" component={ExamInterface} />
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
