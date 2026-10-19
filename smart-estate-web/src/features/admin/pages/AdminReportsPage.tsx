"use client";

import { BarChart3, TrendingUp, Users, Building2, DollarSign } from "lucide-react";

const MONTHLY = [
  { month: "T4", users: 820, revenue: 142 },
  { month: "T5", users: 940, revenue: 165 },
  { month: "T6", users: 1100, revenue: 190 },
  { month: "T7", users: 980, revenue: 172 },
  { month: "T8", users: 1350, revenue: 230 },
  { month: "T9", users: 1520, revenue: 284 },
];

const maxRevenue = Math.max(...MONTHLY.map((m) => m.revenue));
const maxUsers = Math.max(...MONTHLY.map((m) => m.users));

const SUMMARY = [
  { label: "Tổng doanh thu năm", value: "₫ 1.84 Tỷ", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { label: "Người dùng mới tháng này", value: "+1,520", icon: Users, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { label: "BĐS mới tháng này", value: "+248", icon: Building2, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  { label: "Tăng trưởng", value: "+18.5%", icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
];

export const AdminReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={18} className="text-violet-600 dark:text-violet-400" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Báo Cáo & Thống Kê</h1>
        </div>
        <p className="text-sm text-zinc-500">Phân tích hiệu suất hệ thống theo thời gian</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon size={17} className={s.color} />
              </div>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{s.value}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart: Revenue */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Doanh Thu Theo Tháng</h2>
            <p className="text-[11px] text-zinc-500">Đơn vị: triệu đồng (₫M)</p>
          </div>
          <span className="text-[11px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 px-2.5 py-1 rounded-full">6 tháng gần nhất</span>
        </div>
        <div className="flex items-end gap-3 h-40">
          {MONTHLY.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500">₫{m.revenue}M</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-400 transition-all duration-500"
                style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
              />
              <span className="text-[11px] text-zinc-500 font-medium">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart: Users */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Người Dùng Mới Theo Tháng</h2>
          </div>
        </div>
        <div className="flex items-end gap-3 h-32">
          {MONTHLY.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500">{m.users}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all duration-500"
                style={{ height: `${(m.users / maxUsers) * 100}%` }}
              />
              <span className="text-[11px] text-zinc-500 font-medium">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
