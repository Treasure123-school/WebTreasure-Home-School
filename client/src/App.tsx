import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

// Public Pages - from your actual file structure
import Landing from '@/pages/landing';
import Login from '@/pages/Login';
import Unauthorized from '@/pages/unauthorized';

// Private Pages - from your actual file structure
import AdminDashboard from '@/pages/admin/Dashboard';
import TeacherDashboard from '@/pages/teacher/Dashboard';
import StudentDashboard from '@/pages/student/Dashboard';
import ParentDashboard from '@/pages/parent/Dashboard';

function App() {
  const { user, isLoading } = useAuth();

  // Show loading spinner only when authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Dashboard redirect based on role */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              user.role_name === 'Admin' ? <Navigate to="/admin" /> :
              user.role_name === 'Teacher' ? <Navigate to="/teacher" /> :
              user.role_name === 'Student' ? <Navigate to="/student" /> :
              user.role_name === 'Parent' ? <Navigate to="/parent" /> :
              <Unauthorized />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Protected routes - Only show if user is authenticated and has correct role */}
        <Route 
          path="/admin/*" 
          element={user && user.role_name === 'Admin' ? <AdminDashboard /> : <Unauthorized />} 
        />
        <Route 
          path="/teacher/*" 
          element={user && user.role_name === 'Teacher' ? <TeacherDashboard /> : <Unauthorized />} 
        />
        <Route 
          path="/student/*" 
          element={user && user.role_name === 'Student' ? <StudentDashboard /> : <Unauthorized />} 
        />
        <Route 
          path="/parent/*" 
          element={user && user.role_name === 'Parent' ? <ParentDashboard /> : <Unauthorized />} 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
