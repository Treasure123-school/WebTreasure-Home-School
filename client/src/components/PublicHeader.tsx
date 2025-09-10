import { useState, useEffect } from "react";
import { Link } from "wouter";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-surface shadow-lg sticky top-0 z-50" data-testid="public-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and School Info - Keeping original styling */}
          <Link href="/" className="flex items-center space-x-4" data-testid="logo-section">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Treasure-Home School</h1>
              <p className="text-sm text-textSecondary">Quality Education & Moral Excellence</p>
            </div>
          </Link>

          {/* Desktop Navigation - Keeping original styling */}
          <nav className="hidden lg:flex items-center space-x-8" data-testid="desktop-nav">
            <button
              onClick={() => scrollToSection('home')}
              className="text-textPrimary hover:text-primary font-medium transition-colors"
              data-testid="nav-home"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-textPrimary hover:text-primary font-medium transition-colors"
              data-testid="nav-about"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              data-testid="nav-enroll"
            >
              Enroll Now
            </button>
            <button
              onClick={() => scrollToSection('announcements')}
              className="text-textPrimary hover:text-primary font-medium transition-colors"
              data-testid="nav-announcements"
            >
              Announcements
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-textPrimary hover:text-primary font-medium transition-colors"
              data-testid="nav-gallery"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-textPrimary hover:text-primary font-medium transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>
            
            <Link href="/login">
              <Button
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                data-testid="portal-login-button"
              >
                Login to Portal
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu - Simple and clean as requested */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20 px-6 pb-6" data-testid="mobile-menu">
            <div className="flex flex-col h-full">
              {/* Simple menu items without backgrounds */}
              <div className="space-y-1">
                <button
                  onClick={() => scrollToSection('home')}
                  className="block w-full text-left py-3 text-textPrimary font-medium border-b border-gray-100"
                  data-testid="mobile-nav-home"
                >
                  Home
                </button>
                
                <button
                  onClick={() => scrollToSection('about')}
                  className="block w-full text-left py-3 text-textPrimary font-medium border-b border-gray-100"
                  data-testid="mobile-nav-about"
                >
                  About
                </button>
                
                <button
                  onClick={() => scrollToSection('announcements')}
                  className="block w-full text-left py-3 text-textPrimary font-medium border-b border-gray-100"
                  data-testid="mobile-nav-announcements"
                >
                  Announcements
                </button>
                
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="block w-full text-left py-3 text-textPrimary font-medium border-b border-gray-100"
                  data-testid="mobile-nav-gallery"
                >
                  Gallery
                </button>
                
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left py-3 text-textPrimary font-medium border-b border-gray-100"
                  data-testid="mobile-nav-contact"
                >
                  Contact
                </button>
                
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left py-3 text-accent font-medium border-b border-gray-100"
                  data-testid="mobile-nav-enroll"
                >
                  Enroll Now
                </button>
              </div>
              
              {/* Only Login button has background color */}
              <div className="mt-auto pt-6">
                <Link href="/login">
                  <Button
                    className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    data-testid="mobile-login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login to Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
