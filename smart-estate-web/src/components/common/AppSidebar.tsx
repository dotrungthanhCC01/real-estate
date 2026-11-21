import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Building2,
  Home,
  ShoppingBag,
  KeyRound,
  GraduationCap,
  Kanban,
  FileText,
  Heart,
  MessageCircle,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  LayoutList,
  LayoutGrid,
  GitCompare,
  LockKeyhole,
  LogIn,
} from "lucide-react";
import { useTheme } from "@/store/theme.context";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authHref, useRequireAuth } from "@/features/auth/context/AuthPromptContext";
import { useFavorites } from "@/features/favorites/context/FavoritesContext";
import type { UserRole } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";

const ACCOUNT_HREF: Record<UserRole, string> = {
  user: "/account",
  landlord: "/landlord",
  admin: "/admin",
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

interface AppSidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void;
}

export const AppSidebar = ({ onToggleCollapse }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const { openAuthPrompt } = useRequireAuth();
  const currentSearch = useSearchParams().toString();
  const currentPath = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onToggleCollapse?.(next);
  };

  /**
   * Strictly compare path and search parameters so that:
   * /properties?type=rent doesn't trigger when /properties?category=student_room&type=rent is active!
   */
  const isActive = (href: string) => {
    const [targetPath, targetQuery] = href.split("?");
    if (pathname !== targetPath) return false;

    if (!targetQuery) {
      return !currentSearch;
    }

    const currentParams = new URLSearchParams(currentSearch);
    const targetParams = new URLSearchParams(targetQuery);

    let isMatch = true;
    targetParams.forEach((value, key) => {
      if (currentParams.get(key) !== value) {
        isMatch = false;
      }
    });

    if (!isMatch) return false;

    if (!targetParams.has("category") && currentParams.has("category")) {
      return false;
    }

    return true;
  };

  const NAV_ITEMS = [
    { label: "Trang chủ", href: "/home", icon: Home },
    { label: "Tất cả BĐS", href: "/properties", icon: LayoutGrid },
    { label: "Mua BĐS", href: "/properties?type=buy", icon: ShoppingBag },
    { label: "Thuê BĐS", href: "/properties?type=rent", icon: KeyRound },
    { label: "Trọ Sinh Viên", href: "/properties?category=student_room&type=rent", icon: GraduationCap },
    { label: "So sánh BĐS", href: "/properties/compare", icon: GitCompare },
    { label: "Môi giới & Deal", href: "/dashboard/pipeline", icon: Kanban },
    { label: "Bài viết & Tin tức", href: "/blog", icon: FileText },
  ];

  const USER_ITEMS = [
    { label: "Quản lý BĐS", href: "/my-properties", icon: LayoutList },
    {
      label: "BĐS đã lưu",
      href: "/favorites",
      icon: Heart,
      badge: user && favoriteIds.length > 0 ? String(favoriteIds.length) : undefined,
    },
    { label: "Chat & Tư vấn", href: "/dashboard/chat", icon: MessageCircle },
    { label: "Thanh toán", href: "/dashboard/payment", icon: CreditCard },
  ];

  // Khách bấm mục Cá nhân → modal mời đăng nhập (đăng nhập xong tới đúng mục đó)
  const renderLockedItem = (item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = item.icon;
    return (
      <button
        key={item.href}
        type="button"
        onClick={() => openAuthPrompt({ reason: "personal", title: `Đăng nhập để dùng ${item.label}`, next: item.href })}
        title={collapsed ? `${item.label} (cần đăng nhập)` : undefined}
        className={cn(
          "group relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200 whitespace-nowrap text-left cursor-pointer",
          "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
          collapsed && "justify-center px-0"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            <LockKeyhole className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
          </>
        )}
      </button>
    );
  };

  const renderNavLink = (item: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: string }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200 whitespace-nowrap",
          collapsed && "justify-center px-0",
          active
            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-bold"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
        )}
      >
        <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", active && "scale-105")} />

        {!collapsed && (
          <span className="truncate flex-1">{item.label}</span>
        )}

        {!collapsed && item.badge && (
          <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold flex items-center justify-center shrink-0">
            {item.badge}
          </span>
        )}

        {/* Tooltip for collapsed mode */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-bold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-3 top-3 bottom-3 z-50 flex flex-col p-3 transition-all duration-300 ease-in-out",
        "bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        "rounded-3xl",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* ── Brand ── */}
      <div className={cn("flex items-center px-1 pt-1 pb-3", collapsed && "justify-center")}>
        <Link
          href="/home"
          className={cn("flex items-center gap-2.5 group focus:outline-none", collapsed ? "justify-center" : "w-full")}
        >
          <div className="w-9 h-9 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none whitespace-nowrap overflow-hidden">
              <span className="font-extrabold text-[16px] tracking-tight text-zinc-900 dark:text-white">
                Smart<span className="font-light text-zinc-500">Estate</span>
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                BĐS Thông Minh
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Navigation (Khám phá) ── */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
        {!collapsed && (
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2.5 pb-1">Khám phá</span>
        )}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => renderNavLink(item))}
        </nav>

        {/* ── User Section ── */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-0.5">
          {!collapsed && (
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2.5 pb-1">Cá nhân</span>
          )}
          {USER_ITEMS.map((item) => (user ? renderNavLink(item) : renderLockedItem(item)))}
        </div>
      </div>

      {/* ── Bottom Controls ── */}
      <div className="flex flex-col gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={collapsed ? (theme === "dark" ? "Chế độ sáng" : "Chế độ tối") : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[12.5px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all whitespace-nowrap",
            collapsed && "justify-center px-0"
          )}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-zinc-200 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700 shrink-0" />
          )}
          {!collapsed && <span className="truncate text-[12px]">{theme === "dark" ? "Giao diện Sáng" : "Giao diện Tối"}</span>}
        </button>

        {user ? (
          /* Đã đăng nhập → trang tài khoản theo vai trò */
          <Link
            href={ACCOUNT_HREF[user.role]}
            title={collapsed ? user.name : undefined}
            className={cn(
              "flex items-center gap-2.5 px-1.5 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all whitespace-nowrap",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0 text-[11px] font-extrabold">
              {initials(user.name) || <User className="w-3.5 h-3.5" />}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-[12px] font-bold text-zinc-900 dark:text-white leading-tight truncate">{user.name}</span>
                <span className="text-[10px] text-zinc-400 truncate">{user.email}</span>
              </div>
            )}
          </Link>
        ) : collapsed ? (
          /* Khách, sidebar thu gọn: một nút đăng nhập */
          <Link
            href={authHref("login", currentPath)}
            title="Đăng nhập / Đăng ký"
            className="flex items-center justify-center py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <div className="w-8 h-8 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center">
              <LogIn className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </Link>
        ) : (
          /* Khách: thẻ mời đăng nhập */
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-zinc-900 dark:text-white leading-tight">Khách</span>
                <span className="text-[10px] text-zinc-400 truncate">Đăng nhập để lưu, chat, đặt lịch</span>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <Link
                href={authHref("login", currentPath)}
                className="h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11.5px] font-bold flex items-center justify-center no-underline hover:opacity-90 transition-opacity"
              >
                Đăng nhập
              </Link>
              <Link
                href={authHref("register", currentPath)}
                className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11.5px] font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center no-underline hover:border-zinc-900 dark:hover:border-white transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={handleToggle}
          className={cn(
            "w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 font-bold text-[11px] transition-all whitespace-nowrap",
            collapsed && "px-0"
          )}
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="truncate">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
