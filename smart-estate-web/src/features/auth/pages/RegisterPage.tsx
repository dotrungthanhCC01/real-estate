"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authHref, safeNextPath } from "@/features/auth/context/AuthPromptContext";
import { User, Mail, Lock, UserPlus, Building2, AlertCircle, Loader2 } from "lucide-react";
import type { UserRole } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/lib/axios";

// Chỉ 2 vai trò được tự đăng ký. Tài khoản Quản trị do admin tạo ở trang quản trị (thêm nhân viên).
type RegisterRole = Exclude<UserRole, "admin">;
const REGISTER_ROLES: { value: RegisterRole; label: string }[] = [
  { value: "user", label: "Người Dùng" },
  { value: "landlord", label: "Chủ Trọ" },
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname.includes("/auth/login");
  const next = safeNextPath(useSearchParams().get("next"));

  const [selectedRole, setSelectedRole] = useState<RegisterRole>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Đăng ký qua API (POST /auth/register) rồi tự đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Mật khẩu cần tối thiểu 8 ký tự");
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({ fullName: name, email, password, role: selectedRole });
      router.push(user.role === "landlord" ? "/landlord" : (next ?? "/home"));
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const roleTabIndex = REGISTER_ROLES.findIndex((r) => r.value === selectedRole);

  return (
    <div className="flex flex-col w-full">

      {/* ── Logo ── */}
      <Link href="/" className="flex items-center gap-2.5 mb-4 no-underline group">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-all">
          <Building2 size={18} className="text-white dark:text-zinc-950" />
        </div>
        <span className="font-extrabold text-[1.15rem] text-zinc-900 dark:text-white tracking-tight">
          Smart Estate
        </span>
      </Link>

      {/* ── Tabs: Đăng nhập / Đăng ký ── */}
      <div className="relative flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl mb-6 border border-zinc-200/50 dark:border-zinc-700/50">
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-12px)] bg-white dark:bg-zinc-700/90 rounded-xl shadow-sm border border-zinc-200/60 dark:border-zinc-600/60 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${isLogin ? "0" : "calc(100% + 12px)"})` }}
        />
        <Link
          href={authHref("login", next)}
          className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold transition-all duration-200 no-underline ${
            isLogin ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
          }`}
        >
          Đăng nhập
        </Link>
        <Link
          href={authHref("register", next)}
          className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold transition-all duration-200 no-underline ${
            !isLogin ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
          }`}
        >
          Đăng ký
        </Link>
      </div>

      {/* ── Role Selector ── */}
      <div className="mb-6">
        <div className="relative flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-zinc-700/90 rounded-lg shadow-sm border border-zinc-200/60 dark:border-zinc-600/60 transition-transform duration-300 ease-in-out"
            // 2 tab: thanh trượt rộng 1/2 (trừ padding), cách mép trái 4px (= p-1), trượt 100% để sang tab 2
            style={{ transform: `translateX(${roleTabIndex * 100}%)`, left: "4px" }}
          />
          {REGISTER_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelectedRole(r.value)}
              className={`relative z-10 flex-1 py-2 text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                selectedRole === r.value ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Heading ── */}
      <div className="mb-6">
        <h1 className="text-[1.75rem] font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight mb-1.5">
          Tạo tài khoản mới
        </h1>
        <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">
          Đăng ký tài khoản Người dùng hoặc Chủ trọ.
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-[12.5px] text-red-700 dark:text-red-300"
          >
            <AlertCircle size={15} className="shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-300">
            Họ và tên
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
              <User size={16} />
            </div>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-[#F6F5F2] dark:bg-zinc-900/90 text-[13.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-300">
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
              <Mail size={16} />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@smartestate.vn"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-[#F6F5F2] dark:bg-zinc-900/90 text-[13.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-300">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
              <Lock size={16} />
            </div>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-[#F6F5F2] dark:bg-zinc-900/90 text-[13.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 mt-1.5 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-[14px] font-bold tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.18)] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          <span>{submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</span>
        </button>
      </form>

      {/* ── Sign in link ── */}
      <p className="text-center text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-2">
        Đã có tài khoản?{" "}
        <Link
          href={authHref("login", next)}
          className="font-bold text-zinc-900 dark:text-white hover:underline no-underline transition-colors underline-offset-2 ml-1"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
};
