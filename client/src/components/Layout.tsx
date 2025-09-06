import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import PublicHeader from "./PublicHeader";
import PortalHeader from "./PortalHeader"; // Import the correct header component

interface LayoutProps {
  children: ReactNode;
  type?: "public" | "portal";
}

export default function Layout({ children, type = "public" }: LayoutProps) {
  const { user } = useAuth(); // We only need the user object here

  return (
    <div className="min-h-screen bg-backgroundSurface">
      {type === "public" ? (
        <PublicHeader />
      ) : (
        // Pass the user object to the PortalHeader component
        <PortalHeader user={user} />
      )}
      <main className="flex-grow">{children}</main>
    </div>
  );
}
