import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Megaphone, 
  Image, 
  BookOpen, 
  UserPlus,
  LogOut,
  GraduationCap,
  BarChart3,
  FileText
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const navItems = {
    Admin: [
      { path: "/admin", label: "Dashboard", icon: Home },
      { path: "/admin/users", label: "Users", icon: Users }, // FIXED: This was missing
      { path: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { path: "/admin/gallery", label: "Gallery", icon: Image },
      { path: "/admin/exams", label: "Exams", icon: BookOpen },
      { path: "/admin/enrollments", label: "Enrollments", icon: UserPlus },
    ],
    Teacher: [
      { path: "/teacher", label: "Dashboard", icon: Home },
      { path: "/teacher/exams", label: "Exams", icon: BookOpen },
    ],
    Student: [
      { path: "/student", label: "Dashboard", icon: Home },
      { path: "/student/results", label: "Results", icon: BarChart3 },
    ],
    Parent: [
      { path: "/parent", label: "Dashboard", icon: Home },
    ]
  };

  const items = navItems[user.role_name as keyof typeof navItems] || [];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-textPrimary">
                  Treasure Home School
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <span className="text-sm text-textSecondary">
                Welcome, <span className="font-medium">{user.full_name}</span>
              </span>
              <div className="text-xs text-textSecondary">
                {user.role_name}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={logout} 
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </Button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-textSecondary hover:text-textPrimary hover:bg-backgroundSurface"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-textSecondary hover:text-textPrimary hover:bg-backgroundSurface"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              
              {/* Mobile user info */}
              <div className="px-3 py-2 border-t border-border mt-2">
                <div className="text-sm text-textSecondary">
                  Welcome, <span className="font-medium">{user.full_name}</span>
                </div>
                <div className="text-xs text-textSecondary">
                  {user.role_name}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
