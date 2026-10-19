import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AdminLayout } from "@/layouts/AdminLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRole="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
