import { useState } from "react";
import { Link } from "wouter";
import { GraduationCap, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <header className="bg-white shadow-lg sticky top-0 z-50" data-testid="public-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and School Info */}
          <Link href="/" className="flex items-center space-x-4" data-testid="logo-section">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Treasure-Home School</h1>
              <p className="text-sm text-gray-600">Quality Education & Moral Excellence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" data-testid="desktop-nav">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              data-testid="nav-home"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              data-testid="nav-about"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              data-testid="nav-enroll"
            >
              Enroll Now
            </button>
            <button
              onClick={() => scrollToSection('announcements')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              data-testid="nav-announcements"
            >
              Announcements
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              data-testid="nav-gallery"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>
            
            <Link href="/login">
              <Button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu - IMPROVED DESIGN */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg" data-testid="mobile-menu">
            <div className="py-4 px-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2 mb-2">
                Navigation
              </h3>
              
              <button
                onClick={() => scrollToSection('home')}
                className="block w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                data-testid="mobile-nav-about"
              >
                About
              </button>
              
              <button
                onClick={() => scrollToSection('announcements')}
                className="block w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                data-testid="mobile-nav-announcements"
              >
                Announcements
              </button>
              
              <button
                onClick={() => scrollToSection('gallery')}
                className="block w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                data-testid="mobile-nav-gallery"
              >
                Gallery
              </button>
              
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
              
              <div className="pt-4 border-t border-gray-200 mt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2 mb-3">
                  Quick Actions
                </h3>
                
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left py-3 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors mb-3"
                  data-testid="mobile-nav-enroll"
                >
                  Enroll Now
                </button>
                
                <Link href="/login">
                  <Button
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    data-testid="mobile-login"
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
