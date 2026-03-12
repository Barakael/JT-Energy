import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional: restrict to a specific role */
  role?: "hr_admin" | "employee";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Still rehydrating the session from localStorage — don't redirect yet.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
