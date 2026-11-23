/**
 * Thống kê tương tác của một tin: lượt yêu thích, lượt đặt lịch xem, lượt click.
 *
 * ⚠ DỮ LIỆU MẪU — BE chưa có nguồn số liệu:
 *   lượt yêu thích   → cần API yêu thích (chưa có trong thiết kế BE)
 *   lượt đặt lịch xem → service rental /viewings (chưa triển khai)
 *   lượt click       → cần API thống kê / tracking (chưa có)
 * Số sinh theo id tin (cố định, không đổi khi tải lại). Khi BE có API, thay `getListingAnalytics`
 * bằng lời gọi `GET /listings/:id/analytics?period=week|month|year` trả đúng dạng `ListingAnalytics`.
 */

export type AnalyticsPeriod = "week" | "month" | "year";

export const PERIOD_LABEL: Record<AnalyticsPeriod, string> = { week: "Tuần", month: "Tháng", year: "Năm" };
export const PREVIOUS_LABEL: Record<AnalyticsPeriod, string> = {
  week: "tuần trước",
  month: "tháng trước",
  year: "năm trước",
};

export interface MetricPair {
  current: number;
  previous: number;
}

export interface ListingAnalytics {
  favorites: MetricPair;
  viewings: MetricPair;
  clicks: MetricPair;
  /** Lượt click theo từng mốc trong kỳ (tuần: 7 ngày, tháng: 30 ngày, năm: 12 tháng) */
  clickSeries: { label: string; clicks: number }[];
}

// Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32) → cùng id cho cùng số
const seeded = (seedText: string) => {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const getListingAnalytics = (listingId: string, period: AnalyticsPeriod): ListingAnalytics => {
  const rand = seeded(`${listingId}:${period}`);
  const popularity = 0.5 + seeded(listingId)() * 1.2; // độ "hot" riêng của từng tin

  const labels =
    period === "week"
      ? WEEKDAYS
      : period === "month"
        ? Array.from({ length: 30 }, (_, i) => `${i + 1}`)
        : Array.from({ length: 12 }, (_, i) => `Th${i + 1}`);
  const perBucket = period === "year" ? 520 : 18;

  const clickSeries = labels.map((label, i) => {
    const wave = 0.75 + 0.35 * Math.sin((i / labels.length) * Math.PI * 2 + rand() * 2);
    return { label, clicks: Math.max(0, Math.round(perBucket * popularity * wave * (0.7 + rand() * 0.6))) };
  });
  const clicks = clickSeries.reduce((n, d) => n + d.clicks, 0);
  const drift = () => 0.7 + rand() * 0.6; // kỳ trước = kỳ này × (0.7 – 1.3)

  const favorites = Math.round(clicks * (0.06 + rand() * 0.05));
  const viewings = Math.max(0, Math.round(favorites * (0.18 + rand() * 0.15)));

  return {
    clicks: { current: clicks, previous: Math.round(clicks * drift()) },
    favorites: { current: favorites, previous: Math.round(favorites * drift()) },
    viewings: { current: viewings, previous: Math.round(viewings * drift()) },
    clickSeries,
  };
};

/** % thay đổi so với kỳ trước (làm tròn); null nếu kỳ trước = 0 */
export const changePct = ({ current, previous }: MetricPair) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
