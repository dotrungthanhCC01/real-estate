import type { CreatedDeposit, Deposit, DepositStatus } from "./deposits.api";

/**
 * Giả lập API đặt cọc khi BE chưa có service rental (NEXT_PUBLIC_DEPOSIT_MOCK=true).
 * Hành vi bám thiết kế BE: giữ chỗ 10 phút, hết giờ → EXPIRED; "thanh toán" bằng nút giả lập.
 * Số tiền truyền vào chỉ có ở chế độ giả lập (API thật lấy số tiền từ tin đăng).
 */
const HOLD_SECONDS = 600;
const store = new Map<string, Deposit & { expiresAt: string }>();
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const currentStatus = (d: Deposit & { expiresAt: string }): DepositStatus =>
  d.status === "PENDING_PAYMENT" && Date.parse(d.expiresAt) <= Date.now() ? "EXPIRED" : d.status;

export const mockDepositApi = {
  create: async (listingId: string, _idempotencyKey: string, amountVnd = 0): Promise<CreatedDeposit> => {
    await delay(700);
    const depositId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + HOLD_SECONDS * 1000).toISOString();
    store.set(depositId, { id: depositId, status: "PENDING_PAYMENT", listingId, amountVnd, expiresAt });
    return {
      depositId,
      status: "PENDING_PAYMENT",
      listingId,
      amountVnd,
      expiresAt,
      holdRemainingSeconds: HOLD_SECONDS,
      checkoutUrl: "https://pay.payos.vn/",
      // Chuỗi mẫu để vẽ QR (không chuyển được tiền thật)
      qrCode: `SMARTESTATE-DEMO|${depositId}|${amountVnd}`,
    };
  },

  get: async (depositId: string): Promise<Deposit> => {
    await delay(200);
    const d = store.get(depositId);
    if (!d) throw new Error("Không tìm thấy đơn đặt cọc");
    return { ...d, status: currentStatus(d) };
  },

  /** Chỉ có ở chế độ giả lập: coi như payOS đã báo tiền về */
  simulatePaid: (depositId: string) => {
    const d = store.get(depositId);
    if (d && currentStatus(d) === "PENDING_PAYMENT") {
      store.set(depositId, { ...d, status: "PAID", paidAt: new Date().toISOString() });
    }
  },
};
