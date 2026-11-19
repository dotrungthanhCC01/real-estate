import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toAuthUser, ROLE_TO_BACKEND, type BackendUser } from "@/features/auth/api/auth.api";
import type { UserRole } from "@/features/auth/types/auth.types";

export interface AdminUsersQuery {
  page: number;
  pageSize: number;
  role?: UserRole;
}

/** GET /api/v1/admin/users (chỉ ADMIN). Backend phân trang, tối đa 50 dòng/trang. */
export const fetchAdminUsers = async ({ page, pageSize, role }: AdminUsersQuery) => {
  const res = await api.get<BackendUser[]>("/admin/users", {
    params: { page, pageSize, ...(role ? { role: ROLE_TO_BACKEND[role] } : {}) },
  });
  return {
    items: res.data.map(toAuthUser),
    total: res.meta.total ?? res.data.length,
    totalPages: res.meta.totalPages ?? 1,
  };
};

export const useAdminUsers = (query: AdminUsersQuery) =>
  useQuery({
    queryKey: ["admin", "users", query],
    queryFn: () => fetchAdminUsers(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
