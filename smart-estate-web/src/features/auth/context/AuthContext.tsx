"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type {
  AuthContextValue,
  AuthUser,
  EditableProfile,
  UserRole,
} from "@/features/auth/types/auth.types";

// ─── Mock user data per role (demo / prototype) ───────────────────────────────
const MOCK_USERS: Record<UserRole, AuthUser> = {
  user: {
    id: "u-001",
    name: "Nguyễn Văn An",
    email: "user@smartestate.vn",
    role: "user",
    phone: "0901 234 567",
    address: "Bình Thạnh, TP. Hồ Chí Minh",
    createdAt: "2025-03-14T09:00:00.000Z",
  },
  landlord: {
    id: "l-001",
    name: "Trần Thị Bích",
    email: "landlord@smartestate.vn",
    role: "landlord",
  },
  admin: {
    id: "a-001",
    name: "Admin Smart Estate",
    email: "admin@smartestate.vn",
    role: "admin",
  },
};

const STORAGE_KEY = "smart_estate_auth";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as AuthUser;
      // Gộp với dữ liệu mẫu để phiên đăng nhập cũ cũng có các trường mới (phone, createdAt...)
      return { ...MOCK_USERS[parsed.role], ...parsed };
    } catch {
      return null;
    }
  });

  // Persist to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (_email: string, _password: string, role: UserRole) => {
    // In production: call API, validate credentials, get JWT
    // For demo: resolve mock user by role
    const resolvedUser = MOCK_USERS[role];
    setUser(resolvedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Demo: cập nhật trực tiếp & lưu localStorage. Khi có API: gọi PUT /me rồi setUser(kết quả).
  const updateProfile = (data: Partial<EditableProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
