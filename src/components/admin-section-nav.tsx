"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, isAdminNavActive } from "@/lib/admin-nav";

export function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex flex-wrap gap-2">
      {adminNav.map((link) => {
        const active = isAdminNavActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              active
                ? "border-halo bg-halo/10 text-halo-bright"
                : "border-ink-line hover:border-halo/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
