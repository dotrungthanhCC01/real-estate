import { api } from "@/lib/axios";
import { mockDepositApi } from "./deposits.mock";

/**
 * Đặt cọc qua ví trung gian (service rental, thiết kế RE.DEPOSIT_SAGA / RE.DEPOSIT_LIFECYCLE của BE).
 *
 * BE chưa code rental → bật NEXT_PUBLIC_DEPOSIT_MOCK=true để chạy giao diện bằng dữ liệu giả.
 * Khi BE xong: đặt false (hoặc xóa biến), không phải sửa component.
 */
export type DepositStatus =
  | "PENDING_PAYMENT" // đã giữ chỗ, chờ tiền (10 phút)
  | "PAID" // tiền đã vào ví trung gian
  | "EXPIRED" // hết 10 phút chưa thanh toán
  | "CANCELLED" // hệ thống lỗi giữa chừng, đã nhả chỗ
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "RELEASED"
  | "WITHDRAWN";

/** Kết quả POST /deposits (201) */
export interface CreatedDeposit {
  depositId: string;
  status: DepositStatus;
  listingId: string;
  amountVnd: number;
  /** Hạn giữ chỗ = hạn link payOS (ISO) */
  expiresAt: string;
  holdRemainingSeconds: number;
  /** Trang thanh toán payOS */
  checkoutUrl: string;
  /** Chuỗi VietQR để vẽ mã QR */
  qrCode: string;
}

/** GET /deposits/:id (đọc trạng thái khi chờ thanh toán) */
export interface Deposit {
  id: string;
  status: DepositStatus;
  listingId: string;
  amountVnd: number;
  expiresAt?: string;
  paidAt?: string | null;
}

export const DEPOSIT_MOCK = process.env.NEXT_PUBLIC_DEPOSIT_MOCK === "true";

export interface DepositApi {
  /** `amountHint` chỉ dùng ở chế độ giả lập; API thật bỏ qua (BE lấy tiền cọc từ tin, BR-04) */
  create: (listingId: string, idempotencyKey: string, amountHint?: number) => Promise<CreatedDeposit>;
  get: (depositId: string) => Promise<Deposit>;
  /** Chỉ có ở chế độ giả lập */
  simulatePaid?: (depositId: string) => void;
}

const realDepositApi: DepositApi = {
  /** Số tiền không gửi từ client: BE lấy từ tin đăng (BR-04). Bắt buộc Idempotency-Key. */
  create: (listingId, idempotencyKey) =>
    api
      .post<CreatedDeposit>("/deposits", { listingId }, { headers: { "Idempotency-Key": idempotencyKey } })
      .then((r) => r.data),

  get: (depositId) => api.get<Deposit>(`/deposits/${depositId}`).then((r) => r.data),
};

export const depositApi: DepositApi = DEPOSIT_MOCK ? mockDepositApi : realDepositApi;
