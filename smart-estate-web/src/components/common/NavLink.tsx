"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href" | "className"> & {
  href: string;
  /** Chỉ active khi pathname khớp chính xác (tương đương `end` của react-router) */
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
};

/**
 * NavLink — Link có trạng thái active dựa trên pathname hiện tại.
 */
export const NavLink = ({ href, end, className, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = end || href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={typeof className === "function" ? className({ isActive }) : className}
      {...props}
    />
  );
};
