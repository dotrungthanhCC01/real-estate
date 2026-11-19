"use client";

import { useState } from "react";
import { Users, Search, Shield, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { UserRole } from "@/features/auth/types/auth.types";
import { useAdminUsers } from "@/features/admin/api/admin-users.api";
import { getErrorMessage } from "@/lib/axios";

const PAGE_SIZE = 20;

const ROLE_LABEL: Record<UserRole, string> = { user: "Người dùng", landlord: "Chủ trọ", admin: "Admin" };
const ROLE_CLS: Record<UserRole, string> = {
  user: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  landlord: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  admin: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
};

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");

export const AdminUsersPage = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching, refetch } = useAdminUsers({
    page,
    pageSize: PAGE_SIZE,
    role: role || undefined,
  });

  // Backend chưa hỗ trợ tìm kiếm: lọc tên/email trong trang đang xem
  const keyword = search.trim().toLowerCase();
  const users = (data?.items ?? []).filter(
    (u) => !keyword || u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword),
  );
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-violet-600 dark:text-violet-400" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Quản Lý Người Dùng</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Quản lý tài khoản người dùng và chủ trọ
          {data && <> · {data.total} tài khoản</>}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 w-full max-w-xs">
          <Search size={14} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 w-full"
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as UserRole | "");
            setPage(1);
          }}
          aria-label="Lọc theo vai trò"
          className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 outline-none cursor-pointer"
        >
          <option value="">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="landlord">Chủ trọ</option>
          <option value="admin">Admin</option>
        </select>
        {isFetching && !isLoading && <Loader2 size={15} className="animate-spin text-zinc-400" />}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors cursor-pointer ml-auto shadow-[0_2px_8px_rgba(139,92,246,0.35)]">
          <Shield size={14} />
          Thêm Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
            <Loader2 size={16} className="animate-spin" /> Đang tải danh sách...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-sm text-red-600 dark:text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} /> {getErrorMessage(error)}
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <RefreshCw size={13} /> Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Người dùng</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Vai trò</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden md:table-cell">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-sm text-zinc-500">
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{u.name}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${ROLE_CLS[u.role]}`}>
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500 hidden md:table-cell">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500">
            <span>
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                aria-label="Trang trước"
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                aria-label="Trang sau"
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
