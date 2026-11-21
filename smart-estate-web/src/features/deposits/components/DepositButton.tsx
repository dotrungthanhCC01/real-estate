"use client";

import { useState } from "react";
import { ShieldCheck, Ban } from "lucide-react";
import type { Property } from "@/features/properties/data/mockProperties";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRequireAuth } from "@/features/auth/context/AuthPromptContext";
import { DepositDialog } from "@/features/deposits/components/DepositDialog";
import { canDeposit, formatVndShort, getDepositAmountVnd, isAvailable } from "@/features/deposits/utils";
import { cn } from "@/lib/utils";

interface DepositButtonProps {
  property: Property;
  /** card: nút gọn trên thẻ BĐS; detail: nút lớn ở trang chi tiết */
  variant?: "card" | "detail";
  className?: string;
}

/**
 * Nút "Đặt cọc" — chỉ hiện với tin cho thuê.
 * Khách → modal mời đăng nhập; chủ trọ/admin → khóa (chỉ người thuê đặt cọc); tin hết trống → khóa.
 */
export const DepositButton = ({ property, variant = "card", className }: DepositButtonProps) => {
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [open, setOpen] = useState(false);

  if (!canDeposit(property)) return null;

  const amount = getDepositAmountVnd(property);
  const available = isAvailable(property);
  const wrongRole = !!user && user.role !== "user";
  const disabled = !available || wrongRole;

  const label = !available
    ? "Đã có người thuê"
    : variant === "detail"
      ? `Đặt cọc giữ chỗ · ${formatVndShort(amount)}`
      : `Đặt cọc · ${formatVndShort(amount)}`;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        title={wrongRole ? "Chỉ tài khoản người thuê mới đặt cọc được" : undefined}
        onClick={(e) => {
          // Nút nằm trong Link của card: không cho mở trang chi tiết
          e.preventDefault();
          e.stopPropagation();
          requireAuth(() => setOpen(true), { reason: "deposit" });
        }}
        className={cn(
          "w-full flex items-center justify-center gap-2 font-bold transition-all cursor-pointer",
          "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:-translate-y-px shadow-sm",
          "disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500",
          variant === "detail" ? "h-13 rounded-2xl text-[14.5px] shadow-md" : "h-10 rounded-xl text-[13px]",
          className,
        )}
      >
        {available ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
        {label}
      </button>

      {available && <DepositDialog property={property} open={open} onOpenChange={setOpen} />}
    </>
  );
};
