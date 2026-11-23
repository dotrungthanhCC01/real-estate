"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  ChevronDown,
  Pencil,
  SlidersHorizontal,
  Check,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Images,
  CalendarDays,
  Wallet,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  AMENITY_LABEL,
  useListingAction,
  useMyListings,
  type BeAmenity,
  type ManagedProperty,
} from "@/features/listings/api/listings.api";
import {
  APPROVAL_LABEL,
  APPROVAL_PILL,
  STATUS_LABEL,
  STATUS_PILL,
  formatShortVnd,
  STATUS_DOT,
} from "@/features/landlord/lib/landlordStats";
import { getErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import {
  PERIOD_LABEL,
  PREVIOUS_LABEL,
  changePct,
  getListingAnalytics,
  type AnalyticsPeriod,
  type ListingAnalytics,
  type MetricPair,
} from "@/features/landlord/lib/listingAnalytics";
import { usePostListing } from "@/features/landlord/context/PostListingContext";
import {
  AMENITY_FULL_LABEL,
  BADGE_LABEL,
  DIRECTION_LABEL,
  POSTER_TYPE_LABEL,
  ROOM_TYPE_LABEL,
  getListingExtras,
} from "@/features/landlord/lib/listingExtras";

const panel = "rounded-[24px] bg-card";

// ─── Phân loại theo trạng thái BE ───────────────────────────────────────────
type CategoryKey = "all" | "TAKEN" | "PENDING_REVIEW" | "REJECTED" | "AVAILABLE" | "HELD" | "DEPOSITED" | "RENTED" | "HIDDEN";
const CATEGORIES: { key: CategoryKey; label: string; match: (p: ManagedProperty) => boolean }[] = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "PENDING_REVIEW", label: APPROVAL_LABEL.PENDING_REVIEW, match: (p) => p.approvalStatus === "PENDING_REVIEW" },
  { key: "AVAILABLE", label: STATUS_LABEL.AVAILABLE, match: (p) => p.approvalStatus === "APPROVED" && p.beStatus === "AVAILABLE" },
  { key: "TAKEN", label: "Đã cọc / thuê (tất cả)", match: (p) => ["HELD", "DEPOSITED", "RENTED"].includes(p.beStatus) },
  { key: "HELD", label: STATUS_LABEL.HELD, match: (p) => p.beStatus === "HELD" },
  { key: "DEPOSITED", label: STATUS_LABEL.DEPOSITED, match: (p) => p.beStatus === "DEPOSITED" },
  { key: "RENTED", label: STATUS_LABEL.RENTED, match: (p) => p.beStatus === "RENTED" },
  { key: "HIDDEN", label: STATUS_LABEL.HIDDEN, match: (p) => p.beStatus === "HIDDEN" },
  { key: "REJECTED", label: APPROVAL_LABEL.REJECTED, match: (p) => p.approvalStatus === "REJECTED" },
];

type Tab = "analytics" | "info" | "images" | "viewings" | "deposits";
const TABS: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "analytics", label: "Tổng quan", icon: BarChart3 },
  { key: "info", label: "Thông tin tin đăng", icon: FileText },
  { key: "images", label: "Hình ảnh", icon: Images },
  { key: "viewings", label: "Lịch xem nhà", icon: CalendarDays },
  { key: "deposits", label: "Đơn đặt cọc", icon: Wallet },
];

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");

// ─── Thống kê tương tác (Tuần / Tháng / Năm) ────────────────────────────────
const PeriodTabs = ({ value, onChange }: { value: AnalyticsPeriod; onChange: (p: AnalyticsPeriod) => void }) => (
  <div className="flex items-center gap-1 rounded-full bg-background p-1">
    {(Object.keys(PERIOD_LABEL) as AnalyticsPeriod[]).map((k) => (
      <button
        key={k}
        type="button"
        onClick={() => onChange(k)}
        className={cn(
          "px-3.5 h-8 rounded-full text-[12px] font-medium transition-colors cursor-pointer",
          value === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {PERIOD_LABEL[k]}
      </button>
    ))}
  </div>
);

const SampleBadge = () => (
  <span title="BE chưa có API thống kê — số liệu minh họa" className="px-2 h-6 rounded-full bg-[#F0E5CE] text-[#765A22] dark:bg-[#352C1A] dark:text-[#DCC28E] text-[10.5px] font-semibold flex items-center">
    Dữ liệu mẫu
  </span>
);

/** Một hàng so sánh: nhãn kỳ · thanh · số */
const CompareBar = ({ label, value, max, strong }: { label: string; value: number; max: number; strong?: boolean }) => (
  <div className="grid grid-cols-[78px_1fr_40px] items-center gap-2 text-[11.5px]">
    <span className={strong ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
    <span className="h-2 rounded-full bg-secondary overflow-hidden">
      <span
        className={cn("block h-full rounded-full", strong ? "bg-[var(--chart-2)]" : "bg-[var(--chart-3)]")}
        style={{ width: `${max ? (value / max) * 100 : 0}%` }}
      />
    </span>
    <span className={cn("text-right tabular-nums", strong ? "font-semibold text-foreground" : "text-muted-foreground")}>
      {value.toLocaleString("vi-VN")}
    </span>
  </div>
);

/** Số liệu kỳ này + so sánh rõ ràng với kỳ trước; rê chuột hiện chi tiết */
const MetricCard = ({ label, metric, period }: { label: string; metric: MetricPair; period: AnalyticsPeriod }) => {
  const pct = changePct(metric);
  const diff = metric.current - metric.previous;
  const max = Math.max(metric.current, metric.previous, 1);
  const up = diff >= 0;
  const thisLabel = `${PERIOD_LABEL[period]} này`;
  const prevLabel = PREVIOUS_LABEL[period].charAt(0).toUpperCase() + PREVIOUS_LABEL[period].slice(1);
  const tone = diff === 0 ? "text-muted-foreground" : up ? "text-[#3E5638] dark:text-[#B7CCAD]" : "text-[#86402F] dark:text-[#E3AE9F]";

  return (
    <div className="group relative rounded-2xl p-3 -m-3 hover:bg-background transition-colors">
      <p className="text-[12.5px] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[32px] leading-none tracking-tight tabular-nums">{metric.current.toLocaleString("vi-VN")}</p>
      <div className="mt-3 space-y-1.5">
        <CompareBar label={thisLabel} value={metric.current} max={max} strong />
        <CompareBar label={prevLabel} value={metric.previous} max={max} />
      </div>
      <p className={cn("mt-2 text-[11.5px] tabular-nums", tone)}>
        {diff === 0
          ? `Không đổi so với ${PREVIOUS_LABEL[period]}`
          : `${up ? "↑ Tăng" : "↓ Giảm"} ${Math.abs(diff).toLocaleString("vi-VN")} lượt${pct != null ? ` (${up ? "+" : "−"}${Math.abs(pct)}%)` : ""} so với ${PREVIOUS_LABEL[period]}`}
      </p>

      {/* Chi tiết khi rê chuột */}
      <div className="pointer-events-none absolute left-3 right-3 top-full z-20 mt-1 rounded-xl border border-border bg-popover px-3 py-2.5 text-[12px] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        <p className="font-semibold">{label}</p>
        <div className="mt-1.5 space-y-1 tabular-nums">
          <p className="flex justify-between gap-3">
            <span className="text-muted-foreground">{thisLabel}</span>
            <span className="font-semibold">{metric.current.toLocaleString("vi-VN")} lượt</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-muted-foreground">{prevLabel}</span>
            <span>{metric.previous.toLocaleString("vi-VN")} lượt</span>
          </p>
          <p className={cn("flex justify-between gap-3 border-t border-border pt-1", tone)}>
            <span>Chênh lệch</span>
            <span className="font-semibold">
              {up ? "+" : "−"}
              {Math.abs(diff).toLocaleString("vi-VN")}
              {pct != null && ` (${up ? "+" : "−"}${Math.abs(pct)}%)`}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const StatsRow = ({ data, period, onPeriod }: { data: ListingAnalytics; period: AnalyticsPeriod; onPeriod: (p: AnalyticsPeriod) => void }) => (
  <div className={cn(panel, "px-6 py-5")}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <p className="text-[15px] font-semibold">Tương tác của khách thuê</p>
        <SampleBadge />
      </div>
      <PeriodTabs value={period} onChange={onPeriod} />
    </div>
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <MetricCard label="Lượt thêm vào yêu thích" metric={data.favorites} period={period} />
      <MetricCard label="Lượt đặt lịch xem" metric={data.viewings} period={period} />
      <MetricCard label="Lượt click vào sản phẩm" metric={data.clicks} period={period} />
    </div>
  </div>
);

const clicksConfig = { clicks: { label: "Lượt click", color: "var(--chart-1)" } } satisfies ChartConfig;

/** Biểu đồ lượt click theo kỳ (thay "Tiến trình tin đăng" — tiến trình chuyển sang trang Quản lý đăng tin) */
const ClicksPanel = ({ data, period, className }: { data: ListingAnalytics; period: AnalyticsPeriod; className?: string }) => {
  const pct = changePct(data.clicks);
  return (
    <div className={cn(panel, "px-6 py-5 flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold">Lượt click vào sản phẩm</p>
          <p className="text-[12px] text-muted-foreground">
            Số lần khách mở trang chi tiết tin trong {PERIOD_LABEL[period].toLowerCase()} này
          </p>
        </div>
        <div className="text-right">
          <p className="text-[26px] leading-none tabular-nums">{data.clicks.current.toLocaleString("vi-VN")}</p>
          {pct != null && (
            <p className={cn("mt-1 text-[11.5px]", pct >= 0 ? "text-[#3E5638] dark:text-[#B7CCAD]" : "text-[#86402F] dark:text-[#E3AE9F]")}>
              {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}% so với {PREVIOUS_LABEL[period]}
            </p>
          )}
        </div>
      </div>
      <ChartContainer config={clicksConfig} className="mt-4 aspect-auto min-h-[220px] w-full flex-1">
        <AreaChart data={data.clickSeries} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10.5 }} interval="preserveStartEnd" minTickGap={14} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10.5 }} allowDecimals={false} width={44} />
          <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent valueFormatter={(v) => `${v} lượt`} />} />
          <Area type="monotone" dataKey="clicks" stroke="var(--color-clicks)" strokeWidth={2} fill="url(#clicksFill)" />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

// ─── Các tab phụ ────────────────────────────────────────────────────────────
const InfoPanel = ({ p }: { p: ManagedProperty }) => (
  <div className={cn(panel, "px-6 py-5 space-y-4 text-[13px]")}>
    <p className="text-[15px] font-semibold">Thông tin tin đăng</p>
    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
      {[
        ["Loại", p.propertyTypeLabel],
        ["Địa chỉ", `${p.address}, ${p.district}, ${p.city}`],
        ["Giá thuê", `${(p.priceVnd ?? 0).toLocaleString("vi-VN")} ₫ / tháng`],
        ["Tiền cọc", `${(p.depositAmountVnd ?? 0).toLocaleString("vi-VN")} ₫`],
        ["Diện tích", `${p.area} m²`],
        ["Tọa độ", `${p.lat}, ${p.lng}`],
        ["Ngày đăng", fmtDate(p.postedAt)],
        ["Cập nhật", fmtDate(p.updatedAt)],
      ].map(([k, v]) => (
        <div key={k}>
          <dt className="text-[11.5px] text-muted-foreground">{k}</dt>
          <dd className="font-medium">{v}</dd>
        </div>
      ))}
    </dl>
    <div>
      <p className="text-[11.5px] text-muted-foreground mb-1.5">Tiện ích</p>
      <div className="flex flex-wrap gap-1.5">
        {(p.amenityCodes ?? []).length === 0 ? (
          <span className="text-muted-foreground">Chưa chọn tiện ích</span>
        ) : (
          (p.amenityCodes as BeAmenity[]).map((a) => (
            <span key={a} className="px-2.5 py-1 rounded-full bg-background text-[11.5px]">
              {AMENITY_LABEL[a] ?? a}
            </span>
          ))
        )}
      </div>
    </div>
    <div>
      <p className="text-[11.5px] text-muted-foreground mb-1">Mô tả</p>
      <p className="whitespace-pre-line leading-relaxed">{p.description || "Chưa có mô tả."}</p>
    </div>
    <ExtrasBlock p={p} />
  </div>
);

/** Trường mở rộng (mock, lưu tạm trên trình duyệt — xem listingExtras.ts) */
const ExtrasBlock = ({ p }: { p: ManagedProperty }) => {
  const x = getListingExtras(p.id);
  const rows: [string, string | undefined][] = [
    ["Câu giới thiệu", x.tagline],
    ["Nguồn đăng", POSTER_TYPE_LABEL[x.posterType]],
    ["Nhãn tin", x.badges.map((b) => BADGE_LABEL[b]).join(", ") || undefined],
    ["Phòng ngủ · tắm · chỗ xe", [x.bedrooms, x.bathrooms, x.parking].some((v) => v != null) ? `${x.bedrooms ?? "—"} · ${x.bathrooms ?? "—"} · ${x.parking ?? "—"}` : undefined],
    ["Hướng nhà", x.direction ? DIRECTION_LABEL[x.direction] : undefined],
    ["Phường / xã", x.ward],
    ["Mốc gần đó", x.addressNote],
    ["Tiện ích mở rộng", x.extraAmenities.map((a) => AMENITY_FULL_LABEL[a] ?? a).join(", ") || undefined],
    ["Ảnh theo phòng", x.roomImages.map((r) => `${r.name} (${ROOM_TYPE_LABEL[r.roomType]})`).join(", ") || undefined],
  ];
  return (
    <div className="rounded-2xl bg-background p-4">
      <p className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold">
        Thông tin mở rộng
        <span className="px-2 h-5 rounded-full bg-[#F0E5CE] text-[#765A22] dark:bg-[#352C1A] dark:text-[#DCC28E] text-[10px] font-semibold flex items-center">
          Lưu tạm · chờ BE
        </span>
      </p>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11.5px] text-muted-foreground">{k}</dt>
            <dd className={cn("font-medium", !v && "text-muted-foreground font-normal")}>{v ?? "Chưa nhập"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const ImagesPanel = ({ p }: { p: ManagedProperty }) => {
  const real = p.images.filter((u) => !u.includes("listing-placeholder"));
  return (
    <div className={cn(panel, "px-6 py-5")}>
      <p className="text-[15px] font-semibold mb-4">Hình ảnh ({real.length}/10)</p>
      {real.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Tin này chưa có ảnh. Ảnh giúp tin dễ được chú ý hơn.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {real.map((u, i) => (
            <img key={u} src={u} alt={`Ảnh ${i + 1}`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
          ))}
        </div>
      )}
    </div>
  );
};

const PendingBePanel = ({ title, service }: { title: string; service: string }) => (
  <div className={cn(panel, "px-6 py-10 text-center")}>
    <Info className="mx-auto w-7 h-7 text-muted-foreground" />
    <p className="mt-3 text-[15px] font-semibold">{title}</p>
    <p className="mt-1 text-[13px] text-muted-foreground">Chưa có dữ liệu: service {service} của BE chưa được triển khai.</p>
  </div>
);

// ─── Khung ảnh lớn + thao tác ───────────────────────────────────────────────
const Hero = ({ p }: { p: ManagedProperty }) => {
  const action = useListingAction();
  const { openEditListing } = usePostListing();
  const busy = action.isPending;
  const canHide = p.beStatus === "AVAILABLE";
  const canUnhide = p.beStatus === "HIDDEN";
  const canDelete = p.beStatus !== "HELD" && p.beStatus !== "DEPOSITED";

  const btn = "w-11 h-11 rounded-xl bg-black/35 hover:bg-black/55 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="relative h-[340px] sm:h-[380px] overflow-hidden rounded-[28px] bg-secondary">
      <img src={p.thumbnailUrl} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0)_38%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.5)_100%)]" />

      <div className="absolute left-6 top-5 right-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.6rem,3.4vw,2.6rem)] font-medium leading-tight text-white tracking-tight line-clamp-2">{p.title}</h1>
          <p className="mt-1 text-[13px] text-white/80">
            {p.address}, {p.district}, {p.city}
          </p>
        </div>
        {/* Trạng thái duyệt — tách riêng khỏi trạng thái BĐS */}
        {p.approvalStatus && (
          <span className={cn("shrink-0 mt-2 px-3 py-1 rounded-full text-[12px] font-semibold shadow-sm", APPROVAL_PILL[p.approvalStatus])}>
            {APPROVAL_LABEL[p.approvalStatus]}
          </span>
        )}
      </div>

      {p.approvalStatus === "REJECTED" && p.rejectReason && (
        <p className="absolute left-6 right-24 top-[42%] rounded-xl bg-black/45 backdrop-blur-md px-3 py-2 text-[12.5px] text-white">
          Lý do từ chối: {p.rejectReason}
        </p>
      )}

      <div className="absolute left-5 bottom-5 flex items-center gap-3 rounded-2xl bg-black/35 backdrop-blur-md px-3 py-2.5 text-white">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1.5">
            <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-semibold", STATUS_PILL[p.beStatus])}>{STATUS_LABEL[p.beStatus]}</span>
          </div>
          <p className="text-[15px] font-semibold tabular-nums">
            {formatShortVnd(p.priceVnd ?? 0)} <span className="text-[12px] font-normal text-white/75">/ tháng · {p.propertyTypeLabel}</span>
          </p>
        </div>
      </div>

      <div className="absolute right-5 bottom-5 flex flex-col gap-2">
        <button type="button" title="Sửa tin" onClick={() => openEditListing(p)} className={btn}>
          <Pencil className="w-[18px] h-[18px]" />
        </button>
        {p.approvalStatus === "APPROVED" && (
          <Link href={`/properties/${p.id}`} title="Xem tin công khai" className={btn}>
            <Eye className="w-[18px] h-[18px]" />
          </Link>
        )}
        {(canHide || canUnhide) && (
          <button type="button" disabled={busy} title={canHide ? "Ẩn tin" : "Hiện lại tin"} onClick={() => action.mutate({ id: p.id, action: canHide ? "hide" : "unhide" })} className={btn}>
            {busy ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : canHide ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
        <button
          type="button"
          disabled={busy || !canDelete}
          title={canDelete ? "Xóa tin" : "Không xóa được khi đang có đơn đặt cọc"}
          onClick={() => window.confirm(`Xóa tin “${p.title}”?`) && action.mutate({ id: p.id, action: "delete" })}
          className={btn}
        >
          <Trash2 className="w-[18px] h-[18px]" />
        </button>
      </div>
      {action.isError && (
        <p className="absolute left-5 right-5 top-[45%] rounded-xl bg-[#86402F]/90 px-3 py-2 text-[12.5px] text-white">{getErrorMessage(action.error)}</p>
      )}
    </div>
  );
};

// ─── Trang ─────────────────────────────────────────────────────────────────
const LIST_PAGE_SIZE = 6;

export const LandlordRoomsPage = () => {
  const { data, isLoading, isError, error, refetch } = useMyListings();
  const items = useMemo(() => data ?? [], [data]);
  const { openPostListing } = usePostListing();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<CategoryKey>("all");
  const [tab, setTab] = useState<Tab>("analytics");
  const [collapsed, setCollapsed] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  // null = tự chọn trang chứa sản phẩm đang mở (vd. vào từ ?id=)
  const [page, setPage] = useState<number | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");

  const matchCat = CATEGORIES.find((c) => c.key === category)!.match;
  const list = items.filter((p) => matchCat(p) && (!q.trim() || `${p.title} ${p.address} ${p.district}`.toLowerCase().includes(q.trim().toLowerCase())));
  const selectedId = params.get("id");
  const selected = items.find((p) => p.id === selectedId) ?? list[0] ?? items[0];
  const analytics = selected ? getListingAnalytics(selected.id, period) : null;

  const totalPages = Math.max(1, Math.ceil(list.length / LIST_PAGE_SIZE));
  const selectedIndex = selected ? list.findIndex((p) => p.id === selected.id) : -1;
  const currentPage = Math.min(page ?? (selectedIndex >= 0 ? Math.floor(selectedIndex / LIST_PAGE_SIZE) + 1 : 1), totalPages);
  const pageItems = list.slice((currentPage - 1) * LIST_PAGE_SIZE, currentPage * LIST_PAGE_SIZE);


  const select = (id: string) => {
    // Bấm lại sản phẩm đang mở → thu gọn / mở lại menu con
    if (id === selected?.id) {
      setCollapsed((c) => !c);
      return;
    }
    setCollapsed(false);
    setTab("analytics");
    router.replace(`${pathname}?id=${id}`, { scroll: false });
  };
  const activeCategory = CATEGORIES.find((c) => c.key === category)!;
  const changeFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <div className="h-[760px] rounded-[24px] bg-secondary animate-pulse" />
        <div className="space-y-4">
          <div className="h-[380px] rounded-[28px] bg-secondary animate-pulse" />
          <div className="h-28 rounded-[24px] bg-secondary animate-pulse" />
          <div className="h-64 rounded-[24px] bg-secondary animate-pulse" />
        </div>
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
    // Hai cột tách riêng, đặt thẳng trên nền trang
    <div>
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        {/* ── Cột trái ── */}
        <aside className="flex flex-col gap-4 min-h-0 lg:sticky lg:top-[104px] lg:self-start lg:h-[calc(100dvh-124px)]">
          {/* Tổng quan + tìm kiếm + đăng tin */}
          <div className={cn(panel, "p-5")}>
            <div className="flex items-end justify-between gap-3">
              <h1 className="text-[24px] font-medium tracking-tight leading-none">Sản phẩm</h1>
              <p className="text-[13px] text-muted-foreground">
                <span className="text-[30px] leading-none text-foreground tabular-nums mr-1">{items.length}</span>
                tổng
              </p>
            </div>
            <label className="mt-4 flex items-center gap-2 h-11 px-4 rounded-xl bg-background">
              <input
                value={q}
                onChange={(e) => changeFilter(() => setQ(e.target.value))}
                placeholder="Tìm sản phẩm"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
              />
              <Search className="w-4 h-4 text-muted-foreground" />
            </label>
            <button
              type="button"
              onClick={openPostListing}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Đăng tin mới
            </button>
          </div>

          {/* Danh sách: phân loại + sản phẩm + phân trang */}
          <div className={cn(panel, "flex-1 flex flex-col min-h-0 p-3")}>
            <div className="flex items-center justify-between gap-2 px-2 pt-1">
              <p className="text-[15px] font-semibold">
                Danh sách <span className="ml-1 text-[12px] font-normal text-muted-foreground tabular-nums">{list.length}</span>
              </p>

              {/* Phân loại: nút bấm mở bảng lọc (giống nút "Bộ lọc" bên người dùng) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCatOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-9 rounded-full text-[12px] font-medium transition-colors cursor-pointer",
                    category === "all" ? "bg-background hover:bg-secondary" : "bg-primary text-primary-foreground",
                  )}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {category === "all" ? "Phân loại" : activeCategory.label}
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", catOpen && "rotate-180")} />
                </button>
                {catOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setCatOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-30 w-56 rounded-2xl border border-border bg-popover p-1.5 shadow-xl">
                      {CATEGORIES.map((c) => {
                        const n = items.filter(c.match).length;
                        const active = category === c.key;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => {
                              changeFilter(() => setCategory(c.key));
                              setCatOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12.5px] text-left cursor-pointer",
                              active ? "bg-secondary font-semibold" : "hover:bg-secondary",
                            )}
                          >
                            {c.label}
                            <span className="ml-auto tabular-nums text-muted-foreground">{n}</span>
                            {active && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <ul className="mt-2 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1 [scrollbar-width:thin] [scrollbar-gutter:stable]">
              {pageItems.length === 0 ? (
                <li className="px-2 py-10 text-center text-[12.5px] text-muted-foreground">Không có sản phẩm.</li>
              ) : (
                pageItems.map((p) => {
                  const open = selected?.id === p.id;
                  const expanded = open && !collapsed;
                  return (
                    <li key={p.id} className={cn("rounded-2xl transition-colors", open ? "bg-background" : "hover:bg-background/60")}>
                      <button type="button" onClick={() => select(p.id)} className="w-full flex items-center gap-3 p-2 text-left cursor-pointer">
                        <img src={p.thumbnailUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-secondary shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[13px] font-medium truncate">{p.title}</span>
                            {/* Trạng thái duyệt — nhãn riêng, chỉ hiện khi chưa được duyệt */}
                            {p.approvalStatus && p.approvalStatus !== "APPROVED" && (
                              <span className={cn("shrink-0 px-1.5 py-px rounded-full text-[9.5px] font-semibold", APPROVAL_PILL[p.approvalStatus])}>
                                {APPROVAL_LABEL[p.approvalStatus]}
                              </span>
                            )}
                          </span>
                          <span className="block text-[11px] text-muted-foreground truncate">
                            {p.address}, {p.district}
                          </span>
                          {/* Trạng thái BĐS */}
                          <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                            <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[p.beStatus])} />
                            {STATUS_LABEL[p.beStatus]}
                            <span className="ml-auto tabular-nums text-foreground/80">{formatShortVnd(p.priceVnd)}</span>
                          </span>
                        </span>
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", expanded && "rotate-180")} />
                      </button>
                      {expanded && (
                        <div className="pl-[68px] pr-2 pb-2 space-y-0.5">
                          {TABS.map((t) => (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => setTab(t.key)}
                              className={cn(
                                "w-full flex items-center gap-2.5 py-1.5 text-[12.5px] text-left cursor-pointer",
                                tab === t.key ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              <t.icon className="w-3.5 h-3.5" /> {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Phân trang — luôn ở đáy thẻ */}
            <div className="mt-2 flex items-center justify-between border-t border-border/70 px-2 pt-2.5 text-[12px] text-muted-foreground">
              <span className="tabular-nums">
                Trang {currentPage}/{totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={cn("w-8 h-8 rounded-full tabular-nums cursor-pointer", n === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-background text-foreground")}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Cột phải ── */}
        <section className="flex flex-col gap-3 min-w-0">
          {!selected ? (
            <div className={cn(panel, "flex-1 grid place-items-center py-24 text-center")}>
              <div>
                <p className="text-[15px] font-semibold">Bạn chưa có sản phẩm nào</p>
                <button
                  type="button"
                  onClick={openPostListing}
                  className="mt-4 mx-auto flex items-center gap-1.5 px-5 h-10 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Đăng tin đầu tiên
                </button>
              </div>
            </div>
          ) : (
            <>
              <Hero p={selected} />
              {tab === "analytics" && (
                <>
                  <StatsRow data={analytics!} period={period} onPeriod={setPeriod} />
                  <ClicksPanel data={analytics!} period={period} className="flex-1" />
                </>
              )}
              {tab !== "analytics" && (
                <div className="flex-1 flex flex-col [&>*]:flex-1">
                  {tab === "info" && <InfoPanel p={selected} />}
                  {tab === "images" && <ImagesPanel p={selected} />}
                  {tab === "viewings" && <PendingBePanel title="Lịch xem nhà" service="rental (lịch xem)" />}
                  {tab === "deposits" && <PendingBePanel title="Đơn đặt cọc" service="rental (đặt cọc)" />}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
