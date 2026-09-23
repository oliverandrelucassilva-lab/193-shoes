"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SidebarNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
        (isActive
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]")
      }
    >
      {children}
    </Link>
  );
}
