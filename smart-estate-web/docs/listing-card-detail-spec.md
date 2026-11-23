# Đặc tả trường dữ liệu — Card và Chi tiết bất động sản

> Service: `listing` · Gateway: `/api/v1` · Phiên bản: 2026-11-21
> Áp dụng cho web (`smart-estate-web`) và App (`EstateApp`). Một tin có `listingType`: `RENT` (cho thuê) hoặc `SALE` (bán).
> Không có lượt xem, không có đánh giá sao.

## 1. Card sản phẩm

API: `GET /api/v1/listings` (danh sách), mỗi phần tử là `ListingSummary`.

| Thành phần trên card | Trường | Thuê | Bán |
|---|---|---|---|
| Ảnh | `coverImageUrl` | ✓ | ✓ |
| Nhãn "Cho thuê" / "Cần bán" | `listingType` | ✓ | ✓ |
| Nhãn "Mới" | `createdAt` (≤ 7 ngày, web tự tính) | ✓ | ✓ |
| Nhãn Nổi bật / Phổ biến / Đề xuất | `badges` | ✓ | ✓ |
| Nhãn nguồn đăng | `posterType` | ✓ | ✓ |
| Số phòng ngủ · phòng tắm · diện tích | `bedrooms`, `bathrooms`, `areaM2` | ✓ | ✓ |
| Tiêu đề | `title` | ✓ | ✓ |
| Câu giới thiệu ngắn | `tagline` | ✓ | ✓ |
| Quận, tỉnh/thành | `district`, `city` | ✓ | ✓ |
| Giá | `priceVnd` → "4,2 Triệu/tháng" | ✓ | |
| Giá | `salePriceVnd` → "15,8 Tỷ" | | ✓ |
| Loại BĐS | `propertyType` | ✓ | ✓ |
| Nút đặt cọc | `depositAmountVnd`, `status` | ✓ | |
| Vị trí trên bản đồ danh sách | `lat`, `lng` | ✓ | ✓ |
| Khoảng cách (khi tìm theo vị trí) | `distanceM` | ✓ | ✓ |

## 2. Trang chi tiết sản phẩm

API: `GET /api/v1/listings/:id`, trả `ListingDetail`. Thứ tự theo bố cục trang.

### 2.1 Cột chính

| Khu vực | Trường | Thuê | Bán | Ghi chú |
|---|---|---|---|---|
| Thư viện ảnh (1 lớn + 4 nhỏ) | `images[]` | ✓ | ✓ | **Tối đa 5 ảnh**; ảnh đầu là ảnh bìa |
| Tiêu đề | `title` | ✓ | ✓ | |
| Nhãn loại BĐS, nhãn tin | `propertyType`, `badges` | ✓ | ✓ | |
| Địa chỉ | `address`, `ward`, `district`, `city`, `addressNote` | ✓ | ✓ | Hiển thị: `Đường số 6, Phường Linh Trung, TP. Thủ Đức (Cạnh KTX Khu B ĐHQG)` |
| Mô tả bất động sản | `description` | ✓ | ✓ | |
| Không gian thực tế các phòng | `roomImages[]` | ✓ | ✓ | Mỗi ảnh có `roomType` + `name` (mục 3.5) |
| Tiện ích & Đặc quyền | `amenities[]` | ✓ | ✓ | Mã cố định (mục 3.4) |
| Vị trí thực tế trên bản đồ | `lat`, `lng`, `city` | ✓ | ✓ | |
| Chỉ số đầu tư | `projectedIrr`, `estPayout`, `progressFunded` | | ✓ | Chỉ tin bán |
| Bảng dự toán tài chính & vay mua nhà | `salePriceVnd` | | ✓ | Web tự tính (mục 5) |

### 2.2 Khung thông tin bên phải

| Khu vực | Trường | Thuê | Bán |
|---|---|---|---|
| Ảnh đại diện người đăng | `owner.avatarUrl` | ✓ | ✓ |
| Tên người đăng | `owner.fullName` | ✓ | ✓ |
| Email người đăng (dòng dưới tên) | `owner.email` | ✓ | ✓ |
| Nút "Hiện SĐT" | `owner.phone` | ✓ | ✓ |
| Phòng ngủ · Phòng tắm · Chỗ để xe · Diện tích | `bedrooms`, `bathrooms`, `parking`, `areaM2` | ✓ | ✓ |
| Ô giá 1 | "Giá thuê / tháng" = `priceVnd` | ✓ | |
| Ô giá 2 | "Đặt cọc" = `depositAmountVnd` (web hiện "2 tháng tiền cọc" khi chia hết cho `priceVnd`) | ✓ | |
| Ô giá 1 | "Giá niêm yết" = `salePriceVnd` | | ✓ |
| Ô giá 2 | "Pháp lý" = `legalStatus` | | ✓ |
| Nút "Đặt cọc giữ chỗ" | `depositAmountVnd`, `status` | ✓ | |
| Nút "Chat trực tiếp", "Đặt lịch xem" | `id`, `ownerId` | ✓ | ✓ |

## 3. Định nghĩa trường

### 3.1 Trường chung

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | uuid | ✓ | |
| `ownerId` | uuid | ✓ | |
| `listingType` | enum | ✓ | `RENT`, `SALE` |
| `title` | string | ✓ | 5–200 ký tự |
| `tagline` | string | | ≤ 120 ký tự |
| `description` | string | | ≤ 5000 ký tự |
| `propertyType` | enum | ✓ | Mục 3.3 |
| `posterType` | enum | ✓ | `OWNER` (mặc định), `BROKER`, `DEVELOPER` |
| `badges` | enum[] | ✓ | `FEATURED`, `POPULAR`, `RECOMMENDED`; mặc định `[]` |
| `areaM2` | number | ✓ | > 0, tối đa 2 chữ số thập phân |
| `bedrooms` | int | ✓ | 0–50 (0 = studio) |
| `bathrooms` | int | ✓ | 0–50 |
| `parking` | int | ✓ | 0–100 |
| `address` | string | ✓ | ≤ 300 ký tự (số nhà, đường) |
| `ward` | string | | ≤ 100 ký tự |
| `district` | string | ✓ | ≤ 100 ký tự |
| `city` | string | ✓ | ≤ 100 ký tự |
| `addressNote` | string | | ≤ 120 ký tự, mốc gần đó, vd. "Cạnh KTX Khu B ĐHQG" |
| `lat`, `lng` | number | ✓ | WGS84 |
| `amenities` | enum[] | ✓ | Mục 3.4; mặc định `[]` |
| `images` | object[] | ✓ | Tối đa 5: `{ id, url }` |
| `roomImages` | object[] | ✓ | Tối đa 10: `{ id, url, roomType, name }` |
| `status` | enum | ✓ | `AVAILABLE`, `HELD`, `DEPOSITED`, `RENTED`, `SOLD`, `HIDDEN` |
| `approvalStatus` | enum | ✓ | `PENDING_REVIEW`, `APPROVED`, `REJECTED` |
| `createdAt`, `updatedAt` | ISO datetime | ✓ | |
| `owner` | object | ✓ (chi tiết) | `{ id, fullName, email, phone, avatarUrl }`; `phone` = `null` khi người xem chưa đăng nhập |

### 3.2 Trường theo loại tin

| Trường | Kiểu | `RENT` | `SALE` | Ràng buộc |
|---|---|---|---|---|
| `priceVnd` | int | bắt buộc | `null` | Giá thuê / tháng, > 0 |
| `depositAmountVnd` | int | bắt buộc | `null` | Tiền cọc, > 0 |
| `salePriceVnd` | int | `null` | bắt buộc | Giá bán, > 0 |
| `legalStatus` | string | `null` | bắt buộc | ≤ 100 ký tự, vd. "Sổ hồng trao tay" |
| `direction` | enum | tùy chọn | tùy chọn | `N`, `S`, `E`, `W`, `NE`, `NW`, `SE`, `SW` |
| `projectedIrr` | number | `null` | tùy chọn | % / năm |
| `estPayout` | int | `null` | tùy chọn | VND / tháng |
| `progressFunded` | number | `null` | tùy chọn | 0–100 (%) |

### 3.3 `propertyType`

| Mã | Nhãn | `RENT` | `SALE` |
|---|---|---|---|
| `ROOM` | Phòng trọ / Studio | ✓ | |
| `APARTMENT` | Căn hộ | ✓ | ✓ |
| `HOUSE` | Nhà nguyên căn / Nhà phố | ✓ | ✓ |
| `VILLA` | Biệt thự | ✓ | ✓ |
| `LAND` | Đất nền | | ✓ |
| `OFFICE` | Văn phòng | ✓ | ✓ |
| `SHOPHOUSE` | Mặt bằng / Shophouse | ✓ | ✓ |

### 3.4 `amenities` — Tiện ích & Đặc quyền

Web hiển thị theo nhóm, mỗi mã một icon.

| Nhóm | Mã | Nhãn |
|---|---|---|
| **Trong phòng** | `AIR_CONDITIONER` | Điều hòa |
| | `WATER_HEATER` | Nóng lạnh |
| | `WASHING_MACHINE` | Máy giặt riêng |
| | `FRIDGE` | Tủ lạnh |
| | `KITCHEN` | Bếp riêng |
| | `WORK_DESK` | Bàn học / làm việc |
| | `LOFT` | Gác xép |
| | `PRIVATE_BATHROOM` | WC khép kín |
| | `BALCONY` | Ban công riêng |
| | `FURNISHED` | Nội thất đầy đủ |
| | `SMART_HOME` | Smart Home |
| | `WIFI` | Wifi tốc độ cao |
| **An ninh** | `SMART_LOCK` | Khóa vân tay / thẻ từ |
| | `SECURITY_24H` | Bảo vệ 24/7 |
| | `CCTV` | Camera 24/7 |
| | `RECEPTION_24H` | Lễ tân 24/7 |
| **Tòa nhà & khu** | `ELEVATOR` | Thang máy |
| | `PARKING` | Bãi đỗ xe |
| | `SWIMMING_POOL` | Hồ bơi |
| | `GYM` | Phòng gym / yoga |
| | `BBQ` | Khu nướng BBQ |
| | `GARDEN` | Vườn / công viên / hồ sinh thái |
| | `KIDS_PLAYGROUND` | Khu vui chơi trẻ em |
| | `SPORTS_COURT` | Sân thể thao (tennis, golf) |
| | `VIEW` | Tầm nhìn đẹp (sông, biển, thành phố) |
| **Quy định** | `PET_ALLOWED` | Cho nuôi thú cưng |
| | `FREE_HOURS` | Giờ giấc tự do |
| | `NO_LANDLORD` | Không chung chủ |
| **Vị trí** | `NEAR_METRO` | Gần ga metro |
| | `NEAR_UNIVERSITY` | Gần trường đại học |
| | `NEAR_SCHOOL` | Gần trường học |
| | `NEAR_SUPERMARKET` | Gần siêu thị |

### 3.5 `roomImages[].roomType` — Không gian thực tế các phòng

`roomType` dùng chọn icon và nhóm ảnh; `name` là tên hiển thị do chủ tin đặt (≤ 60 ký tự).

| `roomType` | Nhãn mặc định | Ví dụ `name` |
|---|---|---|
| `BEDROOM` | Phòng ngủ | Góc ngủ & bàn học · Phòng ngủ Master · Phòng ngủ & Gác lửng |
| `LIVING_ROOM` | Phòng khách | Phòng khách hiện đại · Phòng khách Panorama |
| `KITCHEN` | Bếp | Khu vực bếp nấu · Bếp & Bàn ăn · Không gian Bếp & Bar |
| `BATHROOM` | Phòng tắm | Phòng tắm khép kín · Phòng tắm tiện nghi |
| `WORKSPACE` | Góc làm việc | Góc làm việc |
| `BALCONY` | Ban công / sân thượng | Ban công đón nắng |
| `OTHER` | Khác | |

## 4. Response mẫu

### 4.1 Card — `GET /api/v1/listings`

```json
{
  "data": [
    {
      "id": "7a1c2f0e-0000-4000-8000-000000000007",
      "ownerId": "a0000000-0000-4000-8000-000000000002",
      "listingType": "RENT",
      "title": "Studio Hiện Đại Gần ĐH Quốc Gia & Làng Đại Học",
      "tagline": "Phòng Studio full nội thất, giờ giấc tự do",
      "propertyType": "ROOM",
      "posterType": "OWNER",
      "badges": ["FEATURED", "POPULAR"],
      "priceVnd": 4200000,
      "depositAmountVnd": 8400000,
      "salePriceVnd": null,
      "areaM2": 28,
      "bedrooms": 1,
      "bathrooms": 1,
      "district": "TP. Thủ Đức",
      "city": "TP. Hồ Chí Minh",
      "lat": 10.8756,
      "lng": 106.7981,
      "status": "AVAILABLE",
      "coverImageUrl": "http://localhost:9000/listing-images/listings/7a1c.../cover.jpg",
      "distanceM": null,
      "createdAt": "2026-11-20T02:00:00.000Z"
    },
    {
      "id": "1b2d3e4f-0000-4000-8000-000000000001",
      "ownerId": "a0000000-0000-4000-8000-000000000001",
      "listingType": "SALE",
      "title": "Riverside Luxury Penthouse Retreat",
      "tagline": "Căn hộ Penthouse view 360° sông Sài Gòn",
      "propertyType": "APARTMENT",
      "posterType": "BROKER",
      "badges": ["FEATURED"],
      "priceVnd": null,
      "depositAmountVnd": null,
      "salePriceVnd": 15800000000,
      "areaM2": 165,
      "bedrooms": 4,
      "bathrooms": 3,
      "district": "Bình Thạnh",
      "city": "TP. Hồ Chí Minh",
      "lat": 10.7951,
      "lng": 106.722,
      "status": "AVAILABLE",
      "coverImageUrl": "http://localhost:9000/listing-images/listings/1b2d.../cover.jpg",
      "distanceM": null,
      "createdAt": "2026-08-20T09:00:00.000Z"
    }
  ],
  "meta": { "correlationId": "…", "timestamp": "…", "page": 1, "pageSize": 20, "total": 2, "totalPages": 1 }
}
```

### 4.2 Chi tiết — tin cho thuê — `GET /api/v1/listings/:id`

```json
{
  "data": {
    "id": "7a1c2f0e-0000-4000-8000-000000000007",
    "ownerId": "a0000000-0000-4000-8000-000000000002",
    "owner": {
      "id": "a0000000-0000-4000-8000-000000000002",
      "fullName": "Trần Anh Tuấn",
      "email": "tuan.tran@example.com",
      "phone": "0968112233",
      "avatarUrl": "http://localhost:9000/user-avatars/a000.../avatar.jpg"
    },
    "listingType": "RENT",
    "title": "Studio Hiện Đại Gần ĐH Quốc Gia & Làng Đại Học",
    "tagline": "Phòng Studio full nội thất, giờ giấc tự do",
    "description": "Căn Studio tiện nghi 28m² dành riêng cho sinh viên và người mới đi làm. Đã trang bị sẵn máy lạnh Inverter, tủ lạnh, bếp từ, máy giặt riêng, bàn học/làm việc rộng rãi, wifi cáp quang tốc độ cao 500Mbps, khóa vân tay và an ninh 24/7.",
    "propertyType": "ROOM",
    "posterType": "OWNER",
    "badges": ["FEATURED", "POPULAR"],
    "priceVnd": 4200000,
    "depositAmountVnd": 8400000,
    "salePriceVnd": null,
    "legalStatus": null,
    "direction": "SE",
    "projectedIrr": null,
    "estPayout": null,
    "progressFunded": null,
    "areaM2": 28,
    "bedrooms": 1,
    "bathrooms": 1,
    "parking": 1,
    "address": "Đường số 6",
    "ward": "Phường Linh Trung",
    "district": "TP. Thủ Đức",
    "city": "TP. Hồ Chí Minh",
    "addressNote": "Cạnh KTX Khu B ĐHQG",
    "lat": 10.8756,
    "lng": 106.7981,
    "amenities": ["WIFI", "SMART_LOCK", "WASHING_MACHINE", "CCTV", "NEAR_UNIVERSITY", "NO_LANDLORD", "AIR_CONDITIONER", "FRIDGE", "KITCHEN", "WORK_DESK", "FREE_HOURS"],
    "images": [
      { "id": "i1", "url": "http://localhost:9000/listing-images/listings/7a1c.../1.jpg" },
      { "id": "i2", "url": "http://localhost:9000/listing-images/listings/7a1c.../2.jpg" },
      { "id": "i3", "url": "http://localhost:9000/listing-images/listings/7a1c.../3.jpg" },
      { "id": "i4", "url": "http://localhost:9000/listing-images/listings/7a1c.../4.jpg" },
      { "id": "i5", "url": "http://localhost:9000/listing-images/listings/7a1c.../5.jpg" }
    ],
    "roomImages": [
      { "id": "r1", "url": "http://localhost:9000/listing-images/listings/7a1c.../r1.jpg", "roomType": "BEDROOM", "name": "Góc ngủ & bàn học" },
      { "id": "r2", "url": "http://localhost:9000/listing-images/listings/7a1c.../r2.jpg", "roomType": "KITCHEN", "name": "Khu vực bếp nấu" },
      { "id": "r3", "url": "http://localhost:9000/listing-images/listings/7a1c.../r3.jpg", "roomType": "BATHROOM", "name": "Phòng tắm khép kín" }
    ],
    "status": "AVAILABLE",
    "approvalStatus": "APPROVED",
    "rejectReason": null,
    "createdAt": "2026-11-20T02:00:00.000Z",
    "updatedAt": "2026-11-20T02:00:00.000Z"
  },
  "meta": { "correlationId": "…", "timestamp": "…" }
}
```

### 4.3 Chi tiết — tin bán — `GET /api/v1/listings/:id`

```json
{
  "data": {
    "id": "1b2d3e4f-0000-4000-8000-000000000001",
    "ownerId": "a0000000-0000-4000-8000-000000000001",
    "owner": {
      "id": "a0000000-0000-4000-8000-000000000001",
      "fullName": "Nguyễn Văn Hùng",
      "email": "hung.nguyen@example.com",
      "phone": "0901234567",
      "avatarUrl": null
    },
    "listingType": "SALE",
    "title": "Riverside Luxury Penthouse Retreat",
    "tagline": "Căn hộ Penthouse view 360° sông Sài Gòn",
    "description": "Căn hộ cao cấp 3 phòng ngủ view toàn cảnh sông Sài Gòn và trung tâm tài chính. Thiết kế phong cách Nordic tối giản, sàn gỗ sồi nhập khẩu, hệ thống Smart Home.",
    "propertyType": "APARTMENT",
    "posterType": "BROKER",
    "badges": ["FEATURED"],
    "priceVnd": null,
    "depositAmountVnd": null,
    "salePriceVnd": 15800000000,
    "legalStatus": "Sổ hồng trao tay",
    "direction": "SE",
    "projectedIrr": 14.2,
    "estPayout": 65000000,
    "progressFunded": 88,
    "areaM2": 165,
    "bedrooms": 4,
    "bathrooms": 3,
    "parking": 2,
    "address": "Tòa tháp Landmark Plus, 208 Nguyễn Hữu Cảnh",
    "ward": "Phường 22",
    "district": "Bình Thạnh",
    "city": "TP. Hồ Chí Minh",
    "addressNote": null,
    "lat": 10.7951,
    "lng": 106.722,
    "amenities": ["SWIMMING_POOL", "GYM", "SECURITY_24H", "SMART_HOME", "VIEW", "ELEVATOR", "PARKING"],
    "images": [
      { "id": "i1", "url": "http://localhost:9000/listing-images/listings/1b2d.../1.jpg" },
      { "id": "i2", "url": "http://localhost:9000/listing-images/listings/1b2d.../2.jpg" },
      { "id": "i3", "url": "http://localhost:9000/listing-images/listings/1b2d.../3.jpg" },
      { "id": "i4", "url": "http://localhost:9000/listing-images/listings/1b2d.../4.jpg" },
      { "id": "i5", "url": "http://localhost:9000/listing-images/listings/1b2d.../5.jpg" }
    ],
    "roomImages": [
      { "id": "r1", "url": "http://localhost:9000/listing-images/listings/1b2d.../r1.jpg", "roomType": "BEDROOM", "name": "Phòng ngủ Master" },
      { "id": "r2", "url": "http://localhost:9000/listing-images/listings/1b2d.../r2.jpg", "roomType": "LIVING_ROOM", "name": "Phòng khách Panorama" },
      { "id": "r3", "url": "http://localhost:9000/listing-images/listings/1b2d.../r3.jpg", "roomType": "KITCHEN", "name": "Không gian Bếp & Bar" }
    ],
    "status": "AVAILABLE",
    "approvalStatus": "APPROVED",
    "rejectReason": null,
    "createdAt": "2026-08-20T09:00:00.000Z",
    "updatedAt": "2026-08-20T09:00:00.000Z"
  },
  "meta": { "correlationId": "…", "timestamp": "…" }
}
```

## 5. Phần web tự tính

| Nội dung | Cách tính |
|---|---|
| Giá hiển thị | `priceVnd` → "4,2 Triệu/tháng"; `salePriceVnd` → "15,8 Tỷ" |
| "2 tháng tiền cọc" | `depositAmountVnd / priceVnd` khi chia hết; không chia hết thì hiện số tiền |
| Nhãn "Mới" | `createdAt` trong 7 ngày gần nhất |
| Địa chỉ đầy đủ | `address, ward, district` + ` (addressNote)` |
| Bảng dự toán vay mua nhà (tin bán) | Số tiền vay `P = salePriceVnd × tỷ lệ vay (30–80%)`; trả góp tháng `P × r × (1 + r)^n / ((1 + r)^n − 1)`, `r` = lãi suất năm / 12 (mặc định 8%), `n` = số năm vay × 12 |
| Nhãn tiếng Việt, icon | Theo bảng mã ở mục 3.3, 3.4, 3.5 |
