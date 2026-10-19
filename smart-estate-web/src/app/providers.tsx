"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/react-query";
import { ThemeProvider } from "@/store/theme.context";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { TicketProvider } from "@/features/tickets/context/TicketContext";

const subscribe = () => () => {};

/**
 * Providers toàn cục (thay cho App.tsx của Vite).
 * Các context đọc localStorage/window ngay khi khởi tạo state, nên chỉ render
 * ở client (giữ nguyên hành vi SPA như bản Vite).
 */
export function Providers({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  if (!isClient) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
