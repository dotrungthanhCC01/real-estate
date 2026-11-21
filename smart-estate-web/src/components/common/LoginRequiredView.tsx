"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole, Compass, type LucideIcon } from "lucide-react";
import { authHref } from "@/features/auth/context/AuthPromptContext";

interface LoginRequiredViewProps {
  icon: LucideIcon;
  /** Tên trang, vd. "BĐS đã lưu" */
  title: string;
  description: string;
}

/**
 * Trang cá nhân ở trạng thái khách (kiểu "Log in to view your wishlists" của Airbnb):
 * giữ nguyên khung trang, thay nội dung bằng lời mời đăng nhập, không chuyển hướng.
 */
export const LoginRequiredView = ({ icon: Icon, title, description }: LoginRequiredViewProps) => {
  const pathname = usePathname();

  return (
    <div className="max-w-[1400px] mx-auto w-full py-4 space-y-6">
      <div>
        <h1 className="text-[1.75rem] font-extrabold tracking-tight text-zinc-900 dark:text-white">{title}</h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Bạn đang xem với tư cách khách</p>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-[#151518] px-6 py-16 sm:py-20 text-center shadow-xs">
        {/* Nền chấm trang trí */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20 bg-[radial-gradient(circle,#d4d4d8_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        <div className="relative mx-auto max-w-md">
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Icon className="w-9 h-9 text-zinc-900 dark:text-white" />
            <span className="absolute -right-2 -bottom-2 w-9 h-9 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center ring-4 ring-white dark:ring-[#151518]">
              <LockKeyhole className="w-4 h-4" />
            </span>
          </div>

          <h2 className="mt-6 text-[20px] font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Vui lòng đăng nhập để sử dụng tính năng này
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href={authHref("login", pathname)}
              className="w-full sm:w-auto px-6 h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[14px] font-bold flex items-center justify-center no-underline shadow-md hover:-translate-y-px transition-transform"
            >
              Đăng nhập
            </Link>
            <Link
              href={authHref("register", pathname)}
              className="w-full sm:w-auto px-6 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[14px] font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center no-underline hover:border-zinc-900 dark:hover:border-white transition-colors"
            >
              Tạo tài khoản
            </Link>
          </div>

          <Link
            href="/properties"
            className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white no-underline"
          >
            <Compass className="w-3.5 h-3.5" /> Hoặc tiếp tục khám phá bất động sản
          </Link>
        </div>
      </section>
    </div>
  );
};
