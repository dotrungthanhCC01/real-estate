"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  DollarSign,
  Home,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
  Crosshair,
  Sparkles,
  Ruler,
  DoorOpen,
  Plus,
  Info,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { VIETNAM_CITIES } from "@/features/properties/data/vietnamLocations";
import {
  LISTING_TYPE_LABEL,
  useCreateListing,
  useUpdateListing,
  type ListingInput,
  type BeListingType,
  type ManagedProperty,
} from "@/features/listings/api/listings.api";
import {
  AMENITY_GROUPS,
  BADGE_LABEL,
  DIRECTION_LABEL,
  POSTER_TYPE_LABEL,
  ROOM_TYPE_LABEL,
  getListingExtras,
  saveListingExtras,
  splitAmenities,
  type Badge,
  type Direction,
  type ListingExtras,
  type PosterType,
  type RoomType,
} from "@/features/landlord/lib/listingExtras";
import { getErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";

// Icon ghim mặc định của Leaflet (đường dẫn ảnh bị hỏng khi đóng gói)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Ảnh: BE nhận tối đa 10 ảnh/tin → 5 ảnh chung (thư viện ảnh) + 5 ảnh theo phòng
const MAX_TOTAL = 10;
const MAX_GALLERY = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputCls =
  "w-full px-3.5 h-11 rounded-xl border border-border bg-background text-[13.5px] text-foreground outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground";
const labelCls = "text-[12px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1";

/** ✦ = trường mở rộng, đang lưu tạm trên trình duyệt (BE chưa nhận) */
const Mock = () => (
  <span title="Lưu tạm trên trình duyệt — BE chưa hỗ trợ trường này" className="text-[#C9A253] cursor-help">
    ✦
  </span>
);

const Section = ({ icon: Icon, title, children }: { icon: typeof Home; title: string; children: React.ReactNode }) => (
  <section className="rounded-[20px] bg-card ring-1 ring-border/70 p-5 space-y-4">
    <h3 className="flex items-center gap-2 text-[14px] font-semibold">
      <Icon className="w-4 h-4 text-muted-foreground" /> {title}
    </h3>
    {children}
  </section>
);

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 h-8 rounded-full text-[12px] font-medium border transition-colors cursor-pointer",
      active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-foreground/40",
    )}
  >
    {children}
  </button>
);

const MapClick = ({ onPick }: { onPick: (p: [number, number]) => void }) => {
  useMapEvents({ click: (e) => onPick([+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)]) });
  return null;
};
const MapRecenter = ({ pos }: { pos: [number, number] }) => {
  const map = useMap();
  const [lat, lng] = pos;
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 14));
  }, [map, lat, lng]);
  return null;
};

const validImage = (f: File) => IMAGE_TYPES.includes(f.type) && f.size <= MAX_BYTES;
const numOrUndef = (v: string) => (v === "" ? undefined : Number(v));

interface RoomDraft {
  file: File;
  roomType: RoomType;
  name: string;
}

export interface PostListingResult {
  listing: ManagedProperty;
  failedImages: string[];
}

interface PostListingFormProps {
  onSuccess: (result: PostListingResult) => void;
  /** Có thì hiện nút Hủy (dùng trong modal) */
  onCancel?: () => void;
  /** Vùng nội dung cuộn riêng, chân form dính đáy (dùng trong modal) */
  scrollBody?: boolean;
  /** Có thì form ở chế độ SỬA tin này (PATCH /listings/:id) */
  initial?: ManagedProperty;
}

/**
 * Form đăng / sửa tin cho thuê — đủ trường theo `docs/listing-card-detail-spec.md`.
 * Trường BE đã có → gửi POST/PATCH /listings; trường ✦ → lưu tạm (listingExtras.ts) theo id tin.
 */
export const PostListingForm = ({ onSuccess, onCancel, scrollBody, initial }: PostListingFormProps) => {
  const create = useCreateListing();
  const update = useUpdateListing();
  const mutation = initial ? update : create;
  const initialExtras = useMemo(() => (initial ? getListingExtras(initial.id) : null), [initial]);
  const existingImages = (initial?.images ?? []).filter((u) => !u.includes("listing-placeholder"));

  // ── Thông tin cơ bản
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tagline, setTagline] = useState(initialExtras?.tagline ?? "");
  const [propertyType, setPropertyType] = useState<BeListingType | "">(initial?.propertyType ?? "");
  const [posterType, setPosterType] = useState<PosterType>(initialExtras?.posterType ?? "OWNER");
  const [badges, setBadges] = useState<Badge[]>(initialExtras?.badges ?? []);
  const [description, setDescription] = useState(initial?.description ?? "");
  // ── Thông số
  const [area, setArea] = useState(initial ? String(initial.area) : "");
  const [bedrooms, setBedrooms] = useState(initialExtras?.bedrooms != null ? String(initialExtras.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState(initialExtras?.bathrooms != null ? String(initialExtras.bathrooms) : "");
  const [parking, setParking] = useState(initialExtras?.parking != null ? String(initialExtras.parking) : "");
  const [direction, setDirection] = useState<Direction | "">(initialExtras?.direction ?? "");
  // ── Giá & vị trí
  const [price, setPrice] = useState(initial ? String(initial.priceVnd) : "");
  const [deposit, setDeposit] = useState(initial ? String(initial.depositAmountVnd) : "");
  const [city, setCity] = useState(initial?.city ?? "Hà Nội");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [ward, setWard] = useState(initialExtras?.ward ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [addressNote, setAddressNote] = useState(initialExtras?.addressNote ?? "");
  const [pos, setPos] = useState<[number, number]>(() =>
    initial ? [initial.lat, initial.lng] : (VIETNAM_CITIES.find((c) => c.name === "Hà Nội")?.center ?? [21.0285, 105.8542]),
  );
  // ── Tiện ích (gồm cả mã BE và mã mở rộng)
  const [amenities, setAmenities] = useState<string[]>(() => [...(initial?.amenityCodes ?? []), ...(initialExtras?.extraAmenities ?? [])]);
  // ── Ảnh
  const [files, setFiles] = useState<File[]>([]);
  const [rooms, setRooms] = useState<RoomDraft[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const roomSlots = MAX_TOTAL - existingImages.length - files.length;
  const gallerySlots = Math.min(MAX_GALLERY, MAX_TOTAL - existingImages.length - rooms.length) - files.length;

  const cityData = VIETNAM_CITIES.find((c) => c.name === city);
  const districtData = cityData?.districts.find((d) => d.name === district);
  const districtOptions = [
    ...(cityData?.districts.map((d) => d.name) ?? []),
    ...(initial && !cityData?.districts.some((d) => d.name === initial.district) ? [initial.district] : []),
  ];

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);
  const roomPreviews = useMemo(() => rooms.map((r) => URL.createObjectURL(r.file)), [rooms]);
  useEffect(() => () => roomPreviews.forEach(URL.revokeObjectURL), [roomPreviews]);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    const bad = picked.find((f) => !validImage(f));
    setFileError(bad ? `“${bad.name}” không hợp lệ: chỉ nhận JPG, PNG, WEBP tối đa 5 MB.` : null);
    setFiles((prev) => [...prev, ...picked.filter(validImage)].slice(0, prev.length + Math.max(0, gallerySlots)));
  };

  const addRoom = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    if (!validImage(f)) return setFileError(`“${f.name}” không hợp lệ: chỉ nhận JPG, PNG, WEBP tối đa 5 MB.`);
    setFileError(null);
    setRooms((prev) => [...prev, { file: f, roomType: "BEDROOM", name: "" }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const priceVnd = Number(price);
    const depositVnd = Number(deposit || price);
    if (title.trim().length < 5) return setFormError("Tiêu đề cần ít nhất 5 ký tự.");
    if (!propertyType) return setFormError("Chọn loại BĐS.");
    if (!district) return setFormError("Chọn quận / huyện.");
    if (!(priceVnd > 0) || !(depositVnd > 0)) return setFormError("Giá thuê và tiền cọc phải lớn hơn 0.");
    if (rooms.some((r) => !r.name.trim())) return setFormError("Đặt tên cho từng ảnh phòng (vd. Góc ngủ & bàn học).");

    const { be: beAmenities, extra: extraAmenities } = splitAmenities(amenities);
    const input: ListingInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      propertyType,
      priceVnd,
      depositAmountVnd: depositVnd,
      areaM2: Number(area),
      address: address.trim(),
      district,
      city,
      amenities: beAmenities,
      lat: pos[0],
      lng: pos[1],
    };

    // Ảnh chung tải trước, ảnh phòng tải sau → biết vị trí từng ảnh phòng trong images[] của BE
    const uploads = [...files, ...rooms.map((r) => r.file)];
    const roomOffset = existingImages.length + files.length;
    const extras: ListingExtras = {
      tagline: tagline.trim() || undefined,
      posterType,
      badges,
      bedrooms: numOrUndef(bedrooms),
      bathrooms: numOrUndef(bathrooms),
      parking: numOrUndef(parking),
      direction: direction || undefined,
      ward: ward.trim() || undefined,
      addressNote: addressNote.trim() || undefined,
      extraAmenities,
      roomImages: [
        ...(initialExtras?.roomImages ?? []),
        ...rooms.map((r, i) => ({ position: roomOffset + i, roomType: r.roomType, name: r.name.trim() })),
      ],
    };
    const done = (result: PostListingResult) => {
      saveListingExtras(result.listing.id, extras);
      onSuccess(result);
    };

    if (initial) {
      // Chỉ gửi lên BE trường đã đổi; trường ✦ luôn lưu tạm
      const before: ListingInput = {
        title: initial.title,
        description: initial.description || undefined,
        propertyType: initial.propertyType,
        priceVnd: initial.priceVnd,
        depositAmountVnd: initial.depositAmountVnd,
        areaM2: initial.area,
        address: initial.address,
        district: initial.district,
        city: initial.city,
        amenities: initial.amenityCodes,
        lat: initial.lat,
        lng: initial.lng,
      };
      const changes = Object.fromEntries(
        (Object.keys(input) as (keyof ListingInput)[])
          .filter((k) => JSON.stringify(input[k]) !== JSON.stringify(before[k]))
          .map((k) => [k, input[k]]),
      ) as Partial<ListingInput>;
      update.mutate({ id: initial.id, changes, files: uploads }, { onSuccess: done });
      return;
    }

    create.mutate({ input, files: uploads }, { onSuccess: done });
  };

  const error = formError ?? (mutation.isError ? getErrorMessage(mutation.error) : null);

  return (
    <form onSubmit={handleSubmit} className={cn(scrollBody && "flex min-h-0 flex-1 flex-col")}>
      <div className={cn("space-y-4", scrollBody && "min-h-0 flex-1 overflow-y-auto px-6 py-5")}>
        <p className="flex items-start gap-2 rounded-2xl bg-secondary px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 mt-px" />
          <span>
            Trường có dấu <Mock /> đang <b>lưu tạm trên trình duyệt</b> (BE chưa hỗ trợ). Các trường còn lại được lưu lên hệ thống.
            {initial && (
              <>
                {" "}
                Sửa <b>tiêu đề, mô tả, loại, địa chỉ, vị trí</b> hoặc <b>thêm ảnh</b> → tin về <b>Chờ duyệt</b>, admin duyệt lại mới hiển thị.
              </>
            )}
          </span>
        </p>

        {/* ── Thông tin cơ bản ── */}
        <Section icon={Home} title="Thông tin cơ bản">
          <div>
            <label className={labelCls}>Loại tin</label>
            <div className="flex gap-2">
              <Chip active onClick={() => {}}>Cho thuê</Chip>
              <span title="BE hiện chỉ hỗ trợ tin cho thuê" className="px-3 h-8 rounded-full text-[12px] font-medium border border-dashed border-border text-muted-foreground flex items-center cursor-not-allowed">
                Cần bán (chờ BE)
              </span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Tiêu đề tin đăng * (5–200 ký tự)</label>
            <input required minLength={5} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Studio hiện đại gần ĐH Quốc Gia" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>
              Câu giới thiệu ngắn <Mock /> <span className="ml-auto tabular-nums">{tagline.length}/120</span>
            </label>
            <input maxLength={120} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="VD: Phòng Studio full nội thất, giờ giấc tự do" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Loại BĐS *</label>
              <select required value={propertyType} onChange={(e) => setPropertyType(e.target.value as BeListingType)} className={cn(inputCls, "cursor-pointer")}>
                <option value="">Chọn loại...</option>
                {(Object.keys(LISTING_TYPE_LABEL) as BeListingType[]).map((t) => (
                  <option key={t} value={t}>
                    {LISTING_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Nguồn đăng <Mock />
              </label>
              <select value={posterType} onChange={(e) => setPosterType(e.target.value as PosterType)} className={cn(inputCls, "cursor-pointer")}>
                {(Object.keys(POSTER_TYPE_LABEL) as PosterType[]).map((t) => (
                  <option key={t} value={t}>
                    {POSTER_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>
              Nhãn tin <Mock />
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BADGE_LABEL) as Badge[]).map((b) => (
                <Chip key={b} active={badges.includes(b)} onClick={() => setBadges((prev) => toggle(prev, b))}>
                  {BADGE_LABEL[b]}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Mô tả bất động sản</label>
            <textarea rows={4} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả về phòng, nội thất, vị trí, tiện ích xung quanh..." className={cn(inputCls, "h-auto py-2.5 resize-none")} />
          </div>
        </Section>

        {/* ── Thông số ── */}
        <Section icon={Ruler} title="Thông số">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Diện tích (m²) *</label>
              <input required type="number" step="0.1" min="0.1" value={area} onChange={(e) => setArea(e.target.value)} placeholder="28" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Phòng ngủ <Mock />
              </label>
              <input type="number" min="0" max="50" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="0 = studio" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Phòng tắm <Mock />
              </label>
              <input type="number" min="0" max="50" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="1" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Chỗ để xe <Mock />
              </label>
              <input type="number" min="0" max="100" value={parking} onChange={(e) => setParking(e.target.value)} placeholder="1" className={inputCls} />
            </div>
          </div>
          <div className="sm:w-1/2">
            <label className={labelCls}>
              Hướng nhà <Mock />
            </label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as Direction | "")} className={cn(inputCls, "cursor-pointer")}>
              <option value="">Không rõ</option>
              {(Object.keys(DIRECTION_LABEL) as Direction[]).map((d) => (
                <option key={d} value={d}>
                  {DIRECTION_LABEL[d]}
                </option>
              ))}
            </select>
          </div>
        </Section>

        {/* ── Giá & vị trí ── */}
        <Section icon={DollarSign} title="Giá & vị trí">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Giá thuê / tháng (₫) *</label>
              <input required type="number" min="1" step="1000" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4200000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tiền cọc (₫)</label>
              <input type="number" min="1" step="1000" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder={price ? `Mặc định 1 tháng (${Number(price).toLocaleString("vi-VN")})` : "8400000"} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Tỉnh / Thành phố *</label>
              <select
                value={city}
                onChange={(e) => {
                  const c = VIETNAM_CITIES.find((x) => x.name === e.target.value);
                  setCity(e.target.value);
                  setDistrict("");
                  setWard("");
                  if (c) setPos(c.center);
                }}
                className={cn(inputCls, "cursor-pointer")}
              >
                {VIETNAM_CITIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Quận / Huyện *</label>
              <select
                required
                value={district}
                onChange={(e) => {
                  const d = cityData?.districts.find((x) => x.name === e.target.value);
                  setDistrict(e.target.value);
                  setWard("");
                  if (d) setPos(d.center);
                }}
                className={cn(inputCls, "cursor-pointer")}
              >
                <option value="">Chọn quận...</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Phường / Xã <Mock />
              </label>
              {districtData?.wards.length ? (
                <select value={ward} onChange={(e) => setWard(e.target.value)} className={cn(inputCls, "cursor-pointer")}>
                  <option value="">Chọn phường...</option>
                  {districtData.wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input maxLength={100} value={ward} onChange={(e) => setWard(e.target.value)} placeholder="VD: Phường Linh Trung" className={inputCls} />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                <MapPin size={11} /> Địa chỉ cụ thể * (số nhà, đường)
              </label>
              <input required maxLength={300} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="VD: Đường số 6" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Mốc gần đó <Mock />
              </label>
              <input maxLength={120} value={addressNote} onChange={(e) => setAddressNote(e.target.value)} placeholder="VD: Cạnh KTX Khu B ĐHQG" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>
              <Crosshair size={11} /> Vị trí trên bản đồ * — bấm vào bản đồ để đặt ghim
            </label>
            <MapContainer center={pos} zoom={14} className="h-52 w-full rounded-xl z-0" scrollWheelZoom>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <Marker position={pos} />
              <MapClick onPick={setPos} />
              <MapRecenter pos={pos} />
            </MapContainer>
            <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
              {pos[0]}, {pos[1]}
            </p>
          </div>
        </Section>

        {/* ── Tiện ích & Đặc quyền ── */}
        <Section icon={Sparkles} title={`Tiện ích & Đặc quyền (${amenities.length})`}>
          <p className="-mt-2 text-[11.5px] text-muted-foreground">
            Tiện ích có <Mock /> lưu tạm; 11 tiện ích còn lại được lưu lên hệ thống.
          </p>
          {AMENITY_GROUPS.map((g) => (
            <div key={g.group}>
              <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((a) => (
                  <Chip key={a.code} active={amenities.includes(a.code)} onClick={() => setAmenities((prev) => toggle(prev, a.code))}>
                    {a.label}
                    {!a.be && <span className="ml-1 text-[#C9A253]">✦</span>}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </Section>

        {/* ── Hình ảnh ── */}
        <Section icon={ImageIcon} title={`Thư viện ảnh (${files.length}/${MAX_GALLERY} ảnh mới)`}>
          {existingImages.length > 0 && (
            <div>
              <p className="mb-2 text-[11.5px] text-muted-foreground">Ảnh đã có ({existingImages.length})</p>
              <div className="grid grid-cols-5 gap-2">
                {existingImages.map((src) => (
                  <div key={src} className="aspect-square rounded-xl overflow-hidden bg-secondary ring-1 ring-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {files.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && !existingImages.length && <span className="absolute bottom-1 left-1 px-1.5 rounded bg-black/60 text-white text-[9px] font-semibold">Ảnh bìa</span>}
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
                    aria-label="Bỏ ảnh"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {gallerySlots > 0 && (
            <label className="block border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-foreground/40 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept={IMAGE_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <ImageIcon size={20} className="text-muted-foreground mx-auto mb-1.5" />
              <p className="text-[13px]">
                <span className="font-semibold underline underline-offset-2">Chọn ảnh</span> — còn {gallerySlots} ảnh
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tối đa {MAX_GALLERY} ảnh chung · JPG, PNG, WEBP · mỗi ảnh 5 MB · ảnh đầu là ảnh bìa</p>
            </label>
          )}
        </Section>

        <Section icon={DoorOpen} title={`Không gian thực tế các phòng (${rooms.length + (initialExtras?.roomImages.length ?? 0)})`}>
          <p className="-mt-2 text-[11.5px] text-muted-foreground">
            Ảnh tải lên hệ thống; loại phòng và tên phòng <Mock /> lưu tạm. VD: Góc ngủ & bàn học, Khu vực bếp nấu, Phòng tắm khép kín.
          </p>
          {(initialExtras?.roomImages.length ?? 0) > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {initialExtras!.roomImages.map((r) => (
                <div key={r.position} className="rounded-xl bg-background p-1.5">
                  {existingImages[r.position] && <img src={existingImages[r.position]} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />}
                  <p className="mt-1 px-1 text-[11.5px] font-medium truncate">{r.name}</p>
                  <p className="px-1 text-[10.5px] text-muted-foreground">{ROOM_TYPE_LABEL[r.roomType]}</p>
                </div>
              ))}
            </div>
          )}
          {rooms.map((r, i) => (
            <div key={roomPreviews[i]} className="flex items-center gap-3 rounded-2xl bg-background p-2">
              <img src={roomPreviews[i]} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
              <select
                value={r.roomType}
                onChange={(e) => setRooms((prev) => prev.map((x, j) => (j === i ? { ...x, roomType: e.target.value as RoomType } : x)))}
                className={cn(inputCls, "w-40 h-10 cursor-pointer")}
              >
                {(Object.keys(ROOM_TYPE_LABEL) as RoomType[]).map((t) => (
                  <option key={t} value={t}>
                    {ROOM_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
              <input
                maxLength={60}
                value={r.name}
                onChange={(e) => setRooms((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                placeholder="Tên phòng, vd. Góc ngủ & bàn học"
                className={cn(inputCls, "h-10 flex-1")}
              />
              <button
                type="button"
                onClick={() => setRooms((prev) => prev.filter((_, j) => j !== i))}
                className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Bỏ ảnh phòng"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {roomSlots > 0 && (
            <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border text-[13px] font-medium hover:border-foreground/40 cursor-pointer">
              <input
                type="file"
                accept={IMAGE_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  addRoom(e.target.files);
                  e.target.value = "";
                }}
              />
              <Plus className="w-4 h-4" /> Thêm ảnh phòng
            </label>
          )}
          {fileError && <p className="text-[12px] text-[#86402F]">{fileError}</p>}
          <p className="text-[11px] text-muted-foreground">Tổng ảnh tối đa {MAX_TOTAL}/tin (giới hạn của hệ thống).</p>
        </Section>

        {error && (
          <div role="alert" className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-[#F1DDD5] text-[13px] text-[#86402F] dark:bg-[#38221C] dark:text-[#E3AE9F]">
            <AlertCircle size={15} className="shrink-0 mt-px" /> {error}
          </div>
        )}
      </div>

      <div className={cn("flex items-center justify-end gap-2 pt-4", scrollBody && "border-t border-border bg-card px-6 py-4")}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 h-11 rounded-full text-[13px] font-medium hover:bg-secondary cursor-pointer">
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center justify-center gap-2 px-6 h-11 rounded-full bg-primary text-primary-foreground text-[13.5px] font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {mutation.isPending ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Gửi tin để duyệt"}
        </button>
      </div>
    </form>
  );
};
