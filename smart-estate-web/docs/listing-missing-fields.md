# Đặc tả bổ sung API Listing cho giao diện web và App

> Service: `listing` · Gateway: `/api/v1` · Phiên bản: 2026-11-21
> Tài liệu liệt kê các trường cần thêm vào API listing hiện có để giao diện web (`smart-estate-web`)
> và App (`EstateApp`) hiển thị đầy đủ. Trường đã có của BE giữ nguyên, không đổi tên.

## 1. Trường mới của tin đăng

| Trường | Kiểu | Bắt buộc | Ràng buộc | Người nhập | Hiển thị |
|---|---|---|---|---|---|
| `tagline` | string | Không | ≤ 120 ký tự | Chủ trọ | Dòng giới thiệu ngắn dưới tiêu đề (card, chi tiết). Khác `description` (mô tả dài) |
| `posterType` | enum | Không, mặc định `OWNER` | `OWNER`, `BROKER`, `DEVELOPER` | Chủ trọ | Nhãn "Chính chủ / Môi giới / Chủ đầu tư", bộ lọc nguồn tin, trang So sánh |
| `badges` | enum[] | Không, mặc định `[]` | Mỗi phần tử thuộc `FEATURED`, `POPULAR`, `RECOMMENDED`; không trùng | Chủ trọ | Nhãn trên card; các mục trang chủ "Nổi bật", "Phổ biến nhất", "Đề xuất cho bạn" |
| `bedrooms` | int | Không | 0–50 (0 = studio / phòng đơn) | Chủ trọ | Card, chi tiết, so sánh, bộ lọc |
| `bathrooms` | int | Không | 0–50 | Chủ trọ | Card, chi tiết, so sánh |
| `parking` | int | Không | 0–100 | Chủ trọ | Ô thông số trang chi tiết |
| `ward` | string | Không | ≤ 100 ký tự | Chủ trọ | Địa chỉ, bộ lọc phường/xã |
| `images[].caption` | string | Không | ≤ 100 ký tự, vd. "Phòng ngủ", "Bếp" | Chủ trọ (khi xác nhận ảnh) | Mục "Không gian thực tế các phòng" |
| `owner` | object | Có (chỉ trong response) | Xem mục 2 | BE lấy từ identity | Khối thông tin chủ trọ ở trang chi tiết |

Quy tắc:

- `tagline`, `posterType`, `badges`, `bedrooms`, `bathrooms`, `parking`, `ward` nhận trong body `POST /listings` và `PATCH /listings/:id`.
- Admin duyệt / từ chối tin như hiện tại; không sửa các trường trên.
- Sửa `tagline` đưa tin đã duyệt về `PENDING_REVIEW` (cùng nhóm với `title`, `description`). Sửa các trường còn lại giữ nguyên trạng thái duyệt.
- `images[].caption` gửi kèm `POST /listings/:id/images`: body `{ "key": "...", "caption": "Phòng ngủ" }`.

## 2. Thông tin chủ trọ (`owner`)

Trả trong `GET /listings/:id`. Listing lấy từ identity qua API nội bộ (đề xuất `GET /internal/users/:id/public-profile`).

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `owner.id` | uuid | Trùng `ownerId` |
| `owner.fullName` | string | |
| `owner.email` | string | Hiển thị dưới tên chủ trọ |
| `owner.phone` | string \| null | `null` khi người xem chưa đăng nhập hoặc chủ trọ chưa khai số |
| `owner.avatarUrl` | string \| null | `null` khi chưa có ảnh đại diện |

## 3. Request đăng tin

`POST /api/v1/listings` — quyền `LANDLORD`

```json
{
  "title": "Phòng trọ gần ĐH Bách Khoa, có gác xép",
  "tagline": "Phòng mới sửa, giờ giấc tự do, 5 phút tới trường",
  "description": "Phòng 22 m² có gác xép, cửa sổ thoáng...",
  "propertyType": "ROOM",
  "posterType": "OWNER",
  "badges": ["FEATURED"],
  "priceVnd": 3500000,
  "depositAmountVnd": 3500000,
  "areaM2": 22,
  "bedrooms": 1,
  "bathrooms": 1,
  "parking": 1,
  "address": "Ngõ 40 Tạ Quang Bửu",
  "ward": "Bách Khoa",
  "district": "Hai Bà Trưng",
  "city": "Hà Nội",
  "amenities": ["WIFI", "WATER_HEATER", "PRIVATE_BATHROOM"],
  "lat": 21.0041,
  "lng": 105.8463
}
```

## 4. Response chi tiết tin

`GET /api/v1/listings/:id` — công khai

```json
{
  "data": {
    "id": "c0000000-0000-4000-8000-000000000004",
    "ownerId": "a0000000-0000-4000-8000-000000000001",
    "owner": {
      "id": "a0000000-0000-4000-8000-000000000001",
      "fullName": "Nguyễn Văn Hùng",
      "email": "landlord1@seed.realestate.local",
      "phone": "0912345678",
      "avatarUrl": null
    },
    "title": "Phòng trọ gần ĐH Bách Khoa, có gác xép",
    "tagline": "Phòng mới sửa, giờ giấc tự do, 5 phút tới trường",
    "description": "Phòng 22 m² có gác xép, cửa sổ thoáng...",
    "propertyType": "ROOM",
    "posterType": "OWNER",
    "badges": ["FEATURED"],
    "priceVnd": 3500000,
    "depositAmountVnd": 3500000,
    "areaM2": 22,
    "bedrooms": 1,
    "bathrooms": 1,
    "parking": 1,
    "address": "Ngõ 40 Tạ Quang Bửu",
    "ward": "Bách Khoa",
    "district": "Hai Bà Trưng",
    "city": "Hà Nội",
    "amenities": ["WIFI", "WATER_HEATER", "PRIVATE_BATHROOM"],
    "lat": 21.0041,
    "lng": 105.8463,
    "status": "AVAILABLE",
    "approvalStatus": "APPROVED",
    "rejectReason": null,
    "images": [
      { "id": "0b6f...", "url": "http://localhost:9000/listing-images/...", "caption": "Phòng ngủ" },
      { "id": "1c7a...", "url": "http://localhost:9000/listing-images/...", "caption": "Khu vệ sinh" }
    ],
    "createdAt": "2026-11-21T04:55:12.064Z",
    "updatedAt": "2026-11-21T04:55:12.064Z"
  },
  "meta": { "correlationId": "…", "timestamp": "…" }
}
```

## 5. Response tìm kiếm

`GET /api/v1/listings` — công khai. Mỗi phần tử gồm các trường của `ListingSummaryDto` hiện có và thêm:
`tagline`, `posterType`, `badges`, `bedrooms`, `bathrooms`, `ward`. Không trả `owner`, `description`, `images[]`.

```json
{
  "data": [
    {
      "id": "c0000000-0000-4000-8000-000000000004",
      "ownerId": "a0000000-0000-4000-8000-000000000001",
      "title": "Phòng trọ gần ĐH Bách Khoa, có gác xép",
      "tagline": "Phòng mới sửa, giờ giấc tự do, 5 phút tới trường",
      "propertyType": "ROOM",
      "posterType": "OWNER",
      "badges": ["FEATURED"],
      "priceVnd": 3500000,
      "depositAmountVnd": 3500000,
      "areaM2": 22,
      "bedrooms": 1,
      "bathrooms": 1,
      "address": "Ngõ 40 Tạ Quang Bửu",
      "ward": "Bách Khoa",
      "district": "Hai Bà Trưng",
      "city": "Hà Nội",
      "amenities": ["WIFI", "WATER_HEATER", "PRIVATE_BATHROOM"],
      "lat": 21.0041,
      "lng": 105.8463,
      "status": "AVAILABLE",
      "coverImageUrl": "http://localhost:9000/listing-images/...",
      "distanceM": 420,
      "createdAt": "2026-11-21T04:55:12.064Z"
    }
  ],
  "meta": { "correlationId": "…", "timestamp": "…", "page": 1, "pageSize": 20, "total": 25, "totalPages": 2 }
}
```

`GET /api/v1/listings/mine` trả cùng dạng mục 4 (không có `owner`).

## 6. Tham số tìm kiếm mới

Thêm vào `GET /api/v1/listings`, giữ nguyên các tham số hiện có (`minPrice`, `maxPrice`, `minArea`, `maxArea`, `district`, `amenities`, `available`, `lat`, `lng`, `radiusKm`, `sort`, `page`, `pageSize`).

| Tham số | Kiểu | Ý nghĩa |
|---|---|---|
| `q` | string | Tìm trong `title`, `tagline`, `description`, `address` (không phân biệt dấu, hoa thường) |
| `city` | string | Lọc theo tỉnh / thành phố |
| `ward` | string | Lọc theo phường / xã |
| `propertyType` | enum | `ROOM`, `APARTMENT`, `HOUSE` |
| `posterType` | enum | `OWNER`, `BROKER`, `DEVELOPER` |
| `badge` | enum | `FEATURED`, `POPULAR`, `RECOMMENDED` — lấy tin cho từng mục trang chủ |
| `minBedrooms`, `maxBedrooms` | int | Khoảng số phòng ngủ. Bộ lọc web "1 / 2 / 3 / 4+": `1` → `minBedrooms=1&maxBedrooms=1`, `4+` → `minBedrooms=4` |
| `minBathrooms` | int | Số phòng tắm tối thiểu |
| `listingType` | enum | `RENT`, `SALE` (mục 7) |
| `direction` | enum | Hướng nhà, chỉ áp dụng tin bán (mục 7) |
| `sort` | enum | Thêm `area_desc` (diện tích lớn nhất) |

`district` so khớp không phân biệt dấu và hoa thường.

Ví dụ: `GET /api/v1/listings?badge=POPULAR&city=Hà Nội&pageSize=10`

## 7. Danh sách tin cho admin

`GET /api/v1/admin/listings` — quyền `ADMIN`. Dùng cho trang Quản trị → Quản lý BĐS (duyệt tin).

| Tham số | Kiểu | Ý nghĩa |
|---|---|---|
| `approvalStatus` | enum | `PENDING_REVIEW`, `APPROVED`, `REJECTED`; bỏ trống = tất cả |
| `q` | string | Tìm theo tiêu đề, tên chủ trọ |
| `page`, `pageSize` | int | Như `GET /listings` |

Sắp xếp: tin mới nhất trước. Trả cả tin `HIDDEN`, không trả tin đã xóa.

```json
{
  "data": [
    {
      "id": "e51471f2-f33d-4a42-965d-d300af45fbf8",
      "title": "Phòng trọ cao cấp Bình Thạnh",
      "propertyType": "ROOM",
      "priceVnd": 3500000,
      "areaM2": 20,
      "district": "Bình Thạnh",
      "city": "TP. Hồ Chí Minh",
      "status": "AVAILABLE",
      "approvalStatus": "PENDING_REVIEW",
      "rejectReason": null,
      "coverImageUrl": "http://localhost:9000/listing-images/...",
      "owner": { "id": "a0000000-0000-4000-8000-000000000001", "fullName": "Trần Thị Bích", "email": "bich@example.com" },
      "createdAt": "2026-11-21T08:50:48.319Z"
    }
  ],
  "meta": { "correlationId": "…", "timestamp": "…", "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}
```

Duyệt / từ chối dùng API đã có: `POST /admin/listings/:id/approve`, `POST /admin/listings/:id/reject` (body `{ "reason": "..." }`).

## 8. Tin bán

Áp dụng khi hệ thống mở rộng sang mua bán. Tin bán không dùng luồng đặt cọc giữ chỗ.

| Trường | Kiểu | Ràng buộc | Hiển thị |
|---|---|---|---|
| `listingType` | enum | `RENT` (mặc định), `SALE` | Phân biệt tin thuê / bán |
| `salePriceVnd` | int | > 0, bắt buộc khi `SALE` | Giá bán; đầu vào bảng tính vay |
| `legalStatus` | string | ≤ 100 ký tự | Pháp lý |
| `direction` | enum | `N`, `S`, `E`, `W`, `NE`, `NW`, `SE`, `SW` | Hướng nhà |
| `floors` | int | 1–100 | Số tầng |
| `projectedIrr` | number | % | Chỉ số đầu tư — chỉ hiện ở tin bán |
| `estPayout` | int | VND/tháng | Dòng tiền ước tính — chỉ hiện ở tin bán |
| `progressFunded` | number | 0–100 (%) | Tiến độ góp vốn — chỉ hiện ở tin bán |
| `initialPaymentVnd` | int | > 0 | Số tiền thanh toán ban đầu ("Thanh toán 1,5 tỷ") — thẻ dự án ở trang chủ |
| `installmentMonths` | int | > 0 | Thời gian trả góp ("Trả góp 10 năm" = 120) — thẻ dự án ở trang chủ |
| `handoverDate` | string (`YYYY-MM`) | | Thời điểm bàn giao ("Bàn giao Q4/2025") — thẻ dự án ở trang chủ |

Với `listingType = SALE`: `priceVnd` và `depositAmountVnd` không bắt buộc. `propertyType` thêm `VILLA`, `LAND`, `OFFICE`, `SHOPHOUSE`; `status` thêm `SOLD`.

## 9. Phần giao diện tự xử lý

Không cần BE thêm trường.

| Nội dung | Cách tính |
|---|---|
| Giá hiển thị ("3,5 Triệu/tháng") | Định dạng từ `priceVnd` |
| Ảnh bìa | `coverImageUrl`, hoặc ảnh đầu của `images[]` |
| Nhãn "Mới" | `createdAt` trong 7 ngày gần nhất |
| Tag thông số trên card (`1 giường`, `1 phòng tắm`, `22 m²`) | Từ `bedrooms`, `bathrooms`, `areaM2` |
| Phân khúc (sinh viên, gia đình) | `ROOM` → sinh viên; `APARTMENT`, `HOUSE` → gia đình |
| Miền (Bắc / Trung / Nam), bộ lọc "Vùng" | Từ `city` |
| Thông tin liên hệ trong form đăng tin (tên, SĐT, email) | Điền sẵn từ hồ sơ người đăng (`GET /auth/me`); hiển thị cho người xem qua `owner` (mục 2) — không lưu theo từng tin |
| Bảng dự toán tài chính & vay mua nhà (chỉ tin bán) | Số tiền vay `P = salePriceVnd × tỷ lệ vay (30–80%)`; trả góp tháng `P × r × (1 + r)^n / ((1 + r)^n − 1)`, với `r` = lãi suất năm / 12 (mặc định 8%), `n` = số năm vay × 12 |
