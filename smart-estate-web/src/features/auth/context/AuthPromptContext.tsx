"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Heart,
  MessageCircle,
  CalendarDays,
  ShieldCheck,
  UserRound,
  LockKeyhole,
  X,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context/AuthContext";

// ─── Lý do cần đăng nhập → nội dung modal ────────────────────────────────────
export type AuthPromptReason = "favorite" | "chat" | "viewing" | "deposit" | "personal" | "generic";

interface PromptContent {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CONTENT: Record<AuthPromptReason, PromptContent> = {
  favorite: {
    icon: Heart,
    title: "Đăng nhập để lưu bất động sản",
    description: "Lưu những căn bạn thích để xem lại, so sánh và nhận thông báo khi có thay đổi.",
  },
  chat: {
    icon: MessageCircle,
    title: "Đăng nhập để nhắn tin",
    description: "Trao đổi trực tiếp với chủ trọ, hỏi thêm thông tin và hẹn giờ xem nhà.",
  },
  viewing: {
    icon: CalendarDays,
    title: "Đăng nhập để đặt lịch xem",
    description: "Gửi yêu cầu xem nhà tới chủ trọ và theo dõi lịch hẹn trong trang Tài khoản.",
  },
  deposit: {
    icon: ShieldCheck,
    title: "Đăng nhập để đặt cọc",
    description: "Giữ chỗ ngay 10 phút và thanh toán an toàn qua ví trung gian — tiền chỉ chuyển cho chủ trọ khi bạn nhận phòng.",
  },
  personal: {
    icon: UserRound,
    title: "Đăng nhập để tiếp tục",
    description: "Mục này chứa thông tin cá nhân của bạn nên cần đăng nhập để sử dụng.",
  },
  generic: {
    icon: LockKeyhole,
    title: "Vui lòng đăng nhập",
    description: "Bạn cần đăng nhập để thao tác với tính năng này.",
  },
};

const PERKS = ["Lưu và so sánh BĐS yêu thích", "Nhắn tin, đặt lịch xem nhà", "Đặt cọc an toàn qua ví trung gian"];

export interface AuthPromptOptions {
  reason?: AuthPromptReason;
  /** Ghi đè tiêu đề (vd. "Đăng nhập để xem Chat & Tư vấn") */
  title?: string;
  /** Trang muốn tới sau khi đăng nhập; mặc định là trang đang xem */
  next?: string;
}

interface AuthPromptContextValue {
  /** Mở modal mời đăng nhập */
  openAuthPrompt: (options?: AuthPromptOptions) => void;
  /**
   * Chạy `action` nếu đã đăng nhập, ngược lại mở modal.
   * Dùng: `onClick={() => requireAuth(() => toggleFavorite(id), { reason: "favorite" })}`
   */
  requireAuth: (action: () => void, options?: AuthPromptOptions) => void;
}

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

/** Đường dẫn `next` hợp lệ: chỉ đường dẫn nội bộ, chặn chuyển hướng ra site khác (//evil.com). */
export const safeNextPath = (next: string | null | undefined) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/auth") ? next : null;

/** Link tới trang đăng nhập/đăng ký kèm trang quay lại */
export const authHref = (page: "login" | "register", next?: string | null) => {
  const safe = safeNextPath(next);
  return safe ? `/auth/${page}?next=${encodeURIComponent(safe)}` : `/auth/${page}`;
};

export const AuthPromptProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [prompt, setPrompt] = useState<AuthPromptOptions | null>(null);

  const openAuthPrompt = useCallback((options: AuthPromptOptions = {}) => setPrompt(options), []);

  const requireAuth = useCallback(
    (action: () => void, options?: AuthPromptOptions) => {
      if (isAuthenticated) action();
      else setPrompt(options ?? {});
    },
    [isAuthenticated],
  );

  const close = () => setPrompt(null);
  const content = CONTENT[prompt?.reason ?? "generic"];
  const Icon = content.icon;
  const next = prompt?.next ?? `${pathname}${search ? `?${search}` : ""}`;

  return (
    <AuthPromptContext.Provider value={{ openAuthPrompt, requireAuth }}>
      {children}

      <Dialog open={!!prompt} onOpenChange={(o) => !o && close()} className="max-w-[400px]">
        <div className="relative px-7 pt-8 pb-6 text-center">
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon theo ngữ cảnh, có ổ khóa nhỏ */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Icon className="w-7 h-7 text-zinc-900 dark:text-white" />
            <span className="absolute -right-1.5 -bottom-1.5 w-7 h-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center ring-4 ring-white dark:ring-[#151518]">
              <LockKeyhole className="w-3.5 h-3.5" />
            </span>
          </div>

          <h2 className="mt-5 text-[19px] font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {prompt?.title ?? content.title}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{content.description}</p>

          <ul className="mt-5 space-y-2 text-left">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[12.5px] text-zinc-600 dark:text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={authHref("login", next)}
              onClick={close}
              className="h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[14px] font-bold flex items-center justify-center no-underline hover:-translate-y-px transition-transform shadow-md"
            >
              Đăng nhập
            </Link>
            <Link
              href={authHref("register", next)}
              onClick={close}
              className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[14px] font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center no-underline hover:border-zinc-900 dark:hover:border-white transition-colors"
            >
              Tạo tài khoản mới
            </Link>
            <button
              type="button"
              onClick={close}
              className="mt-1 text-[12.5px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              Để sau, tiếp tục xem
            </button>
          </div>
        </div>
      </Dialog>
    </AuthPromptContext.Provider>
  );
};

export const useRequireAuth = (): AuthPromptContextValue => {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) throw new Error("useRequireAuth must be used within <AuthPromptProvider>");
  return ctx;
};
