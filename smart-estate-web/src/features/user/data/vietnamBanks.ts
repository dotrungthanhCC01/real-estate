// Danh sách ngân hàng phổ biến tại Việt Nam. `name` là giá trị lưu xuống backend (bankName).
// `from`/`to`: màu gradient của thẻ (gần với màu nhận diện, chỉ để trang trí, không dùng logo).
export interface VietnamBank {
  code: string;
  name: string;
  fullName: string;
  from: string;
  to: string;
  popular?: boolean;
}

export const VIETNAM_BANKS: VietnamBank[] = [
  { code: "VCB", name: "Vietcombank", fullName: "Ngoại thương Việt Nam", from: "#0b6b3a", to: "#16a34a", popular: true },
  { code: "TCB", name: "Techcombank", fullName: "Kỹ thương Việt Nam", from: "#7f1d1d", to: "#dc2626", popular: true },
  { code: "MB", name: "MB Bank", fullName: "Quân đội", from: "#1e3a8a", to: "#2563eb", popular: true },
  { code: "BIDV", name: "BIDV", fullName: "Đầu tư và Phát triển Việt Nam", from: "#134e4a", to: "#0d9488", popular: true },
  { code: "CTG", name: "VietinBank", fullName: "Công thương Việt Nam", from: "#0c4a6e", to: "#0284c7", popular: true },
  { code: "ACB", name: "ACB", fullName: "Á Châu", from: "#1e3a8a", to: "#3b82f6", popular: true },
  { code: "VPB", name: "VPBank", fullName: "Việt Nam Thịnh Vượng", from: "#14532d", to: "#22c55e", popular: true },
  { code: "TPB", name: "TPBank", fullName: "Tiên Phong", from: "#4c1d95", to: "#8b5cf6", popular: true },
  { code: "VBA", name: "Agribank", fullName: "Nông nghiệp và Phát triển Nông thôn", from: "#7c2d12", to: "#ea580c" },
  { code: "STB", name: "Sacombank", fullName: "Sài Gòn Thương Tín", from: "#1e40af", to: "#0ea5e9" },
  { code: "HDB", name: "HDBank", fullName: "Phát triển TP. Hồ Chí Minh", from: "#991b1b", to: "#f97316" },
  { code: "VIB", name: "VIB", fullName: "Quốc tế Việt Nam", from: "#1e3a8a", to: "#f59e0b" },
  { code: "SHB", name: "SHB", fullName: "Sài Gòn – Hà Nội", from: "#9a3412", to: "#f59e0b" },
  { code: "MSB", name: "MSB", fullName: "Hàng Hải Việt Nam", from: "#7f1d1d", to: "#ef4444" },
  { code: "OCB", name: "OCB", fullName: "Phương Đông", from: "#14532d", to: "#84cc16" },
  { code: "SCB", name: "SeABank", fullName: "Đông Nam Á", from: "#881337", to: "#e11d48" },
  { code: "LPB", name: "LPBank", fullName: "Lộc Phát Việt Nam", from: "#78350f", to: "#d97706" },
  { code: "EIB", name: "Eximbank", fullName: "Xuất Nhập khẩu Việt Nam", from: "#0c4a6e", to: "#38bdf8" },
  { code: "NAB", name: "Nam A Bank", fullName: "Nam Á", from: "#1e3a8a", to: "#f97316" },
  { code: "CAKE", name: "Cake by VPBank", fullName: "Ngân hàng số Cake", from: "#831843", to: "#ec4899" },
  { code: "TIMO", name: "Timo", fullName: "Ngân hàng số Timo", from: "#312e81", to: "#6366f1" },
];

const FALLBACK = { from: "#27272a", to: "#52525b" };

/** Tìm ngân hàng theo tên đã lưu; tên tự nhập không có trong danh sách thì dùng màu trung tính. */
export const findBank = (name?: string) =>
  VIETNAM_BANKS.find((b) => b.name.toLowerCase() === name?.trim().toLowerCase());

export const bankColors = (name?: string) => {
  const bank = findBank(name);
  return bank ? { from: bank.from, to: bank.to } : FALLBACK;
};

/** Chữ viết tắt hiển thị trên ô ngân hàng */
export const bankMonogram = (name: string) => findBank(name)?.code ?? name.slice(0, 3).toUpperCase();
