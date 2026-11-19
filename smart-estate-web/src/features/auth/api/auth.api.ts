import { api } from "@/lib/axios";
import type { AuthUser, UserRole } from "@/features/auth/types/auth.types";

// ─── Kiểu dữ liệu của identity-service ───────────────────────────────────────
export type BackendRole = "TENANT" | "LANDLORD" | "ADMIN";

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: BackendRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

// ─── Đổi vai trò backend ↔ web ───────────────────────────────────────────────
const ROLE_FROM_BACKEND: Record<BackendRole, UserRole> = {
  TENANT: "user",
  LANDLORD: "landlord",
  ADMIN: "admin",
};

export const ROLE_TO_BACKEND: Record<UserRole, BackendRole> = {
  user: "TENANT",
  landlord: "LANDLORD",
  admin: "ADMIN",
};

export const toAuthUser = (u: BackendUser): AuthUser => ({
  id: u.id,
  name: u.fullName,
  email: u.email,
  role: ROLE_FROM_BACKEND[u.role],
  createdAt: u.createdAt,
});

// ─── Gọi API (/api/v1/auth/*) ───────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>("/auth/login", { email, password }).then((r) => r.data),

  register: (input: { email: string; password: string; fullName: string; role: Exclude<UserRole, "admin"> }) =>
    api
      .post<BackendUser>("/auth/register", { ...input, role: ROLE_TO_BACKEND[input.role] })
      .then((r) => toAuthUser(r.data)),

  me: () => api.get<BackendUser>("/auth/me").then((r) => toAuthUser(r.data)),

  logout: (refreshToken: string) => api.post<void>("/auth/logout", { refreshToken }),
};
