"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/common/Header";

export const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      {/* Floating Transparent Glass Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
};
