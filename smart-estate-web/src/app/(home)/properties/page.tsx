"use client";

import dynamic from "next/dynamic";

// Leaflet truy cập `window` ngay khi import → chỉ render phía client
const PropertyListPage = dynamic(
  () => import("@/features/properties/pages/PropertyListPage").then((m) => m.PropertyListPage),
  { ssr: false },
);

export default function Page() {
  return <PropertyListPage />;
}
