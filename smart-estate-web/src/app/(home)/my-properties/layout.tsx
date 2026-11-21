"use client";

import type { ReactNode } from "react";
import { LayoutList } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoginRequiredView } from "@/components/common/LoginRequiredView";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute
      allowedRole="user"
      guestFallback={
        <LoginRequiredView
          icon={LayoutList}
          title="Quản lý BĐS"
          description="Theo dõi bất động sản bạn đang thuê, gửi yêu cầu sửa chữa và đánh giá sau khi ở."
        />
      }
    >
      {children}
    </ProtectedRoute>
  );
}
