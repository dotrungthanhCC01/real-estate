"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/features/auth/types/auth.types";

interface ProtectedRouteProps {
  /** If specified, only this role is allowed. Otherwise any authenticated user passes. */
  allowedRole?: UserRole;
  children: ReactNode;
}

const roleHome: Record<UserRole, string> = {
  user: "/dashboard",
  landlord: "/landlord",
  admin: "/admin",
};

/**
 * Route guard that checks authentication and (optionally) role.
 * - Not authenticated → redirect to /auth/login
 * - Wrong role        → redirect to the correct dashboard for their role
 * - Correct role      → render children
 */
export const ProtectedRoute = ({ allowedRole, children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const redirectTo = !isAuthenticated
    ? "/auth/login"
    : allowedRole && user?.role !== allowedRole
      ? roleHome[user!.role]
      : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (redirectTo) return null;

  return <>{children}</>;
};
