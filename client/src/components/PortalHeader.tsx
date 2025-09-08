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
import { useAuth } from "@/hooks/useAuth";

interface PortalHeaderProps {
  user: any;
}

export default function PortalHeader({ user }: PortalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const getInitials = (fullName: string | null) => {
    if (!fullName) return 'U';
    const parts = fullName.split(' ');
    let initials = '';
    if (parts.length > 0) {
      initials += parts[0].charAt(0).toUpperCase();
    }
    if (parts.length > 1) {
      initials += parts[parts.length - 1].charAt(0).toUpperCase();
    }
    return initials;
  };

  const getRoleDisplayName = (role: string | null) => {
    switch (role?.toLowerCase()) {
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

  const getNavItems = (roleName: string | null) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', testId: 'nav-admin-dashboard' },
          { href: '/admin/users', label: 'Users', testId: 'nav-admin-users' },
          { href: '/admin/announcements', label: 'Announcements', testId: 'nav-admin-announcements' },
          { href: '/admin/gallery', label: 'Gallery', testId: 'nav-admin-gallery' },
          { href: '/admin/exams', label: 'Exams', testId: 'nav-admin-exams' },
          { href: '/admin/enrollments', label: 'Enrollments', testId: 'nav-admin-enrollments' },
          { href: '/admin/create-user', label: 'Create User', testId: 'nav-admin-create-user' },
        ];
      case 'teacher':
        return [
          { href: '/teacher', label: 'Dashboard', testId: 'nav-teacher-dashboard' },
          { href: '/teacher/exams', label: 'Exams', testId: 'nav-teacher-exams' },
        ];
      case 'student':
        return [
          { href: '/student', label: 'Dashboard', testId: 'nav-student-dashboard' },
          { href: '/student/results', label: 'Results', testId: 'nav-student-results' },
        ];
      case 'parent':
        return [
          { href: '/parent', label: 'Dashboard', testId: 'nav-parent-dashboard' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(user?.role_name);

  if (!user) {
    return null;
  }
  
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
                    <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-textPrimary">
                      {user?.full_name}
                    </div>
                    <div className="text-xs text-textSecondary">
                      {getRoleDisplayName(user?.role_name)}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <Link href="/profile" className="flex w-full" data-testid="user-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="flex w-full" data-testid="user-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} data-testid="user-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
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
                <Button
                  onClick={() => logout()}
                  className="block text-red-600 hover:text-red-700 font-medium cursor-pointer w-full text-left"
                  variant="ghost"
                  data-testid="mobile-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
