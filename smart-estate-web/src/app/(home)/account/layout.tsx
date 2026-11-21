import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

// Trang Tài khoản dành cho vai trò Người dùng (landlord / admin có trang riêng).
// Khách chưa đăng nhập vẫn vào được: AccountPage tự hiển thị trạng thái khách.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRole="user" guestFallback={children}>
      {children}
    </ProtectedRoute>
  );
}
