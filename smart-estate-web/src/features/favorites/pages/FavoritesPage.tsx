"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  HeartPlus,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Star,
  Search,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Wallet,
  KeyRound,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { MOCK_PROPERTIES, type Property } from "@/features/properties/data/mockProperties";
import { CustomSelect } from "@/components/ui/select";
import { useFavorites } from "@/features/favorites/context/FavoritesContext";

type ListingFilter = "all" | "buy" | "rent";
type SortKey = "recent" | "price_asc" | "price_desc" | "area_desc";

const SORT_OPTIONS = [
  { value: "recent", label: "Mới lưu gần nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
  { value: "area_desc", label: "Diện tích lớn nhất" },
];

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  apartment: "Căn hộ",
  house: "Nhà phố",
  villa: "Biệt thự",
  land: "Đất nền",
  office: "Văn phòng",
  shophouse: "Shophouse",
  student_room: "Trọ / Studio",
};

// ─── Hình minh họa cho trạng thái trống (SVG inline, tự đổi màu theo light/dark) ──
const EmptyIllustration = () => (
  <svg viewBox="0 0 240 200" className="w-56 h-auto" aria-hidden="true">
    <circle cx="120" cy="104" r="84" className="fill-zinc-100 dark:fill-zinc-800/60" />
    <circle cx="120" cy="104" r="60" className="fill-zinc-50 dark:fill-zinc-800" />
    <rect x="52" y="150" width="136" height="4" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <path
      d="M78 150V100l42-34 42 34v50z"
      className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-600"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M70 106l50-42 50 42"
      fill="none"
      className="stroke-zinc-800 dark:stroke-zinc-200"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="110" y="122" width="20" height="28" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="88" y="108" width="14" height="14" rx="2" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
    <rect x="138" y="108" width="14" height="14" rx="2" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
    <g className="origin-center animate-pulse">
      <circle cx="170" cy="62" r="22" className="fill-white dark:fill-zinc-900" />
      <circle cx="170" cy="62" r="22" fill="none" className="stroke-rose-200 dark:stroke-rose-500/30" strokeWidth="2" />
      <path d="M170 73s-11-6.6-11-14a6 6 0 0 1 11-3.3A6 6 0 0 1 181 59c0 7.4-11 14-11 14z" className="fill-rose-500" />
    </g>
    <path d="M58 64l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" className="fill-zinc-300 dark:fill-zinc-600" />
    <circle cx="196" cy="118" r="4" className="fill-zinc-300 dark:fill-zinc-600" />
    <circle cx="44" cy="124" r="3" className="fill-zinc-300 dark:fill-zinc-600" />
  </svg>
);

const EmptyState = () => (
  <div className="flex flex-col items-center text-center px-6 py-16 sm:py-20 bg-white dark:bg-[#151518] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80">
    <EmptyIllustration />
    <h2 className="mt-6 text-[1.5rem] font-extrabold tracking-tight text-zinc-900 dark:text-white">
      Chưa có bất động sản yêu thích
    </h2>
    <p className="mt-2 max-w-md text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">
      Nhấn vào biểu tượng <Heart className="inline w-4 h-4 -mt-0.5 fill-rose-500 text-rose-500" /> trên bất kỳ
      tin đăng nào để lưu lại. Tất cả căn bạn đã lưu sẽ nằm gọn ở đây để xem lại và so sánh.
    </p>
    <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[14px] font-semibold no-underline shadow-md hover:-translate-y-px hover:shadow-lg transition-all"
      >
        <Search className="w-4 h-4" />
        Khám phá bất động sản
      </Link>
      <Link
        href="/home"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-[14px] font-semibold no-underline hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        Về trang chủ
      </Link>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-12">
      {[
        { step: "01", title: "Tìm kiếm", desc: "Lọc theo khu vực, giá, loại hình" },
        { step: "02", title: "Thả tim", desc: "Lưu những căn bạn ưng ý" },
        { step: "03", title: "Xem lại", desc: "So sánh & liên hệ chủ nhà" },
      ].map((s) => (
        <div key={s.step} className="text-left p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] font-bold tracking-widest text-zinc-400">{s.step}</span>
          <p className="mt-1 text-[14px] font-bold text-zinc-900 dark:text-white">{s.title}</p>
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">{s.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Nút tròn kiểu "vòng trong vòng" ─────────────────────────────────────────
const RingButton = ({
  children,
  title,
  href,
  onClick,
  tone = "default",
}: {
  children: React.ReactNode;
  title: string;
  href?: string;
  onClick?: () => void;
  tone?: "default" | "danger";
}) => {
  const inner = (
    <span
      className={`flex items-center justify-center w-8 h-8 rounded-full border-[1.5px] transition-colors ${
        tone === "danger"
          ? "border-rose-500 text-rose-500 group-hover/ring:bg-rose-500 group-hover/ring:text-white"
          : "border-zinc-900 text-zinc-900 dark:border-white dark:text-white group-hover/ring:bg-zinc-900 group-hover/ring:text-white dark:group-hover/ring:bg-white dark:group-hover/ring:text-zinc-900"
      }`}
    >
      {children}
    </span>
  );
  const cls =
    "group/ring flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#151518] border border-zinc-200/70 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-px transition-all cursor-pointer";

  return href ? (
    <Link href={href} title={title} aria-label={title} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={cls}>
      {inner}
    </button>
  );
};

// ─── Card nhỏ gọn (5 card / hàng), hover nghiêng sang phải ────────────────────
const CompactCard = ({ property, onRemove }: { property: Property; onRemove: () => void }) => (
  <Link
    href={`/properties/${property.id}`}
    className="group flex flex-col bg-white dark:bg-[#1a1a1e] rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 no-underline
      origin-bottom-left transition-all duration-300 ease-out
      hover:rotate-2 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)] hover:border-zinc-300 dark:hover:border-zinc-700"
  >
    {/* Ảnh */}
    <div className="relative aspect-4/3 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
      <img
        src={property.thumbnailUrl}
        alt={property.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/45 to-transparent" />

      {/* Tag Bán/Thuê: góc trên trái */}
      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-900/85 text-white backdrop-blur-md">
        {property.listingType === "buy" ? "Cần bán" : "Cho thuê"}
      </span>

      {/* Tim đỏ: góc trên phải (giống card trang chủ) – bấm để bỏ lưu */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        title="Bỏ yêu thích"
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
      >
        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
      </button>

      <span className="absolute bottom-2 right-2 flex items-center gap-0.5 text-[11px] font-bold text-white">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        {property.rating.toFixed(1)}
      </span>
    </div>

    {/* Thông tin */}
    <div className="flex flex-col gap-1 p-3">
      <span className="text-[15px] font-extrabold text-zinc-900 dark:text-white">{property.priceDisplay}</span>
      <h3 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1">{property.title}</h3>
      <p className="flex items-center gap-1 text-[11.5px] text-zinc-400 truncate">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {property.district}, {property.city}
        </span>
      </p>
      <div className="flex items-center gap-2.5 mt-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
        {property.bedrooms > 0 && (
          <span className="flex items-center gap-1">
            <Bed className="w-3 h-3" />
            {property.bedrooms}
          </span>
        )}
        {property.bathrooms > 0 && (
          <span className="flex items-center gap-1">
            <Bath className="w-3 h-3" />
            {property.bathrooms}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Maximize2 className="w-3 h-3" />
          {property.area}m²
        </span>
        <span className="ml-auto text-zinc-400">{PROPERTY_TYPE_LABEL[property.propertyType] ?? "Khác"}</span>
      </div>
    </div>
  </Link>
);

// ─── Card trống viền nét đứt có dấu + (thêm BĐS) ─────────────────────────────
const AddMoreCard = () => (
  <Link
    href="/properties"
    className="group flex flex-col items-center justify-center gap-3 min-h-[240px] rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400 no-underline
      hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:border-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 transition-colors"
  >
    <span className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-current group-hover:rotate-90 transition-transform duration-300">
      <Plus className="w-5 h-5" />
    </span>
    <span className="text-[13px] font-semibold">Thêm BĐS yêu thích</span>
  </Link>
);

// ─── Ô thống kê ──────────────────────────────────────────────────────────────
const StatTile = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/70 dark:border-zinc-800">
    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 shrink-0">
      <Icon className="w-[18px] h-[18px]" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-0.5 text-[18px] font-extrabold text-zinc-900 dark:text-white truncate tabular-nums">{value}</p>
      {hint && <p className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate">{hint}</p>}
    </div>
  </div>
);

const avg = (nums: number[]) => (nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0);

const PAGE_SIZE_OPTIONS = [
  { value: "5", label: "5 / trang" },
  { value: "10", label: "10 / trang" },
  { value: "15", label: "15 / trang" },
  { value: "20", label: "20 / trang" },
];

// ─── Trang Favorites ─────────────────────────────────────────────────────────
export const FavoritesPage = () => {
  const { favoriteIds, removeFavorite, clearFavorites } = useFavorites();
  const [filter, setFilter] = useState<ListingFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Giữ đúng thứ tự favoriteIds (mới lưu nằm đầu)
  const saved = useMemo(
    () =>
      favoriteIds
        .map((id) => MOCK_PROPERTIES.find((p) => p.id === id))
        .filter((p): p is Property => Boolean(p)),
    [favoriteIds]
  );

  const buyList = saved.filter((p) => p.listingType === "buy");
  const rentList = saved.filter((p) => p.listingType === "rent");
  const counts = { all: saved.length, buy: buyList.length, rent: rentList.length };

  const visible = useMemo(() => {
    const list = filter === "all" ? [...saved] : saved.filter((p) => p.listingType === filter);
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sort === "area_desc") list.sort((a, b) => b.area - a.area);
    return list;
  }, [saved, filter, sort]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages); // bỏ lưu bớt → không bị kẹt ở trang rỗng
  const pageItems = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const from = visible.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, visible.length);

  // Số liệu
  const cities = new Set(saved.map((p) => p.city));
  const districts = new Set(saved.map((p) => `${p.district}-${p.city}`));
  const newCount = saved.filter((p) => p.isNew).length;

  const tabs: { value: ListingFilter; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "buy", label: "Mua bán" },
    { value: "rent", label: "Cho thuê" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto w-full py-4 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-zinc-900 dark:text-white">
            BĐS yêu thích
          </h1>

          {/* Thẻ trắng tóm tắt số lượng */}
          {saved.length > 0 && (
            <div className="flex items-center gap-3.5 pl-2 pr-4 py-1.5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </span>
              <p className="text-[15px] font-extrabold text-zinc-900 dark:text-white tabular-nums">
                {saved.length} <span className="text-[13px] font-semibold text-zinc-500">căn</span>
              </p>
            </div>
          )}
        </div>

        {saved.length > 0 && (
          <div className="flex items-center gap-2.5">
            <CustomSelect
              options={SORT_OPTIONS}
              value={sort}
              onChange={(v) => {
                setSort(v as SortKey);
                setPage(1);
              }}
              className="w-52"
            />
            <RingButton href="/properties" title="Tìm thêm bất động sản">
              <HeartPlus className="w-4 h-4" />
            </RingButton>
            <RingButton
              tone="danger"
              title="Xóa tất cả"
              onClick={() => {
                if (window.confirm("Xóa toàn bộ danh sách yêu thích?")) clearFavorites();
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </RingButton>
          </div>
        )}
      </div>

      {saved.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Khung trắng bọc danh sách ── */}
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151518] border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="inline-flex p-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80">
                {tabs.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setFilter(t.value);
                      setPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                      filter === t.value
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t.label}
                    <span className="ml-1.5 text-[11px] text-zinc-400">{counts[t.value]}</span>
                  </button>
                ))}
              </div>
              <span className="hidden sm:flex items-center gap-1 text-[12px] text-zinc-400">
                Nhấn <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> trên card để bỏ lưu
              </span>
            </div>

            {/* Lưới card + card trống "thêm" ở cuối trang cuối */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {pageItems.map((p) => (
                <CompactCard key={p.id} property={p} onRemove={() => removeFavorite(p.id)} />
              ))}
              {currentPage === totalPages && <AddMoreCard />}
            </div>

            {/* Phân trang */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                Hiển thị <span className="font-semibold text-zinc-900 dark:text-white">{from}–{to}</span> trong{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">{visible.length}</span> căn
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-full text-[13px] font-semibold tabular-nums transition-colors cursor-pointer ${
                      n === currentPage
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <CustomSelect
                options={PAGE_SIZE_OPTIONS}
                value={String(pageSize)}
                onChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
                className="w-36"
              />
            </div>
          </section>
          {/* ── Số liệu ── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={Wallet}
              label="Giá bán trung bình"
              value={buyList.length ? `${avg(buyList.map((p) => p.price)).toFixed(1)} Tỷ` : "—"}
              hint={`${buyList.length} căn mua bán`}
            />
            <StatTile
              icon={KeyRound}
              label="Giá thuê trung bình"
              value={rentList.length ? `${avg(rentList.map((p) => p.price)).toFixed(1)} Tr/tháng` : "—"}
              hint={`${rentList.length} căn cho thuê`}
            />
            <StatTile
              icon={MapPinned}
              label="Khu vực đã lưu"
              value={`${districts.size} quận/huyện`}
              hint={`Trải trên ${cities.size} tỉnh/thành`}
            />
            <StatTile
              icon={Sparkles}
              label="Tin mới đăng"
              value={`${newCount} căn`}
              hint="Trong danh sách của bạn"
            />
          </section>

        </>
      )}
    </div>
  );
};
