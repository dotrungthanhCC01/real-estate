"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Bell, Sun, Moon, Plus, LogOut, Home } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/store/theme.context";
import { PostListingProvider, usePostListing } from "@/features/landlord/context/PostListingContext";
import { cn } from "@/lib/utils";

// Các khu quản lý của chủ trọ
const NAV_ITEMS = [
  { label: "Tổng quan", href: "/landlord", exact: true },
  { label: "Sản phẩm", href: "/landlord/rooms" },
  { label: "Quản lý đăng tin", href: "/landlord/listings" },
  { label: "Bảo trì", href: "/landlord/maintenance" },
  { label: "Tin nhắn", href: "/landlord/chat" },
];

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const IconButton = ({ children, label, onClick }: { children: ReactNode; label: string; onClick?: () => void }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="w-11 h-11 rounded-full bg-secondary hover:bg-accent text-foreground flex items-center justify-center transition-colors cursor-pointer"
  >
    {children}
  </button>
);

/**
 * Layout chủ trọ: thanh trên cùng (logo · menu dạng viên · công cụ), nội dung toàn chiều rộng.
 * Màu theo token của web người dùng (globals.css): nền #F9F8F6, thẻ trắng, đen #121212.
 */
export const LandlordLayout = ({ children }: { children: ReactNode }) => (
  <PostListingProvider>
    <LandlordShell>{children}</LandlordShell>
  </PostListingProvider>
);

const LandlordShell = ({ children }: { children: ReactNode }) => {
  const { openPostListing } = usePostListing();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* pt: tách header khỏi mép trên trang; pb: tách header khỏi nội dung */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl pt-5 pb-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/landlord" className="flex items-center gap-3 no-underline shrink-0">
            <span className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-foreground" />
            </span>
            <span className="hidden sm:block text-[18px] font-semibold tracking-tight text-foreground">
              Smart Estate
            </span>
          </Link>

          {/* Menu dạng viên */}
          <nav className="flex-1 flex justify-center min-w-0">
            <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-5 h-11 rounded-full flex items-center text-[13.5px] font-medium whitespace-nowrap no-underline transition-colors",
                    isActive(item.href, item.exact)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-accent",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Công cụ */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openPostListing}
              className="flex items-center gap-1.5 px-4 h-11 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> <span className="hidden md:inline">Đăng tin</span>
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <IconButton label="Thông báo">
                <Bell className="w-[18px] h-[18px]" />
              </IconButton>
            </div>
            <IconButton label={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"} onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </IconButton>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Tài khoản"
                className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[13px] font-bold overflow-hidden cursor-pointer"
              >
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : initials(user?.name)}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 z-20 w-60 rounded-2xl border border-border bg-popover p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <p className="text-[13px] font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-[11.5px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/home"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-foreground hover:bg-secondary no-underline"
                    >
                      <Home className="w-4 h-4" /> Về trang người thuê
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        router.push("/auth/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-red-600 dark:text-red-400 hover:bg-secondary cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-3 pb-10">{children}</main>
    </div>
  );
};
