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

// Simple component to show while checking auth
function AuthChecker({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }
  
  return <>{children}</>;
}

// Simple protected route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthChecker>
          <Switch>
            {/* Public routes */}
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            
            {/* Protected routes */}
            <Route path="/home">
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Route>
            
            <Route path="/admin">
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            </Route>
            
            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </AuthChecker>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
