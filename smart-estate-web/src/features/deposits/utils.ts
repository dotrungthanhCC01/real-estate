import type { Property } from "@/features/properties/data/mockProperties";

/** BE chỉ đặt cọc cho tin cho thuê còn trống (BR-05) */
export const canDeposit = (p: Property) => p.listingType === "rent";
export const isAvailable = (p: Property) => p.status === "active";

/**
 * Tiền cọc (VND). BE: chủ trọ đặt `depositAmountVnd` cho từng tin (BR-04).
 * Dữ liệu mẫu của web chưa có trường này → tạm tính bằng 1 tháng tiền thuê.
 */
export const getDepositAmountVnd = (p: Property & { depositAmountVnd?: number }) => {
  if (p.depositAmountVnd) return p.depositAmountVnd;
  const unit = p.priceUnit.toLowerCase();
  if (unit.startsWith("triệu")) return Math.round(p.price * 1_000_000);
  if (unit.startsWith("nghìn")) return Math.round(p.price * 1_000);
  return Math.round(p.price);
};

export const formatVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

/** "4,2 triệu" cho nút gọn trên card */
export const formatVndShort = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`
    : `${Math.round(n / 1000).toLocaleString("vi-VN")}k`;
