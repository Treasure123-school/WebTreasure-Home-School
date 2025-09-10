import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import AnnouncementsSection from "@/components/announcements-section";
import GallerySection from "@/components/gallery-section";
import AchievementsSection from "@/components/achievements-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Landing() {
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
