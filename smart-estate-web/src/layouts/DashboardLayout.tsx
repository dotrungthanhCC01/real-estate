import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Heart, Calendar, MessageSquare, LogOut,
  Bell, Plus, Headphones,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Favorites", path: "/dashboard/favorites", icon: Heart },
  { label: "Viewings", path: "/dashboard/appointments", icon: Calendar },
  { label: "Messages", path: "/dashboard/chat", icon: MessageSquare },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen w-full flex bg-[#F8F9FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] min-h-screen flex flex-col p-4">
        <div className="flex items-center gap-2 px-2 py-3 mb-6">
          <div className="flex flex-col gap-0.5">
            <div className="w-5 h-1 bg-zinc-900 dark:bg-white rounded-full"></div>
            <div className="w-4 h-1 bg-zinc-900 dark:bg-white rounded-full"></div>
            <div className="w-5 h-1 bg-zinc-900 dark:bg-white rounded-full"></div>
          </div>
          <h3 className="font-extrabold text-lg tracking-tight leading-none text-zinc-900 dark:text-white">
            smart<br/>estate.
          </h3>
          <span className="ml-auto bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold px-2 py-1 rounded-md text-zinc-500 uppercase tracking-widest">
            User
          </span>
        </div>

        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm mb-6">
          <Plus size={16} />
          Create new request
        </button>

        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.label === "Messages" && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-1 mt-auto pb-4">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
            <Headphones className="w-4 h-4" />
            Support
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-transparent px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {currentDate}
          </h1>
          <div className="flex items-center gap-5">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-50 transition-colors shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[13.5px] font-semibold text-zinc-800 dark:text-zinc-200">{user?.name}</span>
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-500 font-bold text-sm">{user?.name?.[0] ?? "U"}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 pb-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
