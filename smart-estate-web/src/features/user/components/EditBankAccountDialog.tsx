"use client";

import { useMemo, useState } from "react";
import { Search, Hash, UserRound, ShieldCheck, Check, Loader2, AlertCircle, Info, Plus } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { VIETNAM_BANKS, bankMonogram, bankColors } from "@/features/user/data/vietnamBanks";
import { BankCardVisual } from "@/features/user/components/BankCardVisual";
import { useSaveBankAccount, type BankAccount } from "@/features/user/api/bank-account.api";
import { getErrorMessage } from "@/lib/axios";

/** Tên in trên thẻ/sao kê: bỏ dấu, viết hoa (ngân hàng VN dùng dạng "TRAN THI BICH"). */
export const toBankHolderName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart();

const groupDigits = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, "$1 ");

type Errors = Partial<Record<"bankName" | "accountNumber" | "accountHolder", string>>;

interface FormProps {
  current: BankAccount | null;
  suggestedHolder: string;
  onClose: () => void;
}

// Tách form để mỗi lần mở modal là state mới
const BankAccountForm = ({ current, suggestedHolder, onClose }: FormProps) => {
  const save = useSaveBankAccount();

  const [bankName, setBankName] = useState(current?.bankName ?? "");
  const [query, setQuery] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [holder, setHolder] = useState(current?.accountHolder ?? toBankHolderName(suggestedHolder));
  const [errors, setErrors] = useState<Errors>({});

  const q = query.trim().toLowerCase();
  const banks = useMemo(
    () =>
      q
        ? VIETNAM_BANKS.filter(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              b.code.toLowerCase().includes(q) ||
              b.fullName.toLowerCase().includes(q),
          )
        : VIETNAM_BANKS.filter((b) => b.popular),
    [q],
  );
  const exactMatch = VIETNAM_BANKS.some((b) => b.name.toLowerCase() === q);

  const validate = (): Errors => {
    const e: Errors = {};
    if (bankName.trim().length < 2) e.bankName = "Chọn ngân hàng";
    if (!/^\d{6,19}$/.test(accountNumber)) e.accountNumber = "Số tài khoản gồm 6–19 chữ số";
    if (!toBankHolderName(holder).trim()) e.accountHolder = "Nhập tên chủ tài khoản";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    save.mutate(
      { bankName: bankName.trim(), accountNumber, accountHolder: toBankHolderName(holder).trim() },
      { onSuccess: onClose },
    );
  };

  const fieldBox = (error?: string) =>
    `mt-1.5 flex items-center gap-2.5 px-3.5 h-11 rounded-xl border bg-white dark:bg-zinc-900 transition-colors focus-within:border-zinc-900 dark:focus-within:border-white ${
      error ? "border-rose-400" : "border-zinc-200 dark:border-zinc-700"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogHeader>
        <div>
          <DialogTitle>{current ? "Đổi tài khoản nhận tiền" : "Thêm tài khoản nhận tiền"}</DialogTitle>
          <DialogDescription>Dùng để nhận tiền cọc, hoàn cọc và rút tiền từ ví Smart Estate.</DialogDescription>
        </div>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      <DialogContent className="grid gap-6 space-y-0 sm:grid-cols-[250px_1fr]">
        {/* ── Cột trái: xem trước ── */}
        <div className="space-y-3">
          <BankCardVisual bankName={bankName} holder={toBankHolderName(holder).trim()} liveNumber={accountNumber} />
          <div className="flex gap-2.5 rounded-xl bg-zinc-50 p-3 text-[11.5px] leading-relaxed text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
            <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              Số tài khoản được <b className="text-zinc-700 dark:text-zinc-200">mã hóa</b> khi lưu. Sau khi lưu chỉ hiển thị 4
              số cuối.
            </span>
          </div>
          {current && (
            <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3 text-[11.5px] leading-relaxed text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <Info className="mt-px h-4 w-4 shrink-0" />
              <span>
                Tài khoản mới sẽ thay thế {current.bankName} •••• {current.accountLast4}.
              </span>
            </div>
          )}
        </div>

        {/* ── Cột phải: form ── */}
        <div className="min-w-0 space-y-4">
          {/* Ngân hàng */}
          <div>
            <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">Ngân hàng</span>
            <div className={fieldBox(errors.bankName)}>
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm ngân hàng: VCB, Techcombank..."
                className="flex-1 bg-transparent text-[14px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
            </div>
            <p className="mt-2 text-[11px] font-medium text-zinc-400">{q ? "Kết quả" : "Phổ biến"}</p>
            <div className="mt-1.5 grid max-h-[156px] grid-cols-2 gap-2 overflow-y-auto pr-0.5">
              {banks.map((b) => {
                const active = b.name === bankName;
                const c = bankColors(b.name);
                return (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => {
                      setBankName(b.name);
                      setErrors((er) => ({ ...er, bankName: undefined }));
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                        : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9.5px] font-extrabold text-white"
                      style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                    >
                      {bankMonogram(b.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-bold">{b.name}</span>
                      <span className={`block truncate text-[10.5px] ${active ? "opacity-70" : "text-zinc-400"}`}>
                        {b.fullName}
                      </span>
                    </span>
                    {active && <Check className="ml-auto h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
              {/* Ngân hàng không có trong danh sách: dùng đúng tên đã gõ */}
              {q && !exactMatch && query.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={() => setBankName(query.trim())}
                  className="col-span-2 flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-2.5 text-[12.5px] font-semibold text-zinc-600 hover:border-zinc-500 dark:border-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Dùng tên “{query.trim()}”
                </button>
              )}
            </div>
            {errors.bankName && <span className="mt-1 block text-[12px] text-rose-500">{errors.bankName}</span>}
          </div>

          {/* Số tài khoản */}
          <label className="block">
            <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">Số tài khoản</span>
            <div className={fieldBox(errors.accountNumber)}>
              <Hash className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                inputMode="numeric"
                autoComplete="off"
                value={groupDigits(accountNumber)}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
                placeholder={current ? `Nhập lại số đầy đủ (•••• ${current.accountLast4})` : "0123 4567 89"}
                className="flex-1 bg-transparent font-mono text-[14px] tracking-wider text-zinc-900 outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-zinc-400 dark:text-white"
              />
              <span className="text-[11px] tabular-nums text-zinc-400">{accountNumber.length}/19</span>
            </div>
            {errors.accountNumber && <span className="mt-1 block text-[12px] text-rose-500">{errors.accountNumber}</span>}
          </label>

          {/* Chủ tài khoản */}
          <label className="block">
            <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">Tên chủ tài khoản</span>
            <div className={fieldBox(errors.accountHolder)}>
              <UserRound className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                value={holder}
                maxLength={200}
                // Gõ tự do (không phá bộ gõ tiếng Việt), rời ô thì bỏ dấu + viết hoa
                onChange={(e) => setHolder(e.target.value)}
                onBlur={() => setHolder((h) => toBankHolderName(h).trim())}
                placeholder="NGUYEN VAN AN"
                className="flex-1 bg-transparent text-[14px] uppercase tracking-wide text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
            </div>
            <span className="mt-1 block text-[11.5px] text-zinc-400">
              {errors.accountHolder ? (
                <span className="text-rose-500">{errors.accountHolder}</span>
              ) : (
                "Viết không dấu, đúng như tên in trên thẻ / ứng dụng ngân hàng."
              )}
            </span>
          </label>

          {save.isError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              <AlertCircle className="mt-px h-4 w-4 shrink-0" />
              <span>{getErrorMessage(save.error)}</span>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogFooter className="justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-xl px-4 text-[13px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-zinc-900 px-5 text-[13px] font-semibold text-white shadow-md transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-white dark:text-zinc-900 cursor-pointer"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {save.isPending ? "Đang lưu..." : "Lưu tài khoản"}
        </button>
      </DialogFooter>
    </form>
  );
};

interface EditBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: BankAccount | null;
  /** Họ tên người dùng, dùng gợi ý tên chủ tài khoản khi khai lần đầu */
  suggestedHolder: string;
}

export const EditBankAccountDialog = ({ open, onOpenChange, current, suggestedHolder }: EditBankAccountDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {open && <BankAccountForm current={current} suggestedHolder={suggestedHolder} onClose={() => onOpenChange(false)} />}
  </Dialog>
);
