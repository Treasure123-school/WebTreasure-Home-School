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
    <header className="bg-white shadow-md sticky top-0 z-50" data-testid="public-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and School Info */}
          <Link href="/" className="flex items-center space-x-3" data-testid="logo-section">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Treasure-Home School</h1>
              <p className="text-xs text-gray-600">Quality Education & Moral Excellence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6" data-testid="desktop-nav">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
              data-testid="nav-home"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
              data-testid="nav-about"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('announcements')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
              data-testid="nav-announcements"
            >
              Announcements
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
              data-testid="nav-gallery"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
              data-testid="nav-contact"
            >
              Contact
            </button>
            
            <button
              onClick={() => scrollToSection('contact')}
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors text-sm"
              data-testid="nav-enroll"
            >
              Enroll Now
            </button>
            
            <Link href="/login">
              <Button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                data-testid="portal-login-button"
              >
                Login to Portal
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden p-2 h-10 w-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu - Professional Design */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20 px-6 pb-6" data-testid="mobile-menu">
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="space-y-1">
                <button
                  onClick={() => scrollToSection('home')}
                  className="block w-full text-left py-3 text-gray-700 hover:text-blue-600 transition-colors border-b border-gray-100 text-base font-medium"
                  data-testid="mobile-nav-home"
                >
                  Home
                </button>
                
                <button
                  onClick={() => scrollToSection('about')}
                  className="block w-full text-left py-3 text-gray-700 hover:text-blue-600 transition-colors border-b border-gray-100 text-base font-medium"
                  data-testid="mobile-nav-about"
                >
                  About
                </button>
                
                <button
                  onClick={() => scrollToSection('announcements')}
                  className="block w-full text-left py-3 text-gray-700 hover:text-blue-600 transition-colors border-b border-gray-100 text-base font-medium"
                  data-testid="mobile-nav-announcements"
                >
                  Announcements
                </button>
                
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="block w-full text-left py-3 text-gray-700 hover:text-blue-600 transition-colors border-b border-gray-100 text-base font-medium"
                  data-testid="mobile-nav-gallery"
                >
                  Gallery
                </button>
                
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left py-3 text-gray-700 hover:text-blue-600 transition-colors border-b border-gray-100 text-base font-medium"
                  data-testid="mobile-nav-contact"
                >
                  Contact
                </button>
                
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left py-3 text-orange-600 hover:text-orange-700 transition-colors border-b border-gray-100 text-base font-medium"
                  data-testid="mobile-nav-enroll"
                >
                  Enroll Now
                </button>
              </div>
              
              <div className="mt-auto pt-6">
                <Link href="/login">
                  <Button
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors text-base font-medium"
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
