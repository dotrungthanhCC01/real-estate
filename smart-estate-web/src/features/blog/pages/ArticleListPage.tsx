import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronRight, Search } from "lucide-react";
import { MOCK_ARTICLES, ARTICLE_CATEGORIES, type ArticleCategory } from "@/features/blog/data/mockBlogData";
import { cn } from "@/lib/utils";

export const ArticleListPage = () => {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory>("Tất cả");
  const [query, setQuery] = useState("");

  const filtered = MOCK_ARTICLES.filter(a => {
    const matchCat = activeCategory === "Tất cả" || a.category === activeCategory;
    const matchQuery = !query || a.title.toLowerCase().includes(query.toLowerCase()) || a.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const [hero, ...rest] = filtered;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-14">

      {/* ── Heading ── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-1">Bài viết & Tin tức</h1>
        <p className="text-[13px] text-zinc-500">Cập nhật kiến thức bất động sản từ các chuyên gia hàng đầu.</p>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[13px] outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
        />
      </div>

      {/* ── Hero: Latest featured article ── */}
      {hero && (
        <Link to={`/blog/articles/${hero.slug}`} className="group grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
          <div className="aspect-video md:aspect-auto min-h-[220px]">
            <img src={hero.coverImage} alt={hero.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 flex flex-col justify-center">
            <p className="text-[11px] text-zinc-500 mb-1.5">
              Published: {new Date(hero.publishedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight mb-3 group-hover:underline underline-offset-2">
              {hero.title}
            </h2>
            <p className="text-[13px] text-zinc-500 line-clamp-2 mb-4">{hero.excerpt}</p>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 dark:text-white">
              Đọc thêm <ChevronRight size={14} />
            </span>
          </div>
        </Link>
      )}

      {/* ── Category Tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {ARTICLE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors",
              activeCategory === cat
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Article Grid ── */}
      {rest.length === 0 && filtered.length <= 1 ? (
        <p className="text-center text-zinc-500 text-sm py-10">Không tìm thấy bài viết phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rest.map(article => (
            <Link
              key={article.id}
              to={`/blog/articles/${article.slug}`}
              className="group flex flex-col"
            >
              {/* Cover */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Meta */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  {article.category}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Published: {new Date(article.publishedAt).toLocaleDateString("vi-VN", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {/* Title */}
              <h3 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-snug line-clamp-2 mb-1.5 group-hover:underline underline-offset-2">
                {article.title}
              </h3>
              {/* Excerpt */}
              <p className="text-[12px] text-zinc-500 line-clamp-2 mb-2 flex-1">{article.excerpt}</p>
              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Đọc thêm <ChevronRight size={12} />
                </span>
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Clock size={11} /> {article.readTime} min
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
