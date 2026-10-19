"use client";

import { useState } from "react";
import { Users, Search, Filter, MoreVertical, CheckCircle, XCircle, Shield } from "lucide-react";

const USERS_DATA = [
  { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", role: "user", status: "active", joined: "01/09/2026", properties: 0 },
  { id: 2, name: "Trần Thị Bích", email: "bich.tran@gmail.com", role: "landlord", status: "active", joined: "15/08/2026", properties: 5 },
  { id: 3, name: "Lê Minh Cường", email: "cuong.le@gmail.com", role: "user", status: "pending", joined: "20/09/2026", properties: 0 },
  { id: 4, name: "Phạm Quốc Dũng", email: "dung.pham@gmail.com", role: "landlord", status: "active", joined: "10/07/2026", properties: 12 },
  { id: 5, name: "Hoàng Thị Ema", email: "ema.hoang@gmail.com", role: "user", status: "blocked", joined: "05/06/2026", properties: 0 },
  { id: 6, name: "Vũ Văn Phong", email: "phong.vu@gmail.com", role: "landlord", status: "pending", joined: "18/09/2026", properties: 0 },
  { id: 7, name: "Đặng Thị Giang", email: "giang.dang@gmail.com", role: "user", status: "active", joined: "22/09/2026", properties: 0 },
];

const ROLE_LABEL: Record<string, string> = { user: "Người dùng", landlord: "Chủ trọ", admin: "Admin" };
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  active: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  pending: { label: "Chờ xác minh", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  blocked: { label: "Bị chặn", cls: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
};

export const AdminUsersPage = () => {
  const [search, setSearch] = useState("");
  const filtered = USERS_DATA.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-violet-600 dark:text-violet-400" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Quản Lý Người Dùng</h1>
        </div>
        <p className="text-sm text-zinc-500">Quản lý tài khoản người dùng và chủ trọ</p>
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
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
          <Filter size={14} />
          Bộ lọc
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors cursor-pointer ml-auto shadow-[0_2px_8px_rgba(139,92,246,0.35)]">
          <Shield size={14} />
          Thêm Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Người dùng</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden md:table-cell">Vai trò</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Trạng thái</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Ngày tham gia</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden lg:table-cell">BĐS</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((u) => {
              const status = STATUS_CONFIG[u.status];
              return (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{u.name}</p>
                        <p className="text-[11px] text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      u.role === "landlord"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-500 hidden lg:table-cell">{u.joined}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-500 hidden lg:table-cell">{u.properties}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-pointer"><CheckCircle size={13} /></button>
                      <button className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"><XCircle size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"><MoreVertical size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
