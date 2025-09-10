import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/Login";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          {/* Public Routes - No authentication needed */}
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          
          {/* Temporary: Show maintenance message for protected routes */}
          <Route path="/admin/*">
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
                <p>Authentication system is currently being optimized.</p>
                <p>Please check back later.</p>
              </div>
            </div>
          </Route>
          
          <Route path="/teacher/*">
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Teacher Portal</h1>
                <p>Authentication system is currently being optimized.</p>
                <p>Please check back later.</p>
              </div>
            </div>
          </Route>
          
          {/* Fallback 404 Route */}
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
