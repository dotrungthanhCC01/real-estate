"use client";

import { useState } from "react";
import { Pencil, Plus, ShieldCheck, RefreshCw, AlertCircle, Landmark } from "lucide-react";
import { useBankAccount } from "@/features/user/api/bank-account.api";
import { BankCardVisual } from "@/features/user/components/BankCardVisual";
import { EditBankAccountDialog } from "@/features/user/components/EditBankAccountDialog";
import { getErrorMessage } from "@/lib/axios";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

/** Khối "Tài khoản nhận tiền" ở trang Tài khoản (GET/PUT /users/me/bank-account). */
export const BankAccountSection = ({ userName }: { userName: string }) => {
  const { data: account, isLoading, isError, error, refetch } = useBankAccount();
  const [open, setOpen] = useState(false);

  return (
    <section className="p-5 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[15px] font-extrabold text-zinc-900 dark:text-white">Tài khoản nhận tiền</h2>
          <p className="text-[12px] text-zinc-400">Nhận tiền cọc, hoàn cọc và rút tiền</p>
        </div>
        {account && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="Đổi tài khoản"
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        // Khung chờ cùng tỉ lệ với thẻ
        <div className="aspect-[1.586] w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-rose-300 dark:border-rose-900/60 px-4 py-8 text-center">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <p className="text-[12.5px] text-zinc-600 dark:text-zinc-300">{getErrorMessage(error)}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      ) : account ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block w-full text-left transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-0.6deg] cursor-pointer"
            aria-label="Đổi tài khoản nhận tiền"
          >
            <BankCardVisual bankName={account.bankName} holder={account.accountHolder} last4={account.accountLast4} />
          </button>
          <div className="mt-3 flex items-center justify-between gap-2 text-[11.5px] text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Đã mã hóa
            </span>
            <span>Cập nhật {formatDate(account.updatedAt)}</span>
          </div>
        </>
      ) : (
        // Chưa khai báo
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex aspect-[1.586] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-center transition-colors hover:border-zinc-900 dark:hover:border-white cursor-pointer"
        >
          <span className="relative">
            <Landmark className="w-8 h-8 text-zinc-300 dark:text-zinc-600 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white" />
            <span className="absolute -right-2 -bottom-1 w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </span>
          </span>
          <span>
            <span className="block text-[13.5px] font-bold text-zinc-900 dark:text-white">Thêm tài khoản ngân hàng</span>
            <span className="block text-[11.5px] text-zinc-400 px-6">Cần có để nhận tiền hoàn cọc hoặc rút tiền</span>
          </span>
        </button>
      )}

      <EditBankAccountDialog open={open} onOpenChange={setOpen} current={account ?? null} suggestedHolder={userName} />
    </section>
  );
};
