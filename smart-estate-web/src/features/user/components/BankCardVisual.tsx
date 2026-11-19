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
 * Thẻ ngân hàng thu nhỏ (tỉ lệ thẻ ATM 1.586:1). Màu theo ngân hàng, không dùng logo.
 *
 * Mọi kích thước (chữ, khoảng cách, chip, icon) tính theo đơn vị `cqw` = 1% chiều rộng thẻ
 * (container query), nên thẻ rộng 220px hay 400px đều giữ đúng bố cục, không tràn chữ.
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

  // Chữ mono + tracking 0.12em ≈ 0.72em/ký tự; vùng chữ rộng ~86cqw → số dài (tới 19 chữ số) tự thu nhỏ
  const numberSize = Math.min(6.4, 86 / (number.length * 0.72));

  return (
    <div className={`@container w-full ${className}`}>
      <div
        className="relative aspect-[1.586] w-full overflow-hidden rounded-[5cqw] text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] transition-[background] duration-500"
        style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      >
        {/* Vân trang trí */}
        <span className="pointer-events-none absolute -right-[18cqw] -top-[22cqw] h-[62cqw] w-[62cqw] rounded-full bg-white/10" />
        <span className="pointer-events-none absolute -bottom-[28cqw] -left-[12cqw] h-[62cqw] w-[62cqw] rounded-full bg-black/10" />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.14)_50%,transparent_60%)]" />

        <div className="relative flex h-full flex-col justify-between p-[6.5cqw]">
          {/* Tên ngân hàng */}
          <div className="flex items-start justify-between gap-[3cqw]">
            <div className="min-w-0">
              <p className="truncate text-[6cqw] font-extrabold leading-tight tracking-tight">{bankName || "Ngân hàng"}</p>
              <p className="truncate text-[3.8cqw] leading-snug text-white/70">
                {bank ? bank.fullName : "Tài khoản nhận tiền"}
              </p>
            </div>
            <Wifi className="h-[7cqw] w-[7cqw] shrink-0 rotate-90 text-white/80" />
          </div>

          {/* Chip + số */}
          <div>
            <div className="mb-[3cqw] flex h-[9.5cqw] w-[13.5cqw] items-center justify-center rounded-[2cqw] bg-linear-to-br from-amber-200 to-amber-400/90 shadow-inner ring-1 ring-black/10">
              <div className="h-[3.5cqw] w-[8cqw] rounded-[0.8cqw] border border-amber-600/40" />
            </div>
            <p
              className="whitespace-nowrap font-mono font-semibold leading-none tracking-[0.12em] tabular-nums"
              style={{ fontSize: `${numberSize}cqw` }}
            >
              {number}
            </p>
          </div>

          {/* Chủ tài khoản */}
          <div className="flex items-end justify-between gap-[3cqw]">
            <div className="min-w-0">
              <p className="text-[3.2cqw] font-semibold uppercase leading-tight tracking-widest text-white/60">
                Chủ tài khoản
              </p>
              <p className="truncate text-[4.8cqw] font-bold uppercase leading-tight tracking-wide">
                {holder || "TÊN CHỦ TÀI KHOẢN"}
              </p>
            </div>
            <Landmark className="h-[8cqw] w-[8cqw] shrink-0 text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
};
