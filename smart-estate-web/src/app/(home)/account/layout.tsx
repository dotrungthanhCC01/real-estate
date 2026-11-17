import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

// Trang Tài khoản này dành cho vai trò Người dùng (landlord / admin có trang riêng)
export default function Layout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRole="user">{children}</ProtectedRoute>;
}
