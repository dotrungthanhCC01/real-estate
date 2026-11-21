"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  Clock,
  ShieldCheck,
  RotateCcw,
  KeyRound,
  MapPin,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  TimerOff,
  ScanLine,
  Check,
  FlaskConical,
} from "lucide-react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import type { Property } from "@/features/properties/data/mockProperties";
import { depositApi, DEPOSIT_MOCK, type CreatedDeposit } from "@/features/deposits/api/deposits.api";
import { formatVnd, getDepositAmountVnd } from "@/features/deposits/utils";
import { ApiError, getErrorMessage } from "@/lib/axios";

// ─── Lỗi đặt cọc → câu dễ hiểu ───────────────────────────────────────────────
const depositErrorMessage = (err: unknown) => {
  if (err instanceof ApiError) {
    if (err.code === "LISTING_NOT_AVAILABLE") return "Bất động sản vừa được người khác giữ chỗ hoặc không còn trống.";
    if (err.code === "RENTAL_DEPOSIT_IN_PROGRESS") return "Có người đang đặt cọc căn này, vui lòng thử lại sau ít phút.";
    if (err.code === "LISTING_NOT_FOUND") return "Tin đăng không tồn tại hoặc chưa được duyệt.";
    if (err.code === "NETWORK_ERROR" || (err.status && err.status >= 500) || err.status === 404)
      return "Dịch vụ đặt cọc đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau.";
  }
  return getErrorMessage(err);
};

const STEPS = ["Xác nhận", "Thanh toán", "Hoàn tất"] as const;

const Stepper = ({ current }: { current: 0 | 1 | 2 }) => (
  <ol className="flex items-center gap-2">
    {STEPS.map((label, i) => (
      <li key={label} className="flex items-center gap-2">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            i < current
              ? "bg-emerald-500 text-white"
              : i === current
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
          }`}
        >
          {i < current ? <Check className="w-3 h-3" /> : i + 1}
        </span>
        <span className={`text-[11.5px] font-semibold ${i === current ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
          {label}
        </span>
        {i < STEPS.length - 1 && <span className="w-5 h-px bg-zinc-200 dark:bg-zinc-700" />}
      </li>
    ))}
  </ol>
);

/** Đếm ngược tới `expiresAt` (giây còn lại) */
const useCountdown = (expiresAt?: string) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return expiresAt ? Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000)) : 0;
};

// ─── Bước 1: Xác nhận ────────────────────────────────────────────────────────
const PROTECTIONS = [
  { icon: Clock, title: "Giữ chỗ 10 phút", body: "Không ai khác đặt được căn này trong lúc bạn thanh toán." },
  { icon: ShieldCheck, title: "Tiền vào ví trung gian", body: "Smart Estate giữ tiền, chưa chuyển cho chủ trọ." },
  { icon: RotateCcw, title: "Đổi ý trong 48 giờ", body: "Chưa nhận phòng thì được hoàn 70% tiền cọc." },
  { icon: KeyRound, title: "Chuyển cho chủ trọ khi nhận phòng", body: "Khi bạn xác nhận, hoặc tự động sau 3 ngày." },
];

const ConfirmStep = ({
  property,
  amount,
  onSubmit,
  pending,
  error,
}: {
  property: Property;
  amount: number;
  onSubmit: () => void;
  pending: boolean;
  error: unknown;
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <div className="px-6 py-5 space-y-5 max-h-[calc(85vh-150px)] overflow-y-auto">
        {/* BĐS */}
        <div className="flex gap-3.5">
          <img src={property.thumbnailUrl} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-[14.5px] font-bold text-zinc-900 dark:text-white line-clamp-2">{property.title}</p>
            <p className="mt-1 flex items-center gap-1 text-[12px] text-zinc-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {property.district}, {property.city}
              </span>
            </p>
            <p className="mt-1 text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-300">Giá thuê {property.priceDisplay}</p>
          </div>
        </div>

        {/* Số tiền */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 text-[13px]">
          <div className="flex justify-between px-4 py-3">
            <span className="text-zinc-500">Tiền cọc (chủ trọ đặt)</span>
            <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">{formatVnd(amount)}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-zinc-500">Phí giao dịch</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Miễn phí</span>
          </div>
          <div className="flex justify-between items-baseline px-4 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-b-2xl">
            <span className="font-bold text-zinc-900 dark:text-white">Tổng thanh toán</span>
            <span className="text-[20px] font-black text-zinc-900 dark:text-white tabular-nums">{formatVnd(amount)}</span>
          </div>
        </div>

        {/* Cam kết bảo vệ người thuê */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">Bảo vệ người thuê</p>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {PROTECTIONS.map((p) => (
              <li key={p.title} className="flex gap-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 p-3">
                <p.icon className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <span className="block text-[12.5px] font-bold text-zinc-900 dark:text-white">{p.title}</span>
                  <span className="block text-[11.5px] leading-snug text-zinc-500 dark:text-zinc-400">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-zinc-900 dark:accent-white cursor-pointer"
          />
          <span className="text-[12.5px] text-zinc-600 dark:text-zinc-300">
            Tôi đồng ý với điều khoản đặt cọc: hoàn 70% nếu hủy trong 48 giờ khi chưa nhận phòng, quá thời hạn tiền cọc
            thuộc về chủ trọ.
          </span>
        </label>

        {!!error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle className="mt-px w-4 h-4 shrink-0" />
            <span>{depositErrorMessage(error)}</span>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!agreed || pending}
          className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {pending ? "Đang giữ chỗ..." : `Giữ chỗ & thanh toán ${formatVnd(amount)}`}
        </button>
      </div>
    </>
  );
};

// ─── Bước 2: Thanh toán QR ──────────────────────────────────────────────────
const PayStep = ({ deposit }: { deposit: CreatedDeposit }) => {
  const left = useCountdown(deposit.expiresAt);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const urgent = left <= 60;
  const progress = deposit.holdRemainingSeconds > 0 ? left / deposit.holdRemainingSeconds : 0;

  return (
    <div className="px-6 py-6 grid sm:grid-cols-[200px_1fr] gap-6 items-center">
      {/* QR */}
      <div className="mx-auto">
        <div className="relative p-3 rounded-2xl bg-white border border-zinc-200 shadow-sm">
          <QRCodeSVG value={deposit.qrCode} size={176} level="M" marginSize={0} />
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center gap-1">
            <ScanLine className="w-3 h-3" /> VietQR
          </span>
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-400">Quét bằng app ngân hàng bất kỳ</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Số tiền</p>
          <p className="text-[26px] font-black text-zinc-900 dark:text-white tabular-nums leading-tight">
            {formatVnd(deposit.amountVnd)}
          </p>
        </div>

        {/* Đếm ngược giữ chỗ */}
        <div className={`rounded-xl p-3 ${urgent ? "bg-rose-50 dark:bg-rose-950/30" : "bg-zinc-50 dark:bg-zinc-800/50"}`}>
          <div className="flex items-center justify-between text-[12px]">
            <span className={`flex items-center gap-1.5 font-semibold ${urgent ? "text-rose-600 dark:text-rose-400" : "text-zinc-600 dark:text-zinc-300"}`}>
              <Clock className="w-3.5 h-3.5" /> Giữ chỗ còn
            </span>
            <span className={`font-mono text-[18px] font-bold tabular-nums ${urgent ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-white"}`}>
              {mm}:{ss}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${urgent ? "bg-rose-500" : "bg-zinc-900 dark:bg-white"}`}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12.5px] text-zinc-500 dark:text-zinc-400">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-500" />
          </span>
          Đang chờ thanh toán — trang tự cập nhật khi tiền về
        </div>

        <a
          href={deposit.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-1.5 no-underline hover:border-zinc-900 dark:hover:border-white transition-colors"
        >
          Mở trang thanh toán payOS <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {DEPOSIT_MOCK && depositApi.simulatePaid && (
          <button
            type="button"
            onClick={() => depositApi.simulatePaid?.(deposit.depositId)}
            className="w-full h-9 rounded-xl border border-dashed border-amber-400 text-[12px] font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" /> Chế độ demo: giả lập đã thanh toán
          </button>
        )}

        <p className="text-[11px] text-zinc-400">Mã đơn: {deposit.depositId.slice(0, 8).toUpperCase()} · Đóng cửa sổ không hủy giữ chỗ.</p>
      </div>
    </div>
  );
};

// ─── Bước 3: Kết quả ─────────────────────────────────────────────────────────
const PaidStep = ({ amount, onClose }: { amount: number; onClose: () => void }) => (
  <div className="px-6 py-8 text-center">
    <span className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
      <CheckCircle2 className="w-9 h-9 text-emerald-500" />
    </span>
    <h3 className="mt-4 text-[20px] font-extrabold text-zinc-900 dark:text-white">Đặt cọc thành công</h3>
    <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
      {formatVnd(amount)} đang được giữ an toàn trong ví trung gian Smart Estate.
    </p>

    <ol className="mt-6 space-y-3 text-left">
      {[
        "Chủ trọ nhận thông báo và liên hệ bạn để bàn giao phòng.",
        "Nhận phòng xong, bấm “Đã nhận phòng” trong trang Tài khoản.",
        "Đổi ý trước khi nhận phòng? Yêu cầu hoàn 70% trong vòng 48 giờ.",
      ].map((text, i) => (
        <li key={i} className="flex gap-3 text-[13px] text-zinc-600 dark:text-zinc-300">
          <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <span className="pt-0.5">{text}</span>
        </li>
      ))}
    </ol>

    <div className="mt-7 grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={onClose}
        className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13.5px] font-bold text-zinc-800 dark:text-zinc-100 hover:border-zinc-900 dark:hover:border-white cursor-pointer"
      >
        Đóng
      </button>
      <Link
        href="/account"
        onClick={onClose}
        className="h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13.5px] font-bold flex items-center justify-center no-underline"
      >
        Xem đơn của tôi
      </Link>
    </div>
  </div>
);

const ExpiredStep = ({ onRetry }: { onRetry: () => void }) => (
  <div className="px-6 py-10 text-center">
    <span className="mx-auto w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
      <TimerOff className="w-8 h-8 text-zinc-500" />
    </span>
    <h3 className="mt-4 text-[19px] font-extrabold text-zinc-900 dark:text-white">Hết thời gian giữ chỗ</h3>
    <p className="mt-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
      Chưa nhận được thanh toán trong 10 phút nên chỗ đã được nhả cho người khác. Bạn chưa bị trừ tiền.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-6 px-6 h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13.5px] font-bold cursor-pointer"
    >
      Đặt cọc lại
    </button>
  </div>
);

// ─── Modal ───────────────────────────────────────────────────────────────────
const DepositFlow = ({ property, onClose }: { property: Property; onClose: () => void }) => {
  const amount = getDepositAmountVnd(property);
  // Một khóa cho mỗi lần đặt: bấm lại sau lỗi mạng không tạo đơn trùng (Idempotency-Key)
  const idemKey = useRef<string>(crypto.randomUUID());

  const create = useMutation({
    mutationFn: () => depositApi.create(property.id, idemKey.current, amount),
  });
  const created = create.data;

  // Hỏi trạng thái mỗi 3 giây trong lúc chờ tiền (payOS báo về BE qua webhook)
  const status = useQuery({
    queryKey: ["deposits", created?.depositId],
    queryFn: () => depositApi.get(created!.depositId),
    enabled: !!created,
    refetchInterval: (q) => (q.state.data && q.state.data.status !== "PENDING_PAYMENT" ? false : 3000),
    retry: false,
  });
  const current = status.data?.status ?? created?.status;

  const retry = () => {
    idemKey.current = crypto.randomUUID();
    create.reset();
  };

  const step: 0 | 1 | 2 = !created ? 0 : current === "PENDING_PAYMENT" ? 1 : 2;

  return (
    <>
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3">
        <div className="space-y-2.5">
          <h2 className="text-[17px] font-extrabold text-zinc-900 dark:text-white">Đặt cọc giữ chỗ</h2>
          <Stepper current={step} />
        </div>
        <DialogClose onClick={onClose} />
      </div>

      {DEPOSIT_MOCK && step < 2 && (
        <p className="px-6 pt-3 text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5" /> Chế độ demo — chưa kết nối dịch vụ đặt cọc thật, không trừ tiền.
        </p>
      )}

      {step === 0 && (
        <ConfirmStep
          property={property}
          amount={amount}
          onSubmit={() => create.mutate()}
          pending={create.isPending}
          error={create.error}
        />
      )}
      {step === 1 && created && <PayStep deposit={created} />}
      {step === 2 && (current === "EXPIRED" || current === "CANCELLED" ? (
        <ExpiredStep onRetry={retry} />
      ) : (
        <PaidStep amount={created?.amountVnd ?? amount} onClose={onClose} />
      ))}
    </>
  );
};

interface DepositDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DepositDialog = ({ property, open, onOpenChange }: DepositDialogProps) => (
  // Chặn sự kiện nổi lên Link của card (portal vẫn nổi theo cây React)
  <div onClick={(e) => e.stopPropagation()} className="contents">
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[580px]">
      {open && <DepositFlow property={property} onClose={() => onOpenChange(false)} />}
    </Dialog>
  </div>
);
