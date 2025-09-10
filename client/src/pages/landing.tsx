import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import AnnouncementsSection from "@/components/announcements-section";
import GallerySection from "@/components/gallery-section";
import AchievementsSection from "@/components/achievements-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Landing() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && !isLoading) {
      const role = user.role_name?.toLowerCase() || 'home';
      setLocation(`/${role}`);
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Redirecting to your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroundSurface">
      <Header />
      <HeroSection />
      <AboutSection />
      <AnnouncementsSection />
      <GallerySection />
      <AchievementsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
