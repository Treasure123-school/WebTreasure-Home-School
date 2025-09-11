import { useAuth } from '@/hooks/useAuth';
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

  if (isLoading) {
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
