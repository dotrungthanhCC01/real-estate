"use client";

import { Home, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";

const ROOMS_DATA = [
  { id: 1, name: "Phòng 101", floor: "Tầng 1", area: "20m²", price: 3500000, type: "Phòng đơn", status: "rented", amenities: ["Máy lạnh", "WC riêng", "Ban công"] },
  { id: 2, name: "Phòng 102", floor: "Tầng 1", area: "22m²", price: 3800000, type: "Phòng đôi", status: "vacant", amenities: ["Máy lạnh", "WC riêng"] },
  { id: 3, name: "Phòng 201", floor: "Tầng 2", area: "25m²", price: 4200000, type: "Phòng đôi", status: "rented", amenities: ["Máy lạnh", "WC riêng", "Tủ lạnh"] },
  { id: 4, name: "Phòng 202", floor: "Tầng 2", area: "25m²", price: 4200000, type: "Phòng đôi", status: "vacant", amenities: ["Máy lạnh", "WC riêng"] },
  { id: 5, name: "Phòng 301", floor: "Tầng 3", area: "30m²", price: 5000000, type: "Studio", status: "rented", amenities: ["Máy lạnh", "WC riêng", "Tủ lạnh", "Máy giặt"] },
  { id: 6, name: "Phòng 302", floor: "Tầng 3", area: "30m²", price: 5000000, type: "Studio", status: "maintenance", amenities: ["Máy lạnh", "WC riêng"] },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  rented: { label: "Đã thuê", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  vacant: { label: "Phòng trống", cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400" },
  maintenance: { label: "Bảo trì", cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

export const LandlordRoomsPage = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? ROOMS_DATA : ROOMS_DATA.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Home size={18} className="text-amber-600 dark:text-amber-400" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Quản Lý Phòng</h1>
          </div>
          <p className="text-sm text-zinc-500">Tổng {ROOMS_DATA.length} phòng · {ROOMS_DATA.filter(r => r.status === "rented").length} đang cho thuê · {ROOMS_DATA.filter(r => r.status === "vacant").length} trống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-[0_4px_12px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-0.5 cursor-pointer">
          <Plus size={14} />
          Thêm phòng
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "Tất cả" },
          { key: "rented", label: "Đang thuê" },
          { key: "vacant", label: "Phòng trống" },
          { key: "maintenance", label: "Bảo trì" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              filter === f.key
                ? "bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.35)]"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Room grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const status = STATUS_CONFIG[r.status];
          return (
            <div key={r.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="h-24 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 flex items-center justify-center relative">
                <Home size={32} className="text-amber-300 dark:text-amber-700" />
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                  {status.label}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{r.name}</h3>
                    <p className="text-[11px] text-zinc-500">{r.floor} · {r.type} · {r.area}</p>
                  </div>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {r.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.amenities.map((a) => (
                    <span key={a} className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                    <Eye size={12} /> Xem
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors cursor-pointer">
                    <Edit2 size={12} /> Sửa
                  </button>
                  <button className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
