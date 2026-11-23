import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/axios";
/**
 * API BĐS (service listing của BE, qua gateway /api/v1/listings).
 * BE gọi một BĐS là `listing` = sản phẩm cho thuê (không phải bài blog).
 * Hiện chỉ khu chủ trọ dùng; các trang người dùng vẫn chạy dữ liệu giả.
 */

// ─── Kiểu dữ liệu BE ─────────────────────────────────────────────────────────
export type BeListingType = "ROOM" | "APARTMENT" | "HOUSE";
export type BeListingStatus = "AVAILABLE" | "HELD" | "DEPOSITED" | "RENTED" | "HIDDEN";
export type BeApprovalStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export const BE_AMENITIES = [
  "AIR_CONDITIONER",
  "WATER_HEATER",
  "WASHING_MACHINE",
  "FRIDGE",
  "WIFI",
  "PARKING",
  "ELEVATOR",
  "PRIVATE_BATHROOM",
  "BALCONY",
  "FURNISHED",
  "PET_ALLOWED",
] as const;
export type BeAmenity = (typeof BE_AMENITIES)[number];

export const AMENITY_LABEL: Record<BeAmenity, string> = {
  AIR_CONDITIONER: "Điều hòa",
  WATER_HEATER: "Nóng lạnh",
  WASHING_MACHINE: "Máy giặt",
  FRIDGE: "Tủ lạnh",
  WIFI: "Wifi",
  PARKING: "Chỗ để xe",
  ELEVATOR: "Thang máy",
  PRIVATE_BATHROOM: "WC riêng",
  BALCONY: "Ban công",
  FURNISHED: "Đầy đủ nội thất",
  PET_ALLOWED: "Cho nuôi thú cưng",
};

export const LISTING_TYPE_LABEL: Record<BeListingType, string> = {
  ROOM: "Phòng trọ",
  APARTMENT: "Căn hộ",
  HOUSE: "Nhà nguyên căn",
};

/** Trường chung của tìm kiếm (ListingSummaryDto) và chi tiết (ListingDto) */
export interface BeListing {
  id: string;
  ownerId: string;
  title: string;
  description?: string | null;
  propertyType: BeListingType;
  priceVnd: number;
  depositAmountVnd: number;
  areaM2: number;
  address: string;
  district: string;
  city: string;
  amenities: BeAmenity[];
  lat: number;
  lng: number;
  status: BeListingStatus;
  createdAt: string;
  updatedAt?: string;
  /** Chi tiết, "của tôi" */
  approvalStatus?: BeApprovalStatus;
  rejectReason?: string | null;
  images?: { id: string; url: string }[];
  /** Tìm kiếm */
  coverImageUrl?: string | null;
  distanceM?: number;
}

export interface ListingInput {
  title: string;
  description?: string;
  propertyType: BeListingType;
  priceVnd: number;
  depositAmountVnd: number;
  areaM2: number;
  address: string;
  district: string;
  city: string;
  amenities?: BeAmenity[];
  lat: number;
  lng: number;
}

/**
 * Tin đăng đã đổi sang dạng giao diện chủ trọ dùng.
 * Kiểu riêng, KHÔNG phụ thuộc `Property` (dữ liệu giả) của các trang người dùng.
 */
export interface ManagedProperty {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  priceVnd: number;
  depositAmountVnd: number;
  propertyType: BeListingType;
  propertyTypeLabel: string;
  beStatus: BeListingStatus;
  approvalStatus?: BeApprovalStatus;
  rejectReason?: string | null;
  area: number;
  address: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  /** Nhãn tiếng Việt */
  amenities: string[];
  /** Mã BE (WIFI, PARKING...) */
  amenityCodes: BeAmenity[];
  images: string[];
  thumbnailUrl: string;
  postedAt: string;
  updatedAt?: string;
  isNew: boolean;
  distanceM?: number;
}

// ─── Đổi BE → giao diện ──────────────────────────────────────────────────────
export const LISTING_PLACEHOLDER = "/images/listing-placeholder.svg";

const WEEK_MS = 7 * 24 * 3600 * 1000;

export const toProperty = (l: BeListing): ManagedProperty => {
  const images = l.images?.map((i) => i.url) ?? (l.coverImageUrl ? [l.coverImageUrl] : []);
  return {
    id: l.id,
    ownerId: l.ownerId,
    title: l.title,
    description: l.description ?? "",
    priceVnd: l.priceVnd,
    depositAmountVnd: l.depositAmountVnd,
    propertyType: l.propertyType,
    propertyTypeLabel: LISTING_TYPE_LABEL[l.propertyType],
    beStatus: l.status,
    approvalStatus: l.approvalStatus,
    rejectReason: l.rejectReason,
    area: l.areaM2,
    address: l.address,
    district: l.district,
    city: l.city,
    lat: l.lat,
    lng: l.lng,
    amenities: l.amenities.map((a) => AMENITY_LABEL[a] ?? a),
    amenityCodes: l.amenities,
    images: images.length ? images : [LISTING_PLACEHOLDER],
    thumbnailUrl: l.coverImageUrl ?? images[0] ?? LISTING_PLACEHOLDER,
    postedAt: l.createdAt,
    updatedAt: l.updatedAt,
    isNew: Date.now() - Date.parse(l.createdAt) < WEEK_MS,
    distanceM: l.distanceM,
  };
};

// ─── Gọi API ─────────────────────────────────────────────────────────────────
export interface ListingSearchParams {
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  /** So khớp đúng chuỗi, có dấu (vd. "Hai Bà Trưng") */
  district?: string;
  amenities?: BeAmenity[];
  available?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "distance";
}

const toQuery = (p: ListingSearchParams, page: number, pageSize: number) => ({
  ...p,
  amenities: p.amenities?.length ? p.amenities.join(",") : undefined,
  page,
  pageSize,
});

/** GET /listings, gom mọi trang (tối đa 10 × 50 tin) để giao diện lọc thêm các tiêu chí BE chưa hỗ trợ. */
export const fetchAllListings = async (params: ListingSearchParams = {}) => {
  const all: ManagedProperty[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api.get<BeListing[]>("/listings", { params: toQuery(params, page, 50) });
    all.push(...res.data.map(toProperty));
    if (page >= (res.meta.totalPages ?? 1)) break;
  }
  return all;
};

export const fetchListing = async (id: string) => toProperty((await api.get<BeListing>(`/listings/${id}`)).data);

/** id của BE là UUID; id cũ của dữ liệu mẫu ("1", "2"...) bỏ qua để khỏi gọi API lỗi 400 */
export const isListingId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// ─── Hook: người thuê / khách ───────────────────────────────────────────────
export const useListings = (params: ListingSearchParams = {}) =>
  useQuery({ queryKey: ["listings", "search", params], queryFn: () => fetchAllListings(params), staleTime: 60_000 });

export const useListing = (id: string | undefined) =>
  useQuery({
    queryKey: ["listings", "detail", id],
    queryFn: () => fetchListing(id!),
    enabled: !!id && isListingId(id),
    retry: false,
  });

/** Lấy nhiều tin theo id (yêu thích, so sánh) */
export const useListingsByIds = (ids: string[]) => {
  const valid = ids.filter(isListingId);
  return useQuery({
    queryKey: ["listings", "byIds", valid],
    queryFn: async () => {
      const results = await Promise.allSettled(valid.map(fetchListing));
      return results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    },
    enabled: valid.length > 0,
    placeholderData: (prev) => prev,
  });
};

// ─── Hook: chủ trọ ───────────────────────────────────────────────────────────
const MINE_KEY = ["listings", "mine"] as const;

export const useMyListings = () =>
  useQuery({
    queryKey: MINE_KEY,
    queryFn: async () => {
      const all: ManagedProperty[] = [];
      for (let page = 1; page <= 10; page++) {
        const res = await api.get<BeListing[]>("/listings/mine", { params: { page, pageSize: 50 } });
        all.push(...res.data.map(toProperty));
        if (page >= (res.meta.totalPages ?? 1)) break;
      }
      return all;
    },
  });

const useInvalidateListings = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["listings"] });
};

/** Ẩn / hiện / xóa tin của tôi */
export const useListingAction = () => {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "hide" | "unhide" | "delete" }) =>
      action === "delete" ? api.delete(`/listings/${id}`) : api.post(`/listings/${id}/${action}`),
    onSuccess: invalidate,
  });
};

/** Tải một ảnh: xin presigned URL → PUT thẳng lên S3 → báo BE xác nhận */
export const uploadListingImage = async (listingId: string, file: File) => {
  const { uploadUrl, key } = (
    await api.post<{ uploadUrl: string; key: string }>(`/listings/${listingId}/images/upload-url`, {
      contentType: file.type,
    })
  ).data;
  await axios.put(uploadUrl, file, { headers: { "Content-Type": file.type } });
  await api.post(`/listings/${listingId}/images`, { key });
};

/**
 * Sửa tin: PATCH /listings/:id (chỉ gửi trường thay đổi) + tải thêm ảnh mới.
 * BE: sửa tiêu đề, mô tả, loại, địa chỉ, vị trí hoặc thêm ảnh → tin về PENDING_REVIEW (admin duyệt lại);
 * chỉ sửa giá, tiền cọc, diện tích, tiện ích → giữ trạng thái duyệt.
 */
export const useUpdateListing = () => {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: async ({ id, changes, files }: { id: string; changes: Partial<ListingInput>; files: File[] }) => {
      const failed: string[] = [];
      if (Object.keys(changes).length) await api.patch<BeListing>(`/listings/${id}`, changes);
      for (const f of files) {
        try {
          await uploadListingImage(id, f);
        } catch {
          failed.push(f.name);
        }
      }
      const latest = toProperty((await api.get<BeListing[]>("/listings/mine", { params: { page: 1, pageSize: 50 } })).data.find((l) => l.id === id)!);
      return { listing: latest, failedImages: failed };
    },
    onSuccess: invalidate,
  });
};

/** Đăng tin mới (+ ảnh). Tin mới ở trạng thái chờ duyệt. */
export const useCreateListing = () => {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: async ({ input, files }: { input: ListingInput; files: File[] }) => {
      const created = (await api.post<BeListing>("/listings", input)).data;
      const failed: string[] = [];
      for (const f of files) {
        try {
          await uploadListingImage(created.id, f);
        } catch {
          failed.push(f.name);
        }
      }
      return { listing: toProperty(created), failedImages: failed };
    },
    onSuccess: invalidate,
  });
};
