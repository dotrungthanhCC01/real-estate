import { useParams, Link } from "react-router-dom";
import { Clock, Share2, ChevronLeft, User } from "lucide-react";
import { MOCK_ARTICLES } from "@/features/blog/data/mockBlogData";

export const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = MOCK_ARTICLES.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-zinc-400 text-sm mb-4">Bài viết không tồn tại.</p>
        <Link to="/blog/articles" className="text-sm font-semibold text-zinc-900 dark:text-white underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const related = MOCK_ARTICLES.filter(a => a.id !== article.id && a.category === article.category).slice(0, 3);

  // Simple HTML-like renderer for content
  const renderContent = (html: string) => {
    return html
      .split(/(<h2>.*?<\/h2>|<p>.*?<\/p>)/gs)
      .filter(Boolean)
      .map((block, i) => {
        if (block.startsWith("<h2>")) {
          const text = block.replace(/<\/?h2>/g, "");
          return (
            <h2 key={i} className="text-lg font-bold text-zinc-900 dark:text-white mt-8 mb-3">
              {text}
            </h2>
          );
        }
        if (block.startsWith("<p>")) {
          const text = block.replace(/<\/?p>/g, "");
          return (
            <p key={i} className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              {text}
            </p>
          );
        }
        return null;
      });
  };

  return (
    <div className="max-w-3xl mx-auto pb-14">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-[12px] text-zinc-500 mb-6">
        <Link to="/blog" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <Link to="/blog/articles" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Bài viết</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-white truncate max-w-[200px]">{article.title}</span>
      </div>

      {/* ── Article Header ── */}
      <div className="mb-8 text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-3">
          {article.category} &nbsp;·&nbsp; {article.readTime} MINS AGO
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight mb-4">
          {article.title}
        </h1>
        <p className="text-[13px] text-zinc-500">
          by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{article.author}</span>
          &nbsp;·&nbsp;
          {new Date(article.publishedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Share bar ── */}
      <div className="flex items-center justify-between py-3 border-y border-zinc-200 dark:border-zinc-800 mb-8">
        <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400">Chia sẻ bài viết này</span>
        <div className="flex items-center gap-3">
          {["Facebook", "Twitter", "LinkedIn", "Copy"].map(s => (
            <button
              key={s}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Share2 size={12} /> {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cover Image ── */}
      <div className="aspect-video rounded-2xl overflow-hidden mb-8">
        <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
      </div>

      {/* ── Article Content ── */}
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        {renderContent(article.content)}
      </div>

      {/* ── Tags ── */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-[12px] text-zinc-500 font-medium">Tags:</span>
          {article.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Author Card ── */}
      <div className="mt-8 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <img src={article.authorAvatar} alt={article.author} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <User size={12} className="text-zinc-400" />
            <span className="text-[12px] text-zinc-500">Tác giả</span>
          </div>
          <p className="font-bold text-[14px] text-zinc-900 dark:text-white">{article.author}</p>
          <p className="text-[12px] text-zinc-500">Chuyên gia BĐS tại Smart Estate</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-zinc-400">
          <Clock size={11} /> {article.readTime} phút đọc
        </div>
      </div>

      {/* ── Related Articles ── */}
      {related.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Bài viết liên quan</h2>
            <Link to="/blog/articles" className="text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              Xem tất cả <ChevronLeft size={12} className="rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map(a => (
              <Link key={a.id} to={`/blog/articles/${a.slug}`} className="group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2">
                  <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase">{a.category}</p>
                <h4 className="text-[13px] font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2 group-hover:underline underline-offset-2">{a.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Back link ── */}
      <div className="mt-10">
        <Link to="/blog/articles" className="flex items-center gap-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ChevronLeft size={14} /> Quay lại danh sách bài viết
        </Link>
      </div>
    </div>
  );
};
