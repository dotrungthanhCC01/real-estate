import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Tin tức & Bài viết", path: "/blog", icon: BookOpen, end: true },
  { label: "Rao vặt BĐS", path: "/blog/listings", icon: Users, end: false },
];

/**
 * BlogLayout — Shared layout for /blog, /blog/articles, /blog/articles/:slug, /blog/listings
 * Two top-level tabs: Tin tức | Rao vặt
 */
export const BlogLayout = () => {
  return (
    <div className="space-y-6">
      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors -mb-px",
                isActive
                  ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              )
            }
          >
            <tab.icon size={14} />
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* ── Content ── */}
      <Outlet />
    </div>
  );
};
