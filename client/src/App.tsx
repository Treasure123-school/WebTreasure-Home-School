import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import PublicLayout from '@/layouts/PublicLayout';
import PrivateLayout from '@/layouts/PrivateLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

// Public Pages
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';

// Private Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import TeacherDashboard from '@/pages/teacher/Dashboard';
import StudentDashboard from '@/pages/student/Dashboard';
import ParentDashboard from '@/pages/parent/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - No authentication required */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>

          {/* Private Routes - Authentication required */}
          <Route path="/admin/*" element={
            <PrivateLayout requiredRole="Admin">
              <AdminDashboard />
            </PrivateLayout>
          } />
          <Route path="/teacher/*" element={
            <PrivateLayout requiredRole="Teacher">
              <TeacherDashboard />
            </PrivateLayout>
          } />
          <Route path="/student/*" element={
            <PrivateLayout requiredRole="Student">
              <StudentDashboard />
            </PrivateLayout>
          } />
          <Route path="/parent/*" element={
            <PrivateLayout requiredRole="Parent">
              <ParentDashboard />
            </PrivateLayout>
          } />

          {/* Catch all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Simple not found page component
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl">Page not found</p>
      </div>
    </div>
  );
}

export default App;
