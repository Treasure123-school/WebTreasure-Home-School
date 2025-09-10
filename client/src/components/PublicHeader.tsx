import { useState, useEffect } from "react";
import { Link } from "wouter";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Logo and School Info */}
          <Link href="/" className="flex items-center space-x-4" data-testid="logo-section">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Treasure-Home School</h1>
              <p className="text-sm text-textSecondary">Quality Education & Moral Excellence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" data-testid="desktop-nav">
            <button
              onClick={() => scrollToSection('home')}
              className="text-textPrimary hover:text-primary font-medium transition-colors duration-200"
              data-testid="nav-home"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-textPrimary hover:text-primary font-medium transition-colors duration-200"
              data-testid="nav-about"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('announcements')}
              className="text-textPrimary hover:text-primary font-medium transition-colors duration-200"
              data-testid="nav-announcements"
            >
              Announcements
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-textPrimary hover:text-primary font-medium transition-colors duration-200"
              data-testid="nav-gallery"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-textPrimary hover:text-primary font-medium transition-colors duration-200"
              data-testid="nav-contact"
            >
              Contact
            </button>
            
            <button
              onClick={() => scrollToSection('contact')}
              className="text-accent hover:text-orange-600 font-medium transition-colors duration-200"
              data-testid="nav-enroll"
            >
              Enroll Now
            </button>
            
            <Link href="/login">
              <span className="text-primary hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer" data-testid="portal-login-button">
                Login to Portal
              </span>
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

        {/* Mobile Menu - With Hover Effects and Scrollable */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200" data-testid="mobile-menu">
            <div className="py-4 px-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <button
                onClick={() => scrollToSection('home')}
                className="block w-full text-left py-2 text-textPrimary font-medium hover:text-primary transition-colors duration-200"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left py-2 text-textPrimary font-medium hover:text-primary transition-colors duration-200"
                data-testid="mobile-nav-about"
              >
                About
              </button>
              
              <button
                onClick={() => scrollToSection('announcements')}
                className="block w-full text-left py-2 text-textPrimary font-medium hover:text-primary transition-colors duration-200"
                data-testid="mobile-nav-announcements"
              >
                Announcements
              </button>
              
              <button
                onClick={() => scrollToSection('gallery')}
                className="block w-full text-left py-2 text-textPrimary font-medium hover:text-primary transition-colors duration-200"
                data-testid="mobile-nav-gallery"
              >
                Gallery
              </button>
              
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left py-2 text-textPrimary font-medium hover:text-primary transition-colors duration-200"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
              
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left py-2 text-accent font-medium hover:text-orange-600 transition-colors duration-200"
                data-testid="mobile-nav-enroll"
              >
                Enroll Now
              </button>
              
              <Link href="/login">
                <span className="block w-full text-left py-2 text-primary font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer" data-testid="mobile-login">
                  Login to Portal
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
