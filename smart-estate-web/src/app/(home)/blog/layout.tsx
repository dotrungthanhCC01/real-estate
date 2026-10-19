import type { ReactNode } from "react";
import { BlogLayout } from "@/features/blog/layouts/BlogLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <BlogLayout>{children}</BlogLayout>;
}
