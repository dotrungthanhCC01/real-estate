"use client";

import dynamic from "next/dynamic";

// Leaflet truy cập `window` ngay khi import → chỉ render phía client
const PropertyDetailPage = dynamic(
  () => import("@/features/properties/pages/PropertyDetailPage").then((m) => m.PropertyDetailPage),
  { ssr: false },
);

export default function Page() {
  return <PropertyDetailPage />;
}
