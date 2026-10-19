import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Providers } from "./providers";

// Import Leaflet CSS toàn cục cho bản đồ
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "smart-estate-web",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
