"use client";

import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoginRequiredView } from "@/components/common/LoginRequiredView";

// BĐS đã lưu: khách thấy lời mời đăng nhập ngay trong trang (không bị chuyển hướng)
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute
      guestFallback={
        <LoginRequiredView
          icon={Heart}
          title="BĐS đã lưu"
          description="Đăng nhập để lưu những căn bạn thích, xem lại bất cứ lúc nào và so sánh chúng với nhau."
        />
      }
    >
      {children}
    </ProtectedRoute>
  );
}
