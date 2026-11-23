"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ArrowUpRight,
  Maximize2,
  MapPin,
  Search,
  SlidersHorizontal,
  Plus,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Settings2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Banknote,
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CustomSelect } from "@/components/ui/select";
import {
  useListingAction,
  useMyListings,
  type BeApprovalStatus,
  type BeListingStatus,
  type ManagedProperty,
} from "@/features/listings/api/listings.api";
import {
  APPROVAL_LABEL,
  APPROVAL_ORDER,
  APPROVAL_PILL,
  STATUS_DOT,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_PILL,
  computeLandlordStats,
  formatShortVnd,
  formatVnd,

  type LandlordStats,
} from "@/features/landlord/lib/landlordStats";
import { getErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { usePostListing } from "@/features/landlord/context/PostListingContext";

// Ảnh nhà đã tách nền (PNG trong suốt) — nguồn pngimg.com (CC BY-NC 4.0)
const HERO_IMAGE = "/images/landlord-hero-house.png";
const PAGE_SIZE = 7;

const panel = "rounded-[28px] bg-card p-5";
const STRIPES = "bg-[repeating-linear-gradient(135deg,var(--accent)_0_2px,transparent_2px_7px)]";

const CornerLink = ({ href, label, icon: Icon = ArrowUpRight }: { href: string; label: string; icon?: typeof ArrowUpRight }) => (
  <Link
    href={href}
    title={label}
    aria-label={label}
    className="w-10 h-10 shrink-0 rounded-full bg-background hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
  >
    <Icon className="w-4 h-4" />
  </Link>
);

const Money = ({ value, className }: { value: number; className?: string }) => (
  <span className={cn("tabular-nums", className)}>
    <span className="text-muted-foreground font-light mr-1.5">₫</span>
    {value.toLocaleString("vi-VN")}
  </span>
);

// ─── Hàng 1: hai chỉ số, mỗi cột một thanh riêng ─────────────────────────────
/** Một đoạn của thanh tỷ lệ, rê chuột hiện tooltip */
const BarSegment = ({ width, className, title, value }: { width: number; className: string; title: string; value: number }) => (
  <div className={cn("group relative h-full rounded-full", className)} style={{ width: `${width}%` }}>
    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-border bg-popover px-3 py-2 text-[12px] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
      <p className="text-muted-foreground">{title}</p>
      <p className="font-semibold tabular-nums text-foreground">{formatVnd(value)}</p>
    </div>
  </div>
);

const MoneyHeadline = ({ s }: { s: LandlordStats }) => {
  const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
  const depositWhole = s.depositReceivedVnd + s.depositPendingVnd;
  const rentRemaining = Math.max(0, s.listedRentVnd - s.monthlyRentVnd);

  const cols = [
    {
      label: "Tiền cọc đã nhận",
      value: s.depositReceivedVnd,
      note: `Tin đã cọc + đã cho thuê`,
      solid: { title: "Đã nhận (đã cọc + đã cho thuê)", value: s.depositReceivedVnd, cls: "bg-[var(--chart-1)]", legend: "Đã nhận" },
      rest: { title: "Chờ người thuê thanh toán (đang giữ chỗ)", value: s.depositPendingVnd, legend: "Chờ thanh toán" },
      whole: depositWhole,
    },
    {
      label: "Tiền thuê hằng tháng",
      value: s.monthlyRentVnd,
      note: `Trên ${formatShortVnd(s.listedRentVnd)} giá thuê niêm yết`,
      solid: { title: "Đang thu (phòng đã cho thuê)", value: s.monthlyRentVnd, cls: "bg-[var(--chart-2)]", legend: "Đang cho thuê" },
      rest: { title: "Chưa có người thuê (giá niêm yết còn lại)", value: rentRemaining, legend: "Chưa có người thuê" },
      whole: s.listedRentVnd,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 pt-8">
      {cols.map((c) => {
        const solid = pct(c.solid.value, c.whole);
        return (
          <div key={c.label} className="flex flex-col">
            <div className="border-l border-foreground/25 pl-3 pb-4">
              <p className="text-[13px] text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-[clamp(1.5rem,2.5vw,2.05rem)] font-normal tracking-tight">
                <Money value={c.value} />
              </p>
              <p className="text-[11.5px] text-muted-foreground">{c.note}</p>
            </div>
            {/* Đặc = phần đã có · gạch chéo = phần còn lại; rê chuột để xem số tiền */}
            <div className="flex h-6 w-full gap-1">
              {solid > 0 && <BarSegment width={solid} className={c.solid.cls} title={c.solid.title} value={c.solid.value} />}
              <BarSegment width={c.whole > 0 ? 100 - solid : 100} className={STRIPES} title={c.rest.title} value={c.rest.value} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full", c.solid.cls)} /> {c.solid.legend}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full border border-border", STRIPES)} /> {c.rest.legend}: {formatShortVnd(c.rest.value)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Thẻ chỉ số + cột "mã vạch" (lũy kế theo tuần) ──────────────────────────
const StatCard = ({
  title,
  value,
  caption,
  dataKey,
  weekly,
  href,
}: {
  title: string;
  value: number;
  caption: string;
  dataKey: "created" | "taken";
  weekly: LandlordStats["weekly"];
  href: string;
}) => {
  const config = { [dataKey]: { label: title, color: "var(--chart-1)" } } satisfies ChartConfig;
  return (
    <div className={cn(panel, "flex flex-col min-h-[172px]")}>
      <div className="flex items-start justify-between">
        <p className="text-[16px]">{title}</p>
        <CornerLink href={href} label={`Xem ${title.toLowerCase()}`} />
      </div>
      <div className="mt-auto flex items-end justify-between gap-3">
        <div>
          <p className="text-[32px] leading-none tracking-tight tabular-nums">{value}</p>
          <p className="mt-2 text-[12px] text-muted-foreground">{caption}</p>
        </div>
        <ChartContainer config={config} className="aspect-auto h-12 w-[112px]">
          <BarChart data={weekly} barCategoryGap={2} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent valueFormatter={(v) => `${v} sản phẩm`} />} />
            <Bar dataKey={dataKey} radius={1} minPointSize={3}>
              {weekly.map((_, i) => (
                <Cell key={i} fill={i >= weekly.length - 6 ? "var(--chart-1)" : "var(--chart-3)"} fillOpacity={i >= weekly.length - 6 ? 1 : 0.45} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

// ─── Phân loại theo trạng thái BE (kiểu "Average Sale Value") ───────────────
interface BreakdownRow {
  key: string;
  label: string;
  count: number;
  pct: number;
}

/** Thanh nhạt + viên đen ghi % ở cuối, chữ "số · nhãn" nằm trong thanh */
const PillBar = (props: {
  x?: number;
  y?: number;
  height?: number;
  payload?: BreakdownRow & { max: number };
  background?: { width?: number };
}) => {
  const { x = 0, y = 0, height = 0, payload, background } = props;
  if (!payload) return null;
  const pillW = 44;
  // Phần cố định đủ chứa chữ "số · nhãn" + viên %, phần còn lại dài đúng theo tỷ lệ số lượng
  const base = pillW + 108;
  const full = Math.max(background?.width ?? 0, base);
  const w = base + (payload.max ? payload.count / payload.max : 0) * (full - base);
  const r = height / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={height} rx={r} fill="var(--secondary)" />
      <rect x={x + w - pillW} y={y} width={pillW} height={height} rx={r} fill={payload.count ? "var(--chart-1)" : "var(--chart-3)"} />
      <text x={x + 12} y={y + r} dy="0.35em" fontSize={11} fill="var(--muted-foreground)">
        {payload.count} · {payload.label}
      </text>
      <text x={x + w - pillW / 2} y={y + r} dy="0.35em" fontSize={11} fontWeight={600} textAnchor="middle" fill="var(--primary-foreground)">
        {payload.pct}%
      </text>
    </g>
  );
};

const StatusBreakdown = ({ s }: { s: LandlordStats }) => {
  const [mode, setMode] = useState<"status" | "approval">("status");
  const rows: BreakdownRow[] = (
    mode === "status"
      ? STATUS_ORDER.map((k: BeListingStatus) => ({ key: k, label: STATUS_LABEL[k], count: s.byStatus[k] }))
      : APPROVAL_ORDER.map((k: BeApprovalStatus) => ({ key: k, label: APPROVAL_LABEL[k], count: s.byApproval[k] }))
  ).map((r) => ({ ...r, pct: s.total ? Math.round((r.count / s.total) * 100) : 0 }));
  const max = Math.max(1, ...rows.map((r) => r.count));
  const data = rows.map((r) => ({ ...r, max }));
  const takenPct = s.total ? Math.round((s.taken / s.total) * 100) : 0;
  const config = { count: { label: "Sản phẩm", color: "var(--chart-1)" } } satisfies ChartConfig;

  return (
    <div className={cn(panel, "flex flex-col h-full")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px]">Phân loại sản phẩm</p>
        <CustomSelect
          placement="auto"
          className="w-[150px]"
          value={mode}
          onChange={(v) => setMode(v as "status" | "approval")}
          options={[
            { value: "status", label: "Trạng thái BĐS" },
            { value: "approval", label: "Trạng thái duyệt" },
          ]}
        />
      </div>
      <p className="mt-6 text-[32px] leading-none tracking-tight tabular-nums">
        {mode === "status" ? `${takenPct}%` : `${s.byApproval.APPROVED}/${s.total}`}
      </p>
      <p className="mt-2 text-[12px] text-muted-foreground">
        {mode === "status" ? "đã có người giữ chỗ / cọc / thuê" : "sản phẩm đã được duyệt"}
      </p>

      <ChartContainer config={config} className="mt-5 aspect-auto w-full" style={{ height: rows.length * 38 + 26 }}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }} barCategoryGap={9}>
          <XAxis type="number" domain={[0, max]} hide />
          <YAxis type="category" dataKey="label" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel valueFormatter={(v) => `${v} sản phẩm`} />} />
          <Bar
            dataKey="count"
            name="Sản phẩm"
            shape={<PillBar />}
            background={{ fill: "transparent" }}
            minPointSize={1}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

// ─── Sản phẩm của tôi (giống "Property Object") ─────────────────────────────
const ShowcaseCard = ({ p }: { p: ManagedProperty }) => {
  const realImages = p.images.filter((u) => !u.includes("listing-placeholder")).length;
  return (
    <div className="rounded-[22px] bg-card p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-border/60 flex flex-col">
      <div className="relative aspect-[4/3.6] overflow-hidden rounded-[18px] bg-secondary">
        <img src={p.thumbnailUrl} alt={p.title} className="h-full w-full object-cover" />
        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          {p.approvalStatus === "APPROVED" && p.beStatus !== "HIDDEN" && (
            <Link href={`/properties/${p.id}`} title="Xem tin công khai" className="w-8 h-8 rounded-full bg-white text-[#121212] flex items-center justify-center shadow-sm">
              <Eye className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link href={`/landlord/rooms?id=${p.id}`} title="Quản lý sản phẩm" className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-sm">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      <div className="px-2 pt-2.5 pb-2 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[p.beStatus])} /> {STATUS_LABEL[p.beStatus]}
          </span>
          {p.approvalStatus && p.approvalStatus !== "APPROVED" && (
            <span className={cn("px-1.5 py-px rounded-full text-[10px] font-medium", APPROVAL_PILL[p.approvalStatus])}>{APPROVAL_LABEL[p.approvalStatus]}</span>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium truncate">{p.title}</p>
            <p className="text-[10.5px] text-muted-foreground truncate">
              {p.address}, {p.district}
            </p>
          </div>
          <p className="text-[13px] tabular-nums whitespace-nowrap">
            <span className="text-muted-foreground font-light">₫</span>
            {formatShortVnd(p.priceVnd)}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-1 pt-0.5">
          {[`${p.area} m²`, p.propertyTypeLabel, `Cọc ${formatShortVnd(p.depositAmountVnd)}`, `${realImages} ảnh`].map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full border border-border text-[9.5px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductShowcase = ({ items }: { items: ManagedProperty[] }) => {
  const latest = items.slice(0, 3);
  const { openPostListing } = usePostListing();
  return (
    <div className={cn(panel, "flex flex-col h-full")}>
      <div className="flex items-center justify-between">
        <p className="text-[16px]">Sản phẩm của tôi</p>
        <CornerLink href="/landlord/rooms" label="Mở trang quản lý sản phẩm" icon={Maximize2} />
      </div>
      {latest.length === 0 ? (
        <div className="flex-1 grid place-items-center py-10 text-center text-[13px] text-muted-foreground">
          <div>
            Chưa có sản phẩm nào.
            <button type="button" onClick={openPostListing} className="mt-3 mx-auto flex w-fit items-center gap-1.5 px-4 h-9 rounded-full bg-primary text-primary-foreground text-[12.5px] font-semibold cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Đăng tin đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {latest.map((p) => (
            <ShowcaseCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Bảng sản phẩm: lọc, phân trang 7 dòng, thao tác trên từng dòng ─────────
const PRICE_RANGES = [
  { value: "", label: "Giá thuê" },
  { value: "0-3000000", label: "Dưới 3 triệu" },
  { value: "3000000-5000000", label: "3 – 5 triệu" },
  { value: "5000000-10000000", label: "5 – 10 triệu" },
  { value: "10000000-999999999999", label: "Trên 10 triệu" },
];

/** Menu thao tác của một dòng; định vị `fixed` theo nút để không bị khung bảng cắt */
const RowActions = ({ p }: { p: ManagedProperty }) => {
  const action = useListingAction();
  const { openEditListing } = usePostListing();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number; up: boolean } | null>(null);

  const canHide = p.beStatus === "AVAILABLE";
  const canUnhide = p.beStatus === "HIDDEN";
  const canDelete = p.beStatus !== "HELD" && p.beStatus !== "DEPOSITED";
  const canView = p.approvalStatus === "APPROVED" && p.beStatus !== "HIDDEN";

  const open = () => {
    const r = btnRef.current!.getBoundingClientRect();
    const up = window.innerHeight - r.bottom < 220;
    setPos({ top: up ? r.top - 8 : r.bottom + 8, right: window.innerWidth - r.right, up });
  };
  const close = () => setPos(null);
  const run = (a: "hide" | "unhide" | "delete") => {
    if (a === "delete" && !window.confirm(`Xóa tin “${p.title}”?`)) return;
    action.mutate({ id: p.id, action: a }, { onSettled: close });
  };

  const item = "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] text-left hover:bg-secondary no-underline text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (pos ? close() : open())}
        title="Thao tác"
        className="w-9 h-9 rounded-full bg-background hover:bg-secondary flex items-center justify-center text-foreground cursor-pointer"
      >
        {action.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SlidersHorizontal className="w-4 h-4" />}
      </button>
      {pos && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            className="fixed z-50 w-52 rounded-2xl border border-border bg-popover p-1.5 shadow-xl"
            style={{ right: pos.right, ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }) }}
          >
            <button type="button" className={item} onClick={() => { close(); openEditListing(p); }}>
              <Pencil className="w-4 h-4" /> Sửa tin
            </button>
            <Link href={`/landlord/rooms?id=${p.id}`} className={item} onClick={close}>
              <Settings2 className="w-4 h-4" /> Quản lý chi tiết
            </Link>
            {canView && (
              <Link href={`/properties/${p.id}`} className={item} onClick={close}>
                <Eye className="w-4 h-4" /> Xem tin công khai
              </Link>
            )}
            {(canHide || canUnhide) && (
              <button type="button" className={item} onClick={() => run(canHide ? "hide" : "unhide")}>
                {canHide ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {canHide ? "Ẩn tin" : "Hiện lại tin"}
              </button>
            )}
            <button type="button" className={cn(item, "text-[#86402F] dark:text-[#E3AE9F]")} disabled={!canDelete} onClick={() => run("delete")} title={canDelete ? undefined : "Đang có đơn đặt cọc"}>
              <Trash2 className="w-4 h-4" /> Xóa tin
            </button>
            {action.isError && <p className="px-3 py-1.5 text-[11.5px] text-[#86402F]">{getErrorMessage(action.error)}</p>}
          </div>
        </>
      )}
    </>
  );
};

const ProductTable = ({ items }: { items: ManagedProperty[] }) => {
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const districts = [...new Set(items.map((p) => p.district))];
  const types = [...new Set(items.map((p) => p.propertyTypeLabel))];

  const rows = items.filter((p) => {
    if (district && p.district !== district) return false;
    if (type && p.propertyTypeLabel !== type) return false;
    if (status && p.beStatus !== status && p.approvalStatus !== status) return false;
    if (price) {
      const [min, max] = price.split("-").map(Number);
      if (p.priceVnd < min || p.priceVnd >= max) return false;
    }
    if (q.trim() && !`${p.title} ${p.address} ${p.district}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = rows.length ? (current - 1) * PAGE_SIZE + 1 : 0;

  // Đổi bộ lọc → về trang 1
  const withReset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <div className={cn(panel, "p-0 h-full flex flex-col")}>
      <div className="flex flex-wrap items-center gap-2 p-4">
        <CustomSelect placement="auto" className="w-40" value={district} onChange={withReset(setDistrict)} options={[{ value: "", label: "Tất cả quận" }, ...districts.map((d) => ({ value: d, label: d }))]} />
        <CustomSelect placement="auto" className="w-40" value={type} onChange={withReset(setType)} options={[{ value: "", label: "Tất cả loại" }, ...types.map((t) => ({ value: t, label: t }))]} />
        <CustomSelect
          placement="auto"
          className="w-44"
          value={status}
          onChange={withReset(setStatus)}
          options={[
            { value: "", label: "Tất cả trạng thái" },
            ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
            ...APPROVAL_ORDER.filter((a) => a !== "APPROVED").map((a) => ({ value: a, label: APPROVAL_LABEL[a] })),
          ]}
        />
        <CustomSelect placement="auto" className="w-40" value={price} onChange={withReset(setPrice)} options={PRICE_RANGES} />
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 h-10 px-3.5 rounded-full bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => withReset(setQ)(e.target.value)} placeholder="Tìm kiếm" className="w-32 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
          </label>
          <CornerLink href="/landlord/rooms" label="Mở trang quản lý sản phẩm" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-[13px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              {["Sản phẩm", "Loại", "Duyệt", "Giá thuê", "Tiền cọc", "Trạng thái", "Thao tác"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Không có sản phẩm phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              pageRows.map((p) => (
                <tr key={p.id} className="border-t border-border/70">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnailUrl} alt="" className="w-14 h-11 rounded-xl object-cover bg-secondary" />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[250px]">{p.title}</p>
                        <p className="text-[11.5px] text-muted-foreground truncate max-w-[250px]">
                          {p.address}, {p.district}, {p.city}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">{p.propertyTypeLabel}</td>
                  <td className="px-4 py-2.5">
                    {p.approvalStatus && (
                      <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap", APPROVAL_PILL[p.approvalStatus])}>
                        {APPROVAL_LABEL[p.approvalStatus]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Money value={p.priceVnd} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Money value={p.depositAmountVnd} />
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap", STATUS_PILL[p.beStatus])}>
                      {STATUS_LABEL[p.beStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions p={p} />
                  </td>
                </tr>
              ))
            )}
            {/* Trang thiếu dòng (vd. trang cuối) → chèn dòng trống để bảng luôn cao đủ 7 dòng */}
            {totalPages > 1 &&
              pageRows.length > 0 &&
              Array.from({ length: PAGE_SIZE - pageRows.length }, (_, i) => (
                <tr key={`empty-${i}`} aria-hidden className="border-t border-transparent">
                  <td colSpan={7} className="h-[66px]" />
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang — luôn nằm sát đáy khung */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 text-[12.5px] text-muted-foreground">
        <span className="tabular-nums">
          {from}–{Math.min(current * PAGE_SIZE, rows.length)} / {rows.length} sản phẩm
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current === 1}
            aria-label="Trang trước"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={cn(
                "w-8 h-8 rounded-full tabular-nums cursor-pointer",
                n === current ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground",
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current === totalPages}
            aria-label="Trang sau"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Phân bố theo tỉnh / thành (thay bản đồ) ────────────────────────────────
const PROVINCE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-5)", "var(--chart-3)", "var(--chart-4)"];

const ProvinceChart = ({ s }: { s: LandlordStats }) => {
  const data = s.byProvince.map((d, i) => ({ ...d, fill: PROVINCE_COLORS[i % PROVINCE_COLORS.length] }));
  const config = Object.fromEntries(data.map((d) => [d.province, { label: d.province, color: d.fill }])) as ChartConfig;
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className={cn(panel, "flex flex-col flex-1")}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[16px]">
          <MapPin className="w-4 h-4 text-muted-foreground" /> Theo tỉnh / thành
        </p>
        <CornerLink href="/landlord/rooms" label="Xem sản phẩm" icon={Maximize2} />
      </div>
      {!hasData ? (
        <p className="py-10 text-center text-[13px] text-muted-foreground">Chưa có dữ liệu</p>
      ) : (
        <>
          <div className="relative mt-2">
            <ChartContainer config={config} className="aspect-square h-[170px] mx-auto">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="province" valueFormatter={(v) => `${v} sản phẩm`} />} />
                <Pie data={data.filter((d) => d.count > 0)} dataKey="count" nameKey="province" innerRadius={54} outerRadius={78} paddingAngle={3} cornerRadius={8} stroke="none">
                  {data
                    .filter((d) => d.count > 0)
                    .map((d) => (
                      <Cell key={d.province} fill={d.fill} />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-[24px] leading-none tabular-nums">{s.total}</p>
                <p className="text-[11px] text-muted-foreground">sản phẩm</p>
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {data.map((d) => (
              <li key={d.province} className={cn("flex items-center gap-2 text-[12.5px]", d.count === 0 && "text-muted-foreground")}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="truncate">{d.province}</span>
                <span className="ml-auto tabular-nums">{d.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

// ─── Trang ─────────────────────────────────────────────────────────────────
export const LandlordOverviewPage = () => {
  const { data, isLoading, isError, error, refetch } = useMyListings();
  const items = useMemo(() => data ?? [], [data]);
  const s = useMemo(() => computeLandlordStats(items), [items]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-12 gap-4">
        {[7, 5, 3, 3, 6, 9, 3].map((span, i) => (
          <div key={i} className="h-56 rounded-[28px] bg-secondary animate-pulse" style={{ gridColumn: `span ${span} / span ${span}` }} />
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
    <div className="space-y-4">
      {/* Hàng 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-7">
          <MoneyHeadline s={s} />
        </div>
        <div className="hidden lg:flex lg:col-span-5 items-end justify-center h-[250px]">
          <img src={HERO_IMAGE} alt="" className="max-h-full w-auto object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.12)] select-none pointer-events-none" />
        </div>
      </section>

      {/* Hàng 2 */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-3 grid gap-4">
          <StatCard title="Tổng sản phẩm" value={s.total} caption="Đã đăng · lũy kế 16 tuần" dataKey="created" weekly={s.weekly} href="/landlord/rooms" />
          <StatCard title="Đã được cọc" value={s.taken} caption="Giữ chỗ + đã cọc + đã thuê" dataKey="taken" weekly={s.weekly} href="/landlord/rooms" />
        </div>
        <div className="xl:col-span-3">
          <StatusBreakdown s={s} />
        </div>
        <div className="md:col-span-2 xl:col-span-6">
          <ProductShowcase items={items} />
        </div>
      </section>

      {/* Hàng 3 */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-9 min-w-0">
          <ProductTable items={items} />
        </div>
        <div className="xl:col-span-3 flex flex-col gap-4">
          <ProvinceChart s={s} />
          <div className={cn(panel, "flex items-center gap-3")}>
            <span className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px]">Tiền đã rút</p>
              <p className="text-[11.5px] text-muted-foreground">Chờ dịch vụ thanh toán của BE</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
