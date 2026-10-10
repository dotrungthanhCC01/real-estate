import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Phone, Plus, Search, Home, ShoppingBag, KeyRound, Users,
} from "lucide-react";
import {
  MOCK_LISTING_POSTS,
  LISTING_POST_TYPES,
  type ListingPostType,
} from "@/features/blog/data/mockBlogData";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "Tìm nhà": Users,
  "Cần thuê": Users,
  "Bán nhà": ShoppingBag,
  "Cho thuê": KeyRound,
};

const TYPE_COLOR: Record<string, string> = {
  "Tìm nhà": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  "Bán nhà": "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  "Cho thuê": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  "Cần thuê": "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
};

// Modal Đăng tin
const PostModal = ({ onClose }: { onClose: () => void }) => {
  const [type, setType] = useState<ListingPostType>("Tìm nhà");
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Đăng bài viết</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <Plus className="rotate-45" size={20} />
          </button>
        </div>
        <form
          onSubmit={e => { e.preventDefault(); onClose(); }}
          className="space-y-4"
        >
          {/* Type */}
          <div>
            <label className="block text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Loại tin</label>
            <div className="grid grid-cols-2 gap-2">
              {LISTING_POST_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "py-2 rounded-xl border text-[12px] font-semibold transition-colors",
                    type === t
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Tiêu đề</label>
            <input
              required
              type="text"
              placeholder="VD: Tìm phòng gần ĐH Bách Khoa..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-[13px] outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
          {/* Location */}
          <div>
            <label className="block text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Khu vực</label>
            <input
              required
              type="text"
              placeholder="Quận/Huyện, Tỉnh/Thành phố"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-[13px] outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
          {/* Price */}
          <div>
            <label className="block text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Giá / Ngân sách</label>
            <input
              required
              type="text"
              placeholder="VD: 3–5 triệu/tháng"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-[13px] outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Mô tả</label>
            <textarea
              rows={3}
              required
              placeholder="Mô tả yêu cầu hoặc tài sản..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-[13px] outline-none focus:border-zinc-400 transition-colors resize-none"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[13px] font-bold hover:opacity-90 transition-opacity">
            Đăng tin
          </button>
        </form>
      </div>
    </div>
  );
};

export const ListingPostsPage = () => {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<"all" | ListingPostType>("all");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = MOCK_LISTING_POSTS.filter(p => {
    const matchType = activeType === "all" || p.type === activeType;
    const matchQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.location.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-14">
      {showModal && <PostModal onClose={() => setShowModal(false)} />}

      {/* ── Heading ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-1">Cộng đồng — Rao vặt BĐS</h1>
          <p className="text-[13px] text-zinc-500">Tìm nhà, bán nhà, cho thuê — kết nối trực tiếp không qua trung gian.</p>
        </div>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-[13px] font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus size={14} /> Đăng tin
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setActiveType("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors",
              activeType === "all"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            Tất cả
          </button>
          {LISTING_POST_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap",
                activeType === t
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc khu vực..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[13px] outline-none focus:border-zinc-400 transition-colors"
          />
        </div>
      </div>

      {/* ── Posts Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Home size={32} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Không có tin đăng phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(post => {
            const TypeIcon = TYPE_ICON[post.type] || Home;
            return (
              <div
                key={post.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                {/* Image */}
                <div className="aspect-video relative">
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  {/* Type badge */}
                  <span className={cn(
                    "absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                    TYPE_COLOR[post.type]
                  )}>
                    <TypeIcon size={10} />
                    {post.type}
                  </span>
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-zinc-500">
                      {new Date(post.postedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      post.userRole === "landlord"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    )}>
                      {post.userRole === "landlord" ? "Chủ trọ" : "Người dùng"}
                    </span>
                  </div>
                  <h3 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-snug line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-[12px] text-zinc-500 line-clamp-2 mb-3">{post.description}</p>
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-[14px] text-zinc-900 dark:text-white">{post.price}</span>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <MapPin size={10} /> {post.location}
                      </span>
                    </div>
                    <a
                      href={`tel:${post.contactPhone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[11px] font-bold hover:opacity-80 transition-opacity"
                    >
                      <Phone size={11} /> Liên hệ
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Login CTA (nếu chưa đăng nhập) ── */}
      {!user && (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center">
          <p className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            Đăng nhập để đăng tin tìm/bán/cho thuê BĐS
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[13px] font-bold hover:opacity-90 transition-opacity"
          >
            Đăng nhập
          </Link>
        </div>
      )}
    </div>
  );
};
