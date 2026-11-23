import type { BeApprovalStatus, BeListingStatus, ManagedProperty } from "@/features/listings/api/listings.api";

/**
 * Số liệu dashboard chủ trọ — tính hoàn toàn từ GET /listings/mine (service listing của BE).
 * Phân loại đúng theo trạng thái BE:
 *   status         AVAILABLE · HELD · DEPOSITED · RENTED · HIDDEN
 *   approvalStatus PENDING_REVIEW · APPROVED · REJECTED
 * Tiền đã rút thuộc service payment (BE chưa có) → không tính ở đây.
 */

export const STATUS_ORDER: BeListingStatus[] = ["AVAILABLE", "HELD", "DEPOSITED", "RENTED", "HIDDEN"];
export const APPROVAL_ORDER: BeApprovalStatus[] = ["PENDING_REVIEW", "APPROVED", "REJECTED"];

export const STATUS_LABEL: Record<BeListingStatus, string> = {
  AVAILABLE: "Còn trống",
  HELD: "Đang giữ chỗ",
  DEPOSITED: "Đã đặt cọc",
  RENTED: "Đã cho thuê",
  HIDDEN: "Đang ẩn",
};

export const APPROVAL_LABEL: Record<BeApprovalStatus, string> = {
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

/**
 * Màu pill trạng thái — tông trầm, hài hòa với nền be của web (không dùng màu sáng chói):
 * xanh xám nhạt · cát · nâu nhạt · đen · xám ấm.
 */
export const STATUS_PILL: Record<BeListingStatus, string> = {
  AVAILABLE: "bg-[#E2EADD] text-[#3E5638] dark:bg-[#263022] dark:text-[#B7CCAD]",
  HELD: "bg-[#F0E5CE] text-[#765A22] dark:bg-[#352C1A] dark:text-[#DCC28E]",
  DEPOSITED: "bg-[#E6DFD4] text-[#5A4D3C] dark:bg-[#302A22] dark:text-[#CDBFAB]",
  RENTED: "bg-[#121212] text-[#F9F8F6] dark:bg-[#F9F8F6] dark:text-[#121212]",
  HIDDEN: "bg-[#EFECE6] text-[#8A847A] dark:bg-[#262626] dark:text-[#A3A3A3]",
};

export const APPROVAL_PILL: Record<BeApprovalStatus, string> = {
  PENDING_REVIEW: "bg-[#E4E6E8] text-[#4B545E] dark:bg-[#24282C] dark:text-[#B4BCC4]",
  APPROVED: "bg-[#E2EADD] text-[#3E5638] dark:bg-[#263022] dark:text-[#B7CCAD]",
  REJECTED: "bg-[#F1DDD5] text-[#86402F] dark:bg-[#38221C] dark:text-[#E3AE9F]",
};

/** Màu chấm nhỏ đi kèm nhãn (vd. "• Còn trống") */
export const STATUS_DOT: Record<BeListingStatus, string> = {
  AVAILABLE: "bg-[#6B8A60]",
  HELD: "bg-[#C9A253]",
  DEPOSITED: "bg-[#8C7A62]",
  RENTED: "bg-[#121212] dark:bg-[#F9F8F6]",
  HIDDEN: "bg-[#B5AFA5]",
};

// ─── Tỉnh / thành ───────────────────────────────────────────────────────────
/** Các tỉnh/thành phổ biến hiển thị riêng; còn lại gộp "Khác" */
export const POPULAR_PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"] as const;

export const normalizeProvince = (city: string) => {
  const c = city.trim().toLowerCase();
  if (c.includes("hà nội") || c === "hn") return "Hà Nội";
  if (c.includes("hồ chí minh") || c.includes("hcm") || c.includes("sài gòn")) return "TP. Hồ Chí Minh";
  if (c.includes("đà nẵng")) return "Đà Nẵng";
  if (c.includes("hải phòng")) return "Hải Phòng";
  return "Khác";
};

/** Đã có người cọc / đang ở: giữ chỗ, đã cọc, đã cho thuê */
export const isTaken = (s: BeListingStatus) => s === "HELD" || s === "DEPOSITED" || s === "RENTED";

const WEEK = 7 * 24 * 3600 * 1000;

export const computeLandlordStats = (items: ManagedProperty[]) => {
  const byStatus = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<BeListingStatus, number>;
  const byApproval = Object.fromEntries(APPROVAL_ORDER.map((s) => [s, 0])) as Record<BeApprovalStatus, number>;
  const byDistrict = new Map<string, number>();

  const byProvince = new Map<string, number>();

  let depositReceivedVnd = 0; // DEPOSITED + RENTED: tiền đã vào ví trung gian / đã giải ngân
  let depositPendingVnd = 0; // HELD: đang giữ chỗ, chờ người thuê thanh toán
  let monthlyRentVnd = 0; // RENTED: tiền thuê hằng tháng đang thu
  let listedRentVnd = 0; // Tổng giá thuê niêm yết của tin đã duyệt, không ẩn

  for (const p of items) {
    byStatus[p.beStatus]++;
    if (p.approvalStatus) byApproval[p.approvalStatus]++;
    byDistrict.set(p.district, (byDistrict.get(p.district) ?? 0) + 1);
    const prov = normalizeProvince(p.city);
    byProvince.set(prov, (byProvince.get(prov) ?? 0) + 1);
    const deposit = p.depositAmountVnd ?? 0;
    if (p.beStatus === "DEPOSITED" || p.beStatus === "RENTED") depositReceivedVnd += deposit;
    if (p.beStatus === "HELD") depositPendingVnd += deposit;
    if (p.beStatus === "RENTED") monthlyRentVnd += p.priceVnd ?? 0;
    if (p.approvalStatus === "APPROVED" && p.beStatus !== "HIDDEN") listedRentVnd += p.priceVnd ?? 0;
  }

  // Lũy kế theo tuần (16 tuần, cũ → mới): số sản phẩm đã đăng / đã có người cọc tính tới cuối tuần đó
  const now = Date.now();
  const weekly = Array.from({ length: 16 }, (_, i) => {
    const end = now - (15 - i) * WEEK;
    const upTo = items.filter((p) => Date.parse(p.postedAt) <= end);
    return {
      week: i === 15 ? "Tuần này" : `${15 - i} tuần trước`,
      created: upTo.length,
      taken: upTo.filter((p) => isTaken(p.beStatus)).length,
    };
  });

  return {
    total: items.length,
    taken: byStatus.HELD + byStatus.DEPOSITED + byStatus.RENTED,
    byStatus,
    byApproval,
    byDistrict: [...byDistrict.entries()].map(([district, count]) => ({ district, count })).sort((a, b) => b.count - a.count),
    byProvince: [...POPULAR_PROVINCES, "Khác"].map((province) => ({ province, count: byProvince.get(province) ?? 0 })),
    depositReceivedVnd,
    depositPendingVnd,
    monthlyRentVnd,
    listedRentVnd,
    weekly,
  };
};

export type LandlordStats = ReturnType<typeof computeLandlordStats>;

export const formatVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;
export const formatShortVnd = (n: number) =>
  n >= 1_000_000_000
    ? `${(n / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`
    : `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr`;
