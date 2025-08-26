import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.role) {
      switch (user.role) {
        case 'admin':
          setLocation('/admin');
          break;
        case 'teacher':
          setLocation('/teacher');
          break;
        case 'student':
          setLocation('/student');
          break;
        case 'parent':
          setLocation('/parent');
          break;
        default:
          // Stay on home page
          break;
      }
    }
  }, [user, setLocation]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroundSurface">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">
            Welcome to Treasure-Home School Portal
          </h1>
          <p className="text-xl text-textSecondary mb-8">
            You will be redirected to your dashboard shortly...
          </p>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
