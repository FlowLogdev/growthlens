"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const DASHBOARD_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/metrics", label: "Metrics" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/hashtags", label: "Viral Hashtags" },
  { href: "/dashboard/connect", label: "Connect accounts" },
  { href: "/dashboard/links", label: "Link clicks" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/contact", label: "Support" },
];

export function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className={mobile ? "flex min-w-max gap-2" : "space-y-1"}>
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const active = item.href === "/dashboard"
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${mobile ? "px-3 py-2" : "block px-3 py-2.5"} rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-[#d9ff6b] text-[#172016]"
                : "text-white/58 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
