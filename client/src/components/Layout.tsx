import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import PublicHeader from "./PublicHeader";
import Navigation from "./Navigation"; // New navigation component

interface LayoutProps {
  children: ReactNode;
  type?: "public" | "portal";
}

export default function Layout({ children, type = "public" }: LayoutProps) {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-backgroundSurface">
      {type === "public" ? (
        <PublicHeader />
      ) : (
        <Navigation />
      )}
      <main>{children}</main>
    </div>
  );
}
