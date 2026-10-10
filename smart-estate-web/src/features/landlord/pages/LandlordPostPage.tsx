import { useState } from "react";
import { FilePlus, MapPin, DollarSign, Home, Image, CheckCircle } from "lucide-react";

const PROPERTY_TYPES = ["Phòng trọ", "Căn hộ mini", "Studio", "Căn hộ dịch vụ", "Nhà nguyên căn"];
const AMENITIES_LIST = ["Máy lạnh", "Nóng lạnh", "WC riêng", "Tủ lạnh", "Máy giặt", "Ban công", "Bãi xe", "WiFi", "Bảo vệ 24/7", "Camera an ninh"];

export const LandlordPostPage = () => {
  const [amenities, setAmenities] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Tin đăng đã gửi!</h2>
        <p className="text-sm text-zinc-500 text-center max-w-xs">Tin đăng của bạn đang chờ admin duyệt. Bạn sẽ nhận thông báo khi được duyệt.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors cursor-pointer"
        >
          Đăng tin khác
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FilePlus size={18} className="text-amber-600 dark:text-amber-400" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Đăng Tin Cho Thuê</h1>
        </div>
        <p className="text-sm text-zinc-500">Điền thông tin đầy đủ để tăng cơ hội tìm khách thuê</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        className="space-y-5"
      >
        {/* Basic info */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Home size={14} className="text-amber-500" /> Thông tin cơ bản</h2>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">Tiêu đề tin đăng *</label>
              <input required type="text" placeholder="VD: Phòng trọ cao cấp Bình Thạnh, đầy đủ nội thất" className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-zinc-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">Loại phòng *</label>
                <select required className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer">
                  <option value="">Chọn loại...</option>
                  {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">Diện tích (m²) *</label>
                <input required type="number" placeholder="VD: 20" min="1" className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-zinc-400" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">Mô tả chi tiết</label>
              <textarea rows={3} placeholder="Mô tả về phòng, vị trí, tiện ích xung quanh..." className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-zinc-400 resize-none" />
            </div>
          </div>
        </div>

        {/* Price & Location */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><DollarSign size={14} className="text-amber-500" /> Giá & Vị trí</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">Giá thuê/tháng (đ) *</label>
              <input required type="number" placeholder="VD: 3500000" min="0" className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-zinc-400" />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">Tiền cọc (tháng)</label>
              <input type="number" placeholder="VD: 2" min="0" max="6" className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-zinc-400" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1"><MapPin size={11} /> Địa chỉ *</label>
            <input required type="text" placeholder="VD: 123 Đường Phan Văn Trị, Phường 10, Bình Thạnh, TP.HCM" className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-zinc-400" />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Tiện Nghi</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  amenities.includes(a)
                    ? "bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950/40 dark:border-amber-600 dark:text-amber-400"
                    : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                }`}
              >
                {amenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3"><Image size={14} className="text-amber-500" /> Hình Ảnh</h2>
          <div className="border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
            <Image size={24} className="text-amber-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Kéo thả hoặc <span className="text-amber-600 dark:text-amber-400 font-semibold">chọn ảnh</span></p>
            <p className="text-[11px] text-zinc-400 mt-1">JPG, PNG — Tối đa 5 ảnh, mỗi ảnh 5MB</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold tracking-wide shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          Gửi Tin Đăng Để Duyệt
        </button>
      </form>
    </div>
  );
};
