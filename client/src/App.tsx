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
          {/* Public Routes - No authentication checks */}
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          
          {/* Show maintenance message for protected routes */}
          <Route path="/admin/*">
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-blue-800 mb-4">Admin Portal</h1>
                <p className="text-gray-600 mb-2">This section is currently under maintenance.</p>
                <p className="text-gray-600">Please check back later or contact support.</p>
              </div>
            </div>
          </Route>
          
          <Route path="/teacher/*">
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-green-800 mb-4">Teacher Portal</h1>
                <p className="text-gray-600 mb-2">This section is currently under maintenance.</p>
                <p className="text-gray-600">Please check back later or contact support.</p>
              </div>
            </div>
          </Route>
          
          <Route path="/student/*">
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-purple-800 mb-4">Student Portal</h1>
                <p className="text-gray-600 mb-2">This section is currently under maintenance.</p>
                <p className="text-gray-600">Please check back later or contact support.</p>
              </div>
            </div>
          </Route>
          
          <Route path="/parent/*">
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-orange-800 mb-4">Parent Portal</h1>
                <p className="text-gray-600 mb-2">This section is currently under maintenance.</p>
                <p className="text-gray-600">Please check back later or contact support.</p>
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
