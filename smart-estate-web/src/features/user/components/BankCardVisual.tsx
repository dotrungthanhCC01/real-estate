import { Landmark, Wifi } from "lucide-react";
import { bankColors, findBank } from "@/features/user/data/vietnamBanks";

interface BankCardVisualProps {
  bankName?: string;
  holder?: string;
  /** Chỉ 4 số cuối (dữ liệu từ backend) */
  last4?: string;
  /** Số đang gõ trong modal: hiện các số đã nhập, phần còn lại là chấm */
  liveNumber?: string;
  className?: string;
}

const groupDigits = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, "$1 ");

/**
 * Thẻ ngân hàng thu nhỏ (tỉ lệ ~ thẻ ATM). Màu theo ngân hàng, có lớp ánh sáng và vân trang trí
 * để giống thẻ thật; không dùng logo ngân hàng.
 */
export const BankCardVisual = ({ bankName, holder, last4, liveNumber, className = "" }: BankCardVisualProps) => {
  const { from, to } = bankColors(bankName);
  const bank = findBank(bankName);

  const number =
    liveNumber !== undefined
      ? liveNumber
        ? groupDigits(liveNumber)
        : "•••• •••• ••••"
      : `•••• •••• ${last4 ?? "••••"}`;

  return (
    <div
      className={`relative aspect-[1.586] w-full overflow-hidden rounded-2xl p-5 text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] transition-[background] duration-500 ${className}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      {/* Vân trang trí */}
      <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-black/10" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.14)_50%,transparent_60%)]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold tracking-tight">{bankName || "Ngân hàng"}</p>
            <p className="truncate text-[11px] text-white/70">{bank ? bank.fullName : "Tài khoản nhận tiền"}</p>
          </div>
          <Wifi className="h-5 w-5 shrink-0 rotate-90 text-white/80" />
        </div>

        {/* Chip */}
        <div className="mt-auto mb-3 h-7 w-10 rounded-md bg-linear-to-br from-amber-200 to-amber-400/90 shadow-inner ring-1 ring-black/10">
          <div className="mx-auto mt-[9px] h-2.5 w-6 rounded-sm border border-amber-600/40" />
        </div>

        <p className="font-mono text-[17px] font-semibold tracking-[0.14em] tabular-nums sm:text-[18px]">{number}</p>

        <div className="mt-2.5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9.5px] font-semibold uppercase tracking-widest text-white/60">Chủ tài khoản</p>
            <p className="truncate text-[13px] font-bold uppercase tracking-wide">{holder || "TÊN CHỦ TÀI KHOẢN"}</p>
          </div>
          <Landmark className="h-6 w-6 shrink-0 text-white/80" />
        </div>
      </div>
    </div>
  );
};
