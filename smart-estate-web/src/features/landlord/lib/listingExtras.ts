/**
 * Trường mở rộng của tin đăng theo đặc tả `docs/listing-card-detail-spec.md`.
 *
 * ⚠ MOCK — BE (service listing) chưa nhận các trường này (gửi lên sẽ bị 400 VALIDATION_FAILED vì
 * forbidNonWhitelisted). Tạm lưu ở localStorage của trình duyệt theo id tin.
 * Khi BE hỗ trợ: gửi `ListingExtras` cùng body POST/PATCH /listings và đọc lại từ response,
 * rồi bỏ phần localStorage ở cuối file.
 */
import type { BeAmenity } from "@/features/listings/api/listings.api";

export type PosterType = "OWNER" | "BROKER" | "DEVELOPER";
export type Badge = "FEATURED" | "POPULAR" | "RECOMMENDED";
export type Direction = "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";
export type RoomType = "BEDROOM" | "LIVING_ROOM" | "KITCHEN" | "BATHROOM" | "WORKSPACE" | "BALCONY" | "OTHER";

export interface RoomImageMeta {
  /** Vị trí ảnh trong `images[]` của BE (ảnh phòng được tải lên chung danh sách ảnh) */
  position: number;
  roomType: RoomType;
  name: string;
}

export interface ListingExtras {
  tagline?: string;
  posterType: PosterType;
  badges: Badge[];
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  direction?: Direction;
  ward?: string;
  addressNote?: string;
  /** Tiện ích ngoài 11 mã BE đang nhận */
  extraAmenities: string[];
  roomImages: RoomImageMeta[];
}

export const EMPTY_EXTRAS: ListingExtras = { posterType: "OWNER", badges: [], extraAmenities: [], roomImages: [] };

// ─── Danh mục (đặc tả mục 3) ────────────────────────────────────────────────
export const POSTER_TYPE_LABEL: Record<PosterType, string> = {
  OWNER: "Chính chủ",
  BROKER: "Môi giới",
  DEVELOPER: "Chủ đầu tư",
};

export const BADGE_LABEL: Record<Badge, string> = {
  FEATURED: "Nổi bật",
  POPULAR: "Phổ biến",
  RECOMMENDED: "Đề xuất",
};

export const DIRECTION_LABEL: Record<Direction, string> = {
  N: "Bắc",
  S: "Nam",
  E: "Đông",
  W: "Tây",
  NE: "Đông Bắc",
  NW: "Tây Bắc",
  SE: "Đông Nam",
  SW: "Tây Nam",
};

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  BEDROOM: "Phòng ngủ",
  LIVING_ROOM: "Phòng khách",
  KITCHEN: "Bếp",
  BATHROOM: "Phòng tắm",
  WORKSPACE: "Góc làm việc",
  BALCONY: "Ban công / sân thượng",
  OTHER: "Khác",
};

/** 32 tiện ích theo nhóm; `be: true` = BE đã nhận mã này (gửi lên API), còn lại lưu tạm */
export const AMENITY_GROUPS: { group: string; items: { code: string; label: string; be?: boolean }[] }[] = [
  {
    group: "Trong phòng",
    items: [
      { code: "AIR_CONDITIONER", label: "Điều hòa", be: true },
      { code: "WATER_HEATER", label: "Nóng lạnh", be: true },
      { code: "WASHING_MACHINE", label: "Máy giặt riêng", be: true },
      { code: "FRIDGE", label: "Tủ lạnh", be: true },
      { code: "KITCHEN", label: "Bếp riêng" },
      { code: "WORK_DESK", label: "Bàn học / làm việc" },
      { code: "LOFT", label: "Gác xép" },
      { code: "PRIVATE_BATHROOM", label: "WC khép kín", be: true },
      { code: "BALCONY", label: "Ban công riêng", be: true },
      { code: "FURNISHED", label: "Nội thất đầy đủ", be: true },
      { code: "SMART_HOME", label: "Smart Home" },
      { code: "WIFI", label: "Wifi tốc độ cao", be: true },
    ],
  },
  {
    group: "An ninh",
    items: [
      { code: "SMART_LOCK", label: "Khóa vân tay / thẻ từ" },
      { code: "SECURITY_24H", label: "Bảo vệ 24/7" },
      { code: "CCTV", label: "Camera 24/7" },
      { code: "RECEPTION_24H", label: "Lễ tân 24/7" },
    ],
  },
  {
    group: "Tòa nhà & khu",
    items: [
      { code: "ELEVATOR", label: "Thang máy", be: true },
      { code: "PARKING", label: "Bãi đỗ xe", be: true },
      { code: "SWIMMING_POOL", label: "Hồ bơi" },
      { code: "GYM", label: "Phòng gym / yoga" },
      { code: "BBQ", label: "Khu nướng BBQ" },
      { code: "GARDEN", label: "Vườn / công viên" },
      { code: "KIDS_PLAYGROUND", label: "Khu vui chơi trẻ em" },
      { code: "SPORTS_COURT", label: "Sân thể thao" },
      { code: "VIEW", label: "Tầm nhìn đẹp" },
    ],
  },
  {
    group: "Quy định",
    items: [
      { code: "PET_ALLOWED", label: "Cho nuôi thú cưng", be: true },
      { code: "FREE_HOURS", label: "Giờ giấc tự do" },
      { code: "NO_LANDLORD", label: "Không chung chủ" },
    ],
  },
  {
    group: "Vị trí",
    items: [
      { code: "NEAR_METRO", label: "Gần ga metro" },
      { code: "NEAR_UNIVERSITY", label: "Gần trường đại học" },
      { code: "NEAR_SCHOOL", label: "Gần trường học" },
      { code: "NEAR_SUPERMARKET", label: "Gần siêu thị" },
    ],
  },
];

const BE_CODES = new Set(AMENITY_GROUPS.flatMap((g) => g.items.filter((i) => i.be).map((i) => i.code)));
export const AMENITY_FULL_LABEL: Record<string, string> = Object.fromEntries(
  AMENITY_GROUPS.flatMap((g) => g.items.map((i) => [i.code, i.label])),
);

/** Tách danh sách tiện ích đã chọn: phần gửi BE và phần lưu tạm */
export const splitAmenities = (codes: string[]) => ({
  be: codes.filter((c) => BE_CODES.has(c)) as BeAmenity[],
  extra: codes.filter((c) => !BE_CODES.has(c)),
});

// ─── Lưu tạm (localStorage) ─────────────────────────────────────────────────
const STORAGE_KEY = "smart_estate_listing_extras";

const readAll = (): Record<string, ListingExtras> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

export const getListingExtras = (listingId: string): ListingExtras => ({ ...EMPTY_EXTRAS, ...readAll()[listingId] });

export const saveListingExtras = (listingId: string, extras: ListingExtras) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [listingId]: extras }));
  } catch {
    // trình duyệt chặn lưu trữ → bỏ qua (dữ liệu mock)
  }
};
