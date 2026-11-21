"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRequireAuth } from "@/features/auth/context/AuthPromptContext";

// ─── Favorites (BĐS yêu thích) ────────────────────────────────────────────────
// Lưu danh sách id BĐS đã thả tim vào localStorage (demo / prototype).
// Khi có API: thay phần đọc/ghi localStorage bằng gọi API, các component dùng useFavorites() giữ nguyên.

interface FavoritesContextValue {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const STORAGE_KEY = "smart_estate_favorites";

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // localStorage không khả dụng (chế độ ẩn danh...) → chỉ giữ trong bộ nhớ
    }
  }, [favoriteIds]);

  // Yêu thích cần đăng nhập: khách bấm tim → modal mời đăng nhập (mọi nút tim dùng chung hàm này)
  const isFavorite = (id: string) => isAuthenticated && favoriteIds.includes(id);

  const toggleFavorite = (id: string) =>
    requireAuth(
      () => setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])),
      { reason: "favorite" },
    );

  const removeFavorite = (id: string) => setFavoriteIds((prev) => prev.filter((x) => x !== id));

  const clearFavorites = () => setFavoriteIds([]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds: isAuthenticated ? favoriteIds : [],
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextValue => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within <FavoritesProvider>");
  return ctx;
};
