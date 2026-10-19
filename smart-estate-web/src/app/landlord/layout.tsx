import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LandlordLayout } from "@/layouts/LandlordLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRole="landlord">
      <LandlordLayout>{children}</LandlordLayout>
    </ProtectedRoute>
  );
}
