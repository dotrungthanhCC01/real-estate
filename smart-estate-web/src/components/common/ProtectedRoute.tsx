import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/features/auth/types/auth.types";

interface ProtectedRouteProps {
  /** If specified, only this role is allowed. Otherwise any authenticated user passes. */
  allowedRole?: UserRole;
}

/**
 * Route guard that checks authentication and (optionally) role.
 * - Not authenticated → redirect to /auth/login
 * - Wrong role        → redirect to the correct dashboard for their role
 * - Correct role      → render <Outlet />
 */
export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check it
  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to the correct dashboard for this user's actual role
    const roleHome: Record<UserRole, string> = {
      user: "/dashboard",
      landlord: "/landlord",
      admin: "/admin",
    };
    return <Navigate to={roleHome[user!.role]} replace />;
  }

  return <Outlet />;
};
