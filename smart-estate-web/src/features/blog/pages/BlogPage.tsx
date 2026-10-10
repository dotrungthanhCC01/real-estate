import { Link } from "react-router-dom";
import { ArrowRight, Clock, ChevronRight } from "lucide-react";
import { MOCK_ARTICLES } from "@/features/blog/data/mockBlogData";
import { cn } from "@/lib/utils";

// ── Featured card (large) ─────────────────────────────────────────────────────
const FeaturedArticleCard = ({ article }: { article: typeof MOCK_ARTICLES[0] }) => (
  <Link to={`/blog/articles/${article.slug}`} className="group relative rounded-2xl overflow-hidden block aspect-[4/3]">
    <img
      src={article.coverImage}
      alt={article.title}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold mb-2">
        {article.category}
      </span>
      <p className="text-[10px] text-zinc-300 mb-1.5">
        {new Date(article.publishedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })} · {article.author}
      </p>
      <h3 className="text-white font-bold text-[13px] leading-snug line-clamp-2 mb-2">
        {article.title}
      </h3>
      <span className="flex items-center gap-1 text-[11px] text-zinc-300 group-hover:text-white transition-colors">
        Đọc bài viết <ChevronRight size={12} />
      </span>
    </div>
  </Link>
);

// ── Blog Landing Page ─────────────────────────────────────────────────────────
export const BlogPage = () => {
  const featured = MOCK_ARTICLES.filter(a => a.featured).slice(0, 3);
  const recent = MOCK_ARTICLES.slice(3, 7);

  return (
    <div className="max-w-5xl mx-auto space-y-14 pb-14">

      {/* ── Hero Section ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white inline-block" />
              FEATURED INSIGHTS
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight max-w-md">
              Chúng Tôi Giúp Người Mua Lần Đầu Tránh Sai Lầm Đắt Giá
            </h1>
          </div>
          <Link
            to="/blog/articles"
            className="hidden md:flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-full text-[13px] font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Xem tất cả bài viết <ArrowRight size={14} />
          </Link>
        </div>

        {/* Featured Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured.map(a => (
            <FeaturedArticleCard key={a.id} article={a} />
          ))}
        </div>
      </div>

      {/* ── Insights & Newsletter Section ── */}
      <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {/* Left: Newsletter */}
        <div className="bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white inline-block" />
              INSIGHTS & GUIDANCE
            </p>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-4 leading-tight">
              Stay Informed.<br />Stay Ahead
            </h2>
            <p className="text-[13px] text-zinc-500 leading-relaxed">
              Blog của chúng tôi mang đến góc nhìn chuyên sâu về bất động sản, xu hướng thị trường và quyết định tài chính thông minh. Đăng ký để nhận bài viết mới nhất.
            </p>
          </div>
          <div className="mt-8 flex gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-[13px] outline-none focus:border-zinc-400 transition-colors"
            />
            <button className="px-4 py-2.5 bg-amber-400 text-zinc-900 rounded-xl text-[13px] font-bold hover:bg-amber-500 transition-colors whitespace-nowrap">
              Nhận Insights
            </button>
          </div>
        </div>
        {/* Right: Image */}
        <div className="aspect-auto md:aspect-auto min-h-[240px]">
          <img
            src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80"
            alt="Real estate insights"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Recent Articles ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Bài viết gần đây</h2>
          <Link
            to="/blog/articles"
            className="text-[13px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {recent.map((article, i) => (
            <Link
              key={article.id}
              to={`/blog/articles/${article.slug}`}
              className={cn(
                "group flex gap-5 items-start py-4",
                i < recent.length - 1 && "border-b border-zinc-100 dark:border-zinc-800"
              )}
            >
              <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-zinc-500 mb-1">
                  {new Date(article.publishedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <h3 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-snug line-clamp-2 mb-1.5 group-hover:underline underline-offset-2">
                  {article.title}
                </h3>
                <p className="text-[12px] text-zinc-500 line-clamp-1">{article.excerpt}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0">
                <Clock size={11} /> {article.readTime} min
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bài viết / Rao vặt CTA ── */}
      <div className="rounded-2xl overflow-hidden relative min-h-[200px]">
        <img
          src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=80"
          alt="Community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 p-8">
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Đăng Tin Tìm/Bán/Cho Thuê Ngay
          </h2>
          <p className="text-[13px] text-zinc-300 mb-5 max-w-md">
            Mua bán, cho thuê hay tìm nhà — cộng đồng SmartEstate sẵn sàng kết nối bạn với hàng ngàn người dùng thực.
          </p>
          <Link
            to="/blog/listings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-900 rounded-full text-[13px] font-bold hover:bg-zinc-100 transition-colors"
          >
            Xem & Đăng tin <ArrowRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  );
};
