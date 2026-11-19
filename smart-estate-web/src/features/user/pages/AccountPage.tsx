"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Mail,
  Phone,
  MapPin,
  CalendarCheck,
  CalendarDays,
  Heart,
  LifeBuoy,
  FileText,
  Power,
  ArrowUpRight,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  UserRound,
  StickyNote,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useFavorites } from "@/features/favorites/context/FavoritesContext";
import { CustomSelect } from "@/components/ui/select";
import { MOCK_PROPERTIES } from "@/features/properties/data/mockProperties";
import {
  MOCK_APPOINTMENTS,
  APPOINTMENT_STATUS,
  type Appointment,
  type AppointmentStatus,
} from "@/features/appointments/data/mockAppointments";
import { EditProfileDialog } from "@/features/user/components/EditProfileDialog";
import { BankAccountSection } from "@/features/user/components/BankAccountSection";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

const monthsSince = (iso: string) => {
  const from = new Date(iso);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - from.getFullYear()) * 12 + now.getMonth() - from.getMonth());
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const getProperty = (id: string) => MOCK_PROPERTIES.find((p) => p.id === id);

const PAGE_SIZE_OPTIONS = [
  { value: "5", label: "5 lịch / trang" },
  { value: "7", label: "7 lịch / trang" },
  { value: "10", label: "10 lịch / trang" },
];

// ─── Nội dung văn bản cho ngăn kéo Hỗ trợ / Điều khoản ───────────────────────
type DrawerKind = "support" | "terms";

const DRAWER_CONTENT: Record<DrawerKind, { title: string; desc: string; sections: { heading: string; body: string }[] }> = {
  support: {
    title: "Trung tâm hỗ trợ",
    desc: "Câu hỏi thường gặp và cách liên hệ với Smart Estate",
    sections: [
      {
        heading: "Làm sao để đặt lịch xem nhà?",
        body: "Mở trang chi tiết bất động sản bạn quan tâm, bấm “Đặt lịch hẹn”, chọn ngày giờ phù hợp. Lịch hẹn sẽ xuất hiện trong mục Lịch hẹn ở trang Tài khoản.",
      },
      {
        heading: "Tôi muốn đổi hoặc hủy lịch hẹn",
        body: "Trong danh sách lịch hẹn, mở lịch có trạng thái “Đã đặt lịch” và bấm “Hủy lịch hẹn”. Để đổi giờ, bạn hủy lịch cũ rồi đặt lịch mới tại trang chi tiết bất động sản.",
      },
      {
        heading: "Thông tin liên hệ của tôi được dùng thế nào?",
        body: "Số điện thoại và email chỉ được gửi cho chủ nhà / môi giới của bất động sản bạn đặt lịch, để họ xác nhận và liên hệ trước buổi xem nhà.",
      },
      {
        heading: "Liên hệ hỗ trợ",
        body: "Email: support@smartestate.vn · Thời gian phản hồi: 8:00 – 21:00 các ngày trong tuần.",
      },
    ],
  },
  terms: {
    title: "Điều khoản dịch vụ",
    desc: "Áp dụng cho tài khoản Người dùng trên Smart Estate",
    sections: [
      {
        heading: "1. Tài khoản",
        body: "Bạn chịu trách nhiệm về tính chính xác của thông tin cá nhân và bảo mật mật khẩu. Mỗi người chỉ nên sử dụng một tài khoản Người dùng.",
      },
      {
        heading: "2. Đặt lịch xem nhà",
        body: "Lịch hẹn là cam kết giữa bạn và chủ nhà / môi giới. Vui lòng hủy trước ít nhất 2 giờ nếu không thể đến để tránh ảnh hưởng tới người khác.",
      },
      {
        heading: "3. Nội dung tin đăng",
        body: "Smart Estate kiểm duyệt tin đăng nhưng không đảm bảo tuyệt đối về giá, pháp lý hay hiện trạng. Bạn nên kiểm tra kỹ giấy tờ trước khi giao dịch.",
      },
      {
        heading: "4. Quyền riêng tư",
        body: "Dữ liệu của bạn được xử lý theo chính sách bảo mật của Smart Estate và chỉ chia sẻ cho bên liên quan khi bạn chủ động đặt lịch hoặc liên hệ.",
      },
      {
        heading: "5. Thay đổi điều khoản",
        body: "Điều khoản có thể được cập nhật. Phiên bản mới có hiệu lực kể từ khi được đăng trên trang này.",
      },
    ],
  },
};

// Ngăn kéo bên phải + nền mờ
const InfoDrawer = ({ kind, onClose }: { kind: DrawerKind | null; onClose: () => void }) => {
  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [kind, onClose]);

  if (!kind) return null;
  const content = DRAWER_CONTENT[kind];

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-200" onClick={onClose} />
      <aside className="absolute right-3 top-3 bottom-3 w-[calc(100%-24px)] max-w-md flex flex-col bg-white dark:bg-[#151518] rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-[17px] font-extrabold text-zinc-900 dark:text-white">{content.title}</h3>
            <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">{content.desc}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {content.sections.map((s) => (
            <section key={s.heading}>
              <h4 className="text-[14px] font-bold text-zinc-900 dark:text-white">{s.heading}</h4>
              <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600 dark:text-zinc-400">{s.body}</p>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
};

// Ô lối tắt 2x2 ở cột trái (bo góc vừa phải, số không sát mép)
const QuickTile = ({
  icon: Icon,
  label,
  value,
  onClick,
  href,
  active,
}: {
  icon: React.ElementType;
  label: string;
  value?: number;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}) => {
  const cls = `relative flex flex-col items-center justify-center gap-2 h-24 px-2 rounded-xl border text-center no-underline transition-all cursor-pointer ${
    active
      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900"
      : "bg-white dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:-translate-y-0.5"
  }`;
  const inner = (
    <>
      {value !== undefined && (
        <span
          className={`absolute top-2.5 right-2.5 min-w-6 h-5 px-1.5 rounded-md text-[11px] font-bold flex items-center justify-center tabular-nums ${
            active ? "bg-white/15 dark:bg-zinc-900/10" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          }`}
        >
          {value}
        </span>
      )}
      <Icon className="w-5 h-5" />
      <span className="text-[12px] font-semibold leading-tight">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
};

const StatusPill = ({ status }: { status: AppointmentStatus }) => {
  const s = APPOINTMENT_STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-semibold whitespace-nowrap ${s.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Chi tiết 1 lịch hẹn khi mở rộng: chỉ các thông tin của buổi hẹn ─────────
const AppointmentDetail = ({ apt, onCancel }: { apt: Appointment; onCancel: () => void }) => {
  const property = getProperty(apt.propertyId);
  if (!property) return null;
  const gallery = (property.images?.length ? property.images : [property.thumbnailUrl]).slice(0, 4);

  const info = [
    { icon: Clock, label: "Thời gian", value: `${apt.time} · ${formatDate(apt.date)}` },
    { icon: MapPin, label: "Địa điểm xem nhà", value: property.address },
    { icon: UserRound, label: "Người liên hệ", value: `${property.agentName} · ${property.agentPhone}` },
    ...(apt.note ? [{ icon: StickyNote, label: "Ghi chú của bạn", value: apt.note }] : []),
  ];

  return (
    <div className="pb-5 pt-1 space-y-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {info.map((row) => (
            <div key={row.label} className="flex items-start gap-2.5 min-w-0">
              <row.icon className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11.5px] text-zinc-400">{row.label}</p>
                <p className="text-[13px] font-semibold text-zinc-900 dark:text-white truncate">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-zinc-200/70 dark:border-zinc-700/60">
          {apt.status === "scheduled" && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 h-9 rounded-md border border-zinc-300 dark:border-zinc-600 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-zinc-900 hover:text-zinc-900 dark:hover:border-white dark:hover:text-white transition-colors cursor-pointer"
            >
              Hủy lịch hẹn
            </button>
          )}
          <Link
            href={`/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-zinc-200/70 dark:bg-zinc-700 text-[13px] font-semibold text-zinc-900 dark:text-white no-underline hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors"
          >
            Xem tin đăng <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Khối ảnh liền nhau: ảnh đầu bo trái, ảnh cuối bo phải, hover thì ảnh giãn ra */}
      <div className="flex h-40 sm:h-44 gap-1">
        {gallery.map((src, i) => (
          <Link
            key={i}
            href={`/properties/${property.id}`}
            className={`group relative flex-1 hover:flex-[2.2] overflow-hidden bg-zinc-100 dark:bg-zinc-800 transition-[flex-grow] duration-500 ease-out ${
              i === 0 ? "rounded-l-xl" : ""
            } ${i === gallery.length - 1 ? "rounded-r-xl" : ""}`}
          >
            <img
              src={src}
              alt={`${property.title} ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── Trang Tài khoản (vai trò Người dùng) ───────────────────────────────────
export const AccountPage = () => {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { favoriteIds } = useFavorites();

  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(
    MOCK_APPOINTMENTS.find((a) => a.status === "scheduled")?.id ?? null
  );
  const [editOpen, setEditOpen] = useState(false);
  const [drawer, setDrawer] = useState<DrawerKind | null>(null);

  const statusCount = useMemo(() => {
    const c: Record<AppointmentStatus, number> = { scheduled: 0, visited: 0, cancelled: 0 };
    appointments.forEach((a) => c[a.status]++);
    return c;
  }, [appointments]);

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(appointments.map((a) => a.date.slice(0, 7)))).sort().reverse();
    return [
      { value: "all", label: "Tất cả các tháng" },
      ...months.map((m) => ({ value: m, label: `Tháng ${m.slice(5)}/${m.slice(0, 4)}` })),
    ];
  }, [appointments]);

  const statusOptions = [
    { value: "all", label: `Tất cả trạng thái (${appointments.length})` },
    ...(Object.keys(APPOINTMENT_STATUS) as AppointmentStatus[]).map((s) => ({
      value: s,
      label: `${APPOINTMENT_STATUS[s].label} (${statusCount[s]})`,
    })),
  ];

  // Lọc + sắp xếp mới nhất trước
  const visible = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            (statusFilter === "all" || a.status === statusFilter) &&
            (monthFilter === "all" || a.date.startsWith(monthFilter))
        )
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    [appointments, statusFilter, monthFilter]
  );

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const from = visible.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, visible.length);

  if (!user) return null; // ProtectedRoute đã chặn, phòng hờ

  const cancelAppointment = (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy lịch hẹn này?")) return;
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
  };

  const handleLogout = () => {
    if (!window.confirm("Đăng xuất khỏi tài khoản?")) return;
    logout();
    router.push("/auth/login");
  };

  const joined = user.createdAt;

  return (
    <div className="max-w-[1400px] mx-auto w-full py-4 space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-[1.75rem] font-extrabold tracking-tight text-zinc-900 dark:text-white">Tài khoản</h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Quản lý thông tin cá nhân và lịch hẹn xem nhà của bạn</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* ═════ CỘT TRÁI ═════ */}
        <aside className="space-y-4 lg:sticky lg:top-4">
          <div className="p-5 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[17px] font-extrabold">
                  {initials(user.name)}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-extrabold text-zinc-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[12.5px] text-zinc-400 truncate">{user.phone || "Chưa có số điện thoại"}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                title="Chỉnh sửa thông tin"
                className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            <ul className="mt-5 space-y-3 text-[13px]">
              {[
                { icon: Mail, label: "Email", value: user.email },
                { icon: Phone, label: "Điện thoại", value: user.phone || "Chưa cập nhật" },
                { icon: MapPin, label: "Khu vực", value: user.address || "Chưa cập nhật" },
                {
                  icon: CalendarCheck,
                  label: "Ngày tham gia",
                  value: joined ? `${formatDate(joined)} · ${monthsSince(joined)} tháng` : "—",
                },
              ].map((row) => (
                <li key={row.label} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <row.icon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-400">{row.label}</p>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{row.value}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <QuickTile icon={CalendarDays} label="Lịch hẹn" value={appointments.length} />
              <QuickTile icon={Heart} label="BĐS đã lưu" value={favoriteIds.length} href="/favorites" />
              <QuickTile icon={LifeBuoy} label="Hỗ trợ" onClick={() => setDrawer("support")} />
              <QuickTile icon={FileText} label="Điều khoản dịch vụ" onClick={() => setDrawer("terms")} />
            </div>
          </div>

          {/* Tài khoản ngân hàng nhận tiền (API thật) */}
          <BankAccountSection userName={user.name} />

          {/* Đăng xuất */}
          <button
            type="button"
            onClick={handleLogout}
            className="group relative w-full h-24 rounded-xl overflow-hidden text-left cursor-pointer"
          >
            <img
              src={MOCK_PROPERTIES[0]?.thumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-linear-to-r from-zinc-900/80 via-zinc-900/50 to-zinc-900/10" />
            <span className="relative flex items-center gap-3.5 h-full px-5">
              <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-zinc-900 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Power className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-[15px] font-bold text-white">Đăng xuất</span>
                <span className="block text-[12px] text-white/70">Hẹn gặp lại bạn sớm</span>
              </span>
            </span>
          </button>
        </aside>

        {/* ═════ CỘT PHẢI: LỊCH HẸN ═════ */}
        <section className="p-5 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-[1.15rem] font-extrabold text-zinc-900 dark:text-white">Lịch hẹn xem nhà</h2>
            <div className="flex flex-wrap items-center gap-3">
              {(Object.keys(APPOINTMENT_STATUS) as AppointmentStatus[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400">
                  <span className={`w-2 h-2 rounded-full ${APPOINTMENT_STATUS[s].dot}`} />
                  {APPOINTMENT_STATUS[s].label}
                  <span className="font-bold text-zinc-900 dark:text-white tabular-nums">{statusCount[s]}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bộ lọc */}
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <CustomSelect
              options={monthOptions}
              value={monthFilter}
              onChange={(v) => {
                setMonthFilter(v);
                setPage(1);
              }}
            />
            <CustomSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v as "all" | AppointmentStatus);
                setPage(1);
              }}
            />
            <CustomSelect
              options={PAGE_SIZE_OPTIONS}
              value={String(pageSize)}
              onChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            />
          </div>

          {/* Bảng */}
          <div className="hidden md:grid grid-cols-[110px_80px_1fr_140px_44px] gap-4 px-1 pb-3 text-[12px] font-medium text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
            <span>Ngày</span>
            <span>Giờ</span>
            <span>Bất động sản</span>
            <span>Trạng thái</span>
            <span />
          </div>

          {visible.length === 0 ? (
            <div className="py-14 text-center">
              <CalendarDays className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
              <p className="mt-2 text-[13.5px] text-zinc-500 dark:text-zinc-400">Không có lịch hẹn nào khớp bộ lọc.</p>
            </div>
          ) : (
            <ul>
              {pageItems.map((apt) => {
                const property = getProperty(apt.propertyId);
                const open = expandedId === apt.id;
                return (
                  <li key={apt.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setExpandedId(open ? null : apt.id)}
                      className="w-full grid grid-cols-[1fr_auto] md:grid-cols-[110px_80px_1fr_140px_44px] items-center gap-x-4 gap-y-1 px-1 py-3.5 text-left cursor-pointer group"
                    >
                      <span className="text-[13px] font-semibold text-zinc-900 dark:text-white tabular-nums">
                        {formatDate(apt.date)}
                        <span className="md:hidden font-normal text-zinc-400"> · {apt.time}</span>
                      </span>
                      <span className="hidden md:flex items-center gap-1.5 text-[13px] text-zinc-600 dark:text-zinc-300 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {apt.time}
                      </span>
                      <span className="col-span-2 md:col-span-1 min-w-0 order-last md:order-0">
                        <span className="block text-[13px] font-semibold text-zinc-900 dark:text-white truncate">
                          {property?.title ?? "BĐS không còn tồn tại"}
                        </span>
                        <span className="block text-[12px] text-zinc-400 truncate">
                          {property ? `${property.district}, ${property.city}` : ""}
                        </span>
                      </span>
                      <span className="hidden md:block">
                        <StatusPill status={apt.status} />
                      </span>
                      <span className="flex items-center gap-2 justify-end">
                        <span className="md:hidden">
                          <StatusPill status={apt.status} />
                        </span>
                        <span
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                            open
                              ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 rotate-90"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"
                          }`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </span>
                    </button>

                    {open && <AppointmentDetail apt={apt} onCancel={() => cancelAppointment(apt.id)} />}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Phân trang */}
          {visible.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                Hiển thị <span className="font-semibold text-zinc-900 dark:text-white">{from}–{to}</span> trong{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">{visible.length}</span> lịch hẹn
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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
                  aria-label="Trang sau"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={{ name: user.name, email: user.email, phone: user.phone ?? "", address: user.address ?? "" }}
        onSave={updateProfile}
      />
      <InfoDrawer kind={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
};
