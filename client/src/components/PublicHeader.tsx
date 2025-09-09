import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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
            
            {/* Portal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  data-testid="portal-dropdown"
                >
                  Portal
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {user ? (
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-link">
                    <span>Logout</span>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" data-testid="admin-portal">
                        <span>Login to Portal</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t" data-testid="mobile-menu">
            <div className="space-y-4">
              <button
                onClick={() => scrollToSection('home')}
                className="block text-textPrimary hover:text-primary font-medium transition-colors w-full text-left py-2"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="block text-textPrimary hover:text-primary font-medium transition-colors w-full text-left py-2"
                data-testid="mobile-nav-about"
              >
                About
              </button>
              <div className="pt-4 border-t">
                <p className="text-sm text-textSecondary mb-2">Portal Access:</p>
                {user ? (
                  <Button
                    onClick={handleLogout}
                    className="block text-primary hover:underline"
                    variant="link"
                    data-testid="mobile-logout"
                  >
                    Logout
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="link"
                      className="block text-primary hover:underline"
                      data-testid="mobile-login"
                    >
                      Login to Portal
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
