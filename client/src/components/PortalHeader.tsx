import { useState } from "react";
import { Link } from "wouter";
import { 
  GraduationCap, 
  Menu, 
  X, 
  User, 
  LogOut,
  Settings,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PortalHeaderProps {
  user: any;
}

export default function PortalHeader({ user }: PortalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'teacher':
        return 'Teacher';
      case 'student':
        return 'Student';
      case 'parent':
        return 'Parent';
      default:
        return 'User';
    }
  };

  const getNavItems = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', testId: 'nav-admin-dashboard' },
          { href: '/admin/users', label: 'Users', testId: 'nav-admin-users' },
          { href: '/admin/announcements', label: 'Announcements', testId: 'nav-admin-announcements' },
          { href: '/admin/gallery', label: 'Gallery', testId: 'nav-admin-gallery' },
          { href: '/admin/exams', label: 'Exams', testId: 'nav-admin-exams' },
          { href: '/admin/enrollments', label: 'Enrollments', testId: 'nav-admin-enrollments' },
        ];
      case 'teacher':
        return [
          { href: '/teacher', label: 'Dashboard', testId: 'nav-teacher-dashboard' },
          { href: '/teacher/exams', label: 'Exams', testId: 'nav-teacher-exams' },
          { href: '/teacher/announcements', label: 'Announcements', testId: 'nav-teacher-announcements' },
          { href: '/teacher/gallery', label: 'Gallery', testId: 'nav-teacher-gallery' },
        ];
      case 'student':
        return [
          { href: '/student', label: 'Dashboard', testId: 'nav-student-dashboard' },
          { href: '/student/exams', label: 'My Exams', testId: 'nav-student-exams' },
          { href: '/student/results', label: 'Results', testId: 'nav-student-results' },
        ];
      case 'parent':
        return [
          { href: '/parent', label: 'Dashboard', testId: 'nav-parent-dashboard' },
          { href: '/parent/progress', label: 'Child Progress', testId: 'nav-parent-progress' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(user?.role || '');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" data-testid="portal-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and School Info */}
          <Link href="/" className="flex items-center space-x-4" data-testid="portal-logo">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">Treasure-Home School</h1>
              <p className="text-xs text-textSecondary">Portal Dashboard</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6" data-testid="portal-desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-textPrimary hover:text-primary font-medium transition-colors"
                data-testid={item.testId}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="notifications-button">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-textPrimary">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-textSecondary">
                      {getRoleDisplayName(user?.role)}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem data-testid="user-profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="user-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center" data-testid="user-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="portal-mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t" data-testid="portal-mobile-menu">
            <div className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-textPrimary hover:text-primary font-medium transition-colors"
                  data-testid={`mobile-${item.testId}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <a 
                  href="/api/logout" 
                  className="block text-red-600 hover:text-red-700 font-medium"
                  data-testid="mobile-logout"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
