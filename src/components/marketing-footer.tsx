import Link from "next/link";
import { BrandMark } from "@/components/brand";

const FOOTER_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/data-deletion", label: "Data deletion" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Practical social growth intelligence for creators, small businesses, and focused teams.
          </p>
        </div>
        <div className="md:text-right">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3 text-sm md:justify-end">
            {FOOTER_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="marketing-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-5 text-xs text-[var(--subtle)]">
            © {new Date().getFullYear()} GrowthLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
