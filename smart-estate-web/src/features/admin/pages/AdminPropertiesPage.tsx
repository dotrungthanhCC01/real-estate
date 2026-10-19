"use client";

import { Building2, CheckCircle, XCircle, Eye, Search } from "lucide-react";
import { useState } from "react";

const PROPERTIES = [
  { id: 1, title: "Phòng trọ cao cấp Bình Thạnh", landlord: "Trần Thị Bích", type: "Phòng trọ", price: "3.500.000đ/tháng", area: "20m²", status: "pending", posted: "22/09/2026" },
  { id: 2, title: "Căn hộ mini Q.7 full nội thất", landlord: "Phạm Quốc Dũng", type: "Căn hộ", price: "5.000.000đ/tháng", area: "30m²", status: "approved", posted: "21/09/2026" },
  { id: 3, title: "Nhà nguyên căn Gò Vấp 4 PN", landlord: "Lê Văn E", type: "Nhà nguyên căn", price: "8.500.000đ/tháng", area: "80m²", status: "pending", posted: "21/09/2026" },
  { id: 4, title: "Studio Tân Bình gần sân bay", landlord: "Hoàng Minh F", type: "Studio", price: "4.200.000đ/tháng", area: "25m²", status: "approved", posted: "20/09/2026" },
  { id: 5, title: "Phòng trọ Q.12 có bãi xe rộng", landlord: "Nguyễn Thị G", type: "Phòng trọ", price: "2.800.000đ/tháng", area: "18m²", status: "rejected", posted: "19/09/2026" },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  approved: { label: "Đã duyệt", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  rejected: { label: "Từ chối", cls: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
};

export const AdminPropertiesPage = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = PROPERTIES.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.landlord.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={18} className="text-violet-600 dark:text-violet-400" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Quản Lý Bất Động Sản</h1>
        </div>
        <p className="text-sm text-zinc-500">Duyệt và quản lý các tin đăng BĐS</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 w-full max-w-xs">
          <Search size={14} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm BĐS, chủ trọ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 w-full"
          />
        </div>
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              filterStatus === s
                ? "bg-violet-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
            }`}
          >
            {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((p) => {
          const status = STATUS_CONFIG[p.status];
          return (
            <div key={p.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/60 dark:to-indigo-950/60 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{p.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{p.landlord} · {p.type} · {p.area} · Đăng {p.posted}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{p.price}</span>
                  </div>
                </div>
              </div>
              {p.status === "pending" && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer">
                    <CheckCircle size={12} /> Duyệt
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer">
                    <XCircle size={12} /> Từ chối
                  </button>
                </div>
              )}
              <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer shrink-0">
                <Eye size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
