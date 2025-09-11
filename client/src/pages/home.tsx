// client/src/pages/home.tsx
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.role_name) {
      const role = user.role_name.toLowerCase();
      setLocation(`/${role}`);
    } else {
      // Default redirect if no role is found
      setLocation('/');
    }
  }, [user, setLocation]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner message="Redirecting to your dashboard..." />
    </div>
  );
}
