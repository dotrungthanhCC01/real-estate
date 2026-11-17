// ─── Mock lịch hẹn xem nhà của người dùng (demo / prototype) ───────────────────
// Khi có API: thay bằng GET /me/appointments, giữ nguyên kiểu Appointment.

export type AppointmentStatus = "scheduled" | "visited" | "cancelled";

export interface Appointment {
  id: string;
  propertyId: string; // tham chiếu MOCK_PROPERTIES
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  note?: string;
}

export const APPOINTMENT_STATUS: Record<
  AppointmentStatus,
  { label: string; className: string; dot: string }
> = {
  // Tông đen – trắng – xám của web, chỉ chấm tròn có chút màu để phân biệt nhanh
  scheduled: {
    label: "Đã đặt lịch",
    className: "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
    dot: "bg-amber-400",
  },
  visited: {
    label: "Đã đến xem",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-600 dark:text-zinc-500",
    dot: "bg-zinc-300 dark:bg-zinc-600",
  },
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "apt-08", propertyId: "prop-001", date: "2026-11-24", time: "09:30", status: "scheduled", note: "Muốn xem thêm hầm gửi xe" },
  { id: "apt-07", propertyId: "prop-007", date: "2026-11-20", time: "17:00", status: "scheduled" },
  { id: "apt-06", propertyId: "prop-003", date: "2026-11-12", time: "10:00", status: "visited", note: "Căn đẹp, cần hỏi lại giá" },
  { id: "apt-05", propertyId: "prop-008", date: "2026-11-05", time: "14:30", status: "cancelled", note: "Trùng lịch công tác" },
  { id: "apt-04", propertyId: "prop-002", date: "2026-10-28", time: "11:00", status: "visited" },
  { id: "apt-03", propertyId: "prop-005", date: "2026-10-15", time: "15:00", status: "visited" },
  { id: "apt-02", propertyId: "prop-009", date: "2026-10-03", time: "08:30", status: "cancelled" },
  { id: "apt-01", propertyId: "prop-004", date: "2026-09-21", time: "16:00", status: "visited" },
];
