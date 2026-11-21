"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authHref } from "@/features/auth/context/AuthPromptContext";
import type { UserRole } from "@/features/auth/types/auth.types";

interface ProtectedRouteProps {
  /** If specified, only this role is allowed. Otherwise any authenticated user passes. */
  allowedRole?: UserRole;
  /**
   * Nội dung cho khách chưa đăng nhập (vd. trang ở trạng thái khách + nút đăng nhập).
   * Có thì khách ở lại trang thay vì bị chuyển sang /auth/login.
   */
  guestFallback?: ReactNode;
  children: ReactNode;
}

const roleHome: Record<UserRole, string> = {
  user: "/home",
  landlord: "/landlord",
  admin: "/admin",
};

/**
 * Route guard that checks authentication and (optionally) role.
 * - Not authenticated → `guestFallback` nếu có, ngược lại chuyển tới /auth/login?next=<trang này>
 * - Wrong role        → redirect to the correct dashboard for their role
 * - Correct role      → render children
 */
export const ProtectedRoute = ({ allowedRole, guestFallback, children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const showGuest = !isAuthenticated && guestFallback !== undefined;
  const redirectTo = showGuest
    ? null
    : !isAuthenticated
      ? authHref("login", pathname)
      : allowedRole && user?.role !== allowedRole
        ? roleHome[user!.role]
        : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (showGuest) return <>{guestFallback}</>;
  if (redirectTo) return null;

  return <>{children}</>;
};
