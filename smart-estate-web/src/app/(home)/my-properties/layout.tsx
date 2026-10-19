import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export default function Layout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRole="user">{children}</ProtectedRoute>;
}
