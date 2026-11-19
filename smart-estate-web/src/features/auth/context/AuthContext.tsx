"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  AuthContextValue,
  AuthUser,
  EditableProfile,
  RegisterInput,
} from "@/features/auth/types/auth.types";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError, SESSION_EXPIRED_EVENT, tokenStorage } from "@/lib/axios";

/** Lưu user để hiển thị ngay khi tải lại trang; nguồn thật vẫn là GET /auth/me. */
const STORAGE_KEY = "smart_estate_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Không có token (vd. phiên mock cũ) thì coi như chưa đăng nhập.
    if (!tokenStorage.getAccess()) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // Khôi phục phiên: có token thì hỏi lại /auth/me (axios tự refresh nếu access token đã hết hạn).
  useEffect(() => {
    if (!tokenStorage.getAccess()) return;
    authApi
      .me()
      // Giữ phone/address người dùng tự nhập (backend chưa lưu các trường này)
      .then((fresh) => setUser((prev) => ({ ...prev, ...fresh })))
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) clearSession();
      });
  }, [clearSession]);

  // Refresh token cũng hết hạn → đăng xuất
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, clearSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, clearSession);
  }, [clearSession]);

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    tokenStorage.set(tokens.accessToken, tokens.refreshToken);
    try {
      const me = await authApi.me();
      setUser(me);
      return me;
    } catch (err) {
      tokenStorage.clear();
      throw err;
    }
  };

  const register = async (input: RegisterInput) => {
    await authApi.register(input);
    return login(input.email, input.password);
  };

  const logout = () => {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
    clearSession();
  };

  const updateProfile = (data: Partial<EditableProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
