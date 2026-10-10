import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/features/auth/types/auth.types";

const ROLE_REDIRECT: Record<UserRole, string> = {
  user: "/home",
  landlord: "/landlord",
  admin: "/admin",
};

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname.includes("/auth/login");

  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, selectedRole);
    navigate(ROLE_REDIRECT[selectedRole]);
  };

  const roleTabIndex = selectedRole === "user" ? 0 : selectedRole === "landlord" ? 1 : 2;

  return (
    <div className="flex flex-col w-full">
      {/* ── Logo ── */}
      <Link to="/" className="flex items-center gap-2.5 mb-4 no-underline group">
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
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-zinc-700/90 rounded-xl shadow-sm border border-zinc-200/60 dark:border-zinc-600/60 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${isLogin ? "0" : "calc(100% + 12px)"})` }}
        />
        <Link
          to="/auth/login"
          className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold transition-all duration-200 no-underline ${
            isLogin ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
          }`}
        >
          Đăng nhập
        </Link>
        <Link
          to="/auth/register"
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
            className="absolute top-1 bottom-1 w-[calc(33.333%-4px)] bg-white dark:bg-zinc-700/90 rounded-lg shadow-sm border border-zinc-200/60 dark:border-zinc-600/60 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${roleTabIndex * 100}%)`, left: `${roleTabIndex * 4}px` }}
          />
          {(["user", "landlord", "admin"] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={`relative z-10 flex-1 py-2 text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                selectedRole === r ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              {r === "user" ? "Người Dùng" : r === "landlord" ? "Chủ Trọ" : "Quản Trị"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Heading ── */}
      <div className="mb-6">
        <h1 className="text-[1.75rem] font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight mb-1.5">
          Welcome back!
        </h1>
        <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">
          Vui lòng nhập thông tin để truy cập tài khoản.
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-1.5">
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
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@smartestate.vn"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-[#F6F5F2] dark:bg-zinc-900/90 text-[13.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-300">
              Mật khẩu
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors no-underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
              <Lock size={16} />
            </div>
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-[#F6F5F2] dark:bg-zinc-900/90 text-[13.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1"
              aria-label="Toggle password"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          className="w-full py-3 mt-1.5 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-[14px] font-bold tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.18)] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
        >
          Đăng Nhập
        </button>
      </form>

      {/* ── OR Divider ── */}
      <div className="flex items-center gap-3 mb-1.5">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
          Hoặc
        </span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* ── Social buttons ── */}
      <div className="flex flex-col gap-2.5 mb-6">
        <button
          id="login-google"
          type="button"
          className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/80 text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:-translate-y-[1px] shadow-sm transition-all duration-200 cursor-pointer"
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2045c0-.638-.0573-1.252-.164-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9082C16.6582 14.252 17.64 11.9455 17.64 9.2045z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1818l-2.9082-2.2582c-.8064.54-1.8382.8591-3.0482.8591-2.3427 0-4.3282-1.5818-5.0373-3.7082H.9573v2.3318C2.4382 15.9836 5.4818 18 9 18z" fill="#34A853"/>
            <path d="M3.9627 10.71c-.18-.54-.2836-1.1182-.2836-1.71s.1036-1.17.2836-1.71V4.9582H.9573C.3477 6.1682 0 7.5436 0 9s.3477 2.8318.9573 4.0418L3.9627 10.71z" fill="#FBBC05"/>
            <path d="M9 3.5791c1.3214 0 2.5077.4545 3.4405 1.346l2.5814-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0164.9573 4.9582L3.9627 7.29C4.6718 5.1636 6.6573 3.5791 9 3.5791z" fill="#EA4335"/>
          </svg>
          Tiếp tục với Google
        </button>
      </div>

      {/* ── Sign up link ── */}
      <p className="text-center text-[12.5px] text-zinc-500 dark:text-zinc-400">
        Chưa có tài khoản?{" "}
        <Link
          to="/auth/register"
          className="font-bold text-zinc-900 dark:text-white hover:underline no-underline transition-colors underline-offset-2 ml-1"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};
