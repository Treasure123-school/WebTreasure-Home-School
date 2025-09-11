import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkSupabaseConnection } from '@/lib/supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import TeacherDashboard from '@/pages/teacher/Dashboard';
import StudentDashboard from '@/pages/student/Dashboard';
import ParentDashboard from '@/pages/parent/Dashboard';
import Unauthorized from '@/pages/unauthorized';
import Landing from '@/pages/landing';

function App() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check Supabase connection on app start
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setSupabaseConnected(connected);
    };
    
    checkConnection();
  }, []);

  // Show connection error if Supabase is not connected
  if (supabaseConnected === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-4">
            Unable to connect to the database. Please check your internet connection
            and make sure the database is running.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || supabaseConnected === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/admin/*" 
          element={isAuthenticated && user?.role_name === 'Admin' ? 
            <AdminDashboard /> : <Unauthorized />} 
        />
        <Route 
          path="/teacher/*" 
          element={isAuthenticated && user?.role_name === 'Teacher' ? 
            <TeacherDashboard /> : <Unauthorized />} 
        />
        <Route 
          path="/student/*" 
          element={isAuthenticated && user?.role_name === 'Student' ? 
            <StudentDashboard /> : <Unauthorized />} 
        />
        <Route 
          path="/parent/*" 
          element={isAuthenticated && user?.role_name === 'Parent' ? 
            <ParentDashboard /> : <Unauthorized />} 
        />
        
        {/* Dashboard redirect based on role */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              user?.role_name === 'Admin' ? <Navigate to="/admin" /> :
              user?.role_name === 'Teacher' ? <Navigate to="/teacher" /> :
              user?.role_name === 'Student' ? <Navigate to="/student" /> :
              user?.role_name === 'Parent' ? <Navigate to="/parent" /> :
              <Unauthorized />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
