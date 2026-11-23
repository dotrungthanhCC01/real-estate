"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Settings2, AlertCircle, RefreshCw, MessageSquareWarning } from "lucide-react";
import { useMyListings, type ManagedProperty } from "@/features/listings/api/listings.api";
import { STATUS_DOT, STATUS_LABEL, formatShortVnd } from "@/features/landlord/lib/landlordStats";
import { ApprovalStepper } from "@/features/landlord/components/ListingProgress";
import { usePostListing } from "@/features/landlord/context/PostListingContext";
import { getErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";

/**
 * Quản lý đăng tin: theo dõi tiến trình từng tin (Đăng tin → Chờ duyệt → Hiển thị công khai),
 * lọc theo trạng thái duyệt của BE, sửa tin (sửa nội dung → admin duyệt lại).
 */
type Filter = "all" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "HIDDEN";
const FILTERS: { key: Filter; label: string; match: (p: ManagedProperty) => boolean }[] = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "PENDING_REVIEW", label: "Chờ duyệt", match: (p) => p.approvalStatus === "PENDING_REVIEW" },
  { key: "APPROVED", label: "Đã duyệt", match: (p) => p.approvalStatus === "APPROVED" && p.beStatus !== "HIDDEN" },
  { key: "REJECTED", label: "Bị từ chối", match: (p) => p.approvalStatus === "REJECTED" },
  { key: "HIDDEN", label: "Đang ẩn", match: (p) => p.beStatus === "HIDDEN" },
];

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");


export const LandlordListingsPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useMyListings();
  const { openEditListing } = usePostListing();
  const focusId = useSearchParams().get("id");
  const [filter, setFilter] = useState<Filter>("all");

  const list = data.filter(FILTERS.find((f) => f.key === filter)!.match);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[24px] bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-24 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-[#86402F]" />
        <p className="text-[14px]">{getErrorMessage(error)}</p>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 px-4 h-10 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight leading-none">Quản lý đăng tin</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">Theo dõi tiến trình duyệt và trạng thái của từng tin đăng</p>
      </div>

      {/* Lọc theo trạng thái duyệt */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = data.filter(f.match).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 h-10 rounded-full text-[13px] font-medium transition-colors cursor-pointer",
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
              )}
            >
              {f.label} <span className="ml-1 opacity-60 tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-[24px] bg-card py-16 text-center text-[13px] text-muted-foreground">Không có tin nào ở mục này.</div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => {
            const focused = focusId === p.id;
            return (
              <li key={p.id} className={cn("rounded-[24px] bg-card", focused && "ring-2 ring-foreground/20")}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4 p-4">
                  <div className="flex min-w-[260px] flex-1 items-center gap-4">
                    <img src={p.thumbnailUrl} alt="" className="w-20 h-16 rounded-2xl object-cover bg-secondary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium truncate">{p.title}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground truncate">
                        {p.address}, {p.district} · Đăng {fmtDate(p.postedAt)} · {formatShortVnd(p.priceVnd)}/tháng
                      </p>
                      <span className="mt-1.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                        <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[p.beStatus])} /> {STATUS_LABEL[p.beStatus]}
                      </span>
                    </div>
                  </div>

                  {/* Tiến trình 3 bước: Đăng tin → Chờ duyệt → Hiển thị công khai */}
                  <ApprovalStepper p={p} showNotes />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditListing(p)}
                      className="flex items-center gap-1.5 px-4 h-10 rounded-full bg-background hover:bg-secondary text-[12.5px] font-medium cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <Link
                      href={`/landlord/rooms?id=${p.id}`}
                      title="Quản lý sản phẩm"
                      className="w-10 h-10 rounded-full bg-background hover:bg-secondary flex items-center justify-center text-foreground"
                    >
                      <Settings2 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {p.approvalStatus === "REJECTED" && p.rejectReason && (
                  <p className="mx-4 mb-4 flex items-start gap-2 rounded-2xl bg-[#F1DDD5] px-4 py-2.5 text-[12.5px] text-[#86402F] dark:bg-[#38221C] dark:text-[#E3AE9F]">
                    <MessageSquareWarning className="w-4 h-4 shrink-0 mt-px" />
                    <span>
                      <b>Lý do từ chối:</b> {p.rejectReason}. Bấm <b>Sửa</b> để cập nhật — tin sẽ được gửi duyệt lại.
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
