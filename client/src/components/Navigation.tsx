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
  LogOut
} from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const navItems = {
    Admin: [
      { path: "/admin", label: "Dashboard", icon: Home },
      { path: "/admin/users", label: "Users", icon: Users },
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
      { path: "/student/results", label: "Results", icon: BookOpen },
    ],
    Parent: [
      { path: "/parent", label: "Dashboard", icon: Home },
    ]
  };

  const items = navItems[user.role_name as keyof typeof navItems] || [];

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
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
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-textSecondary">
              Welcome, {user.full_name}
            </span>
            <Button variant="outline" onClick={logout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
