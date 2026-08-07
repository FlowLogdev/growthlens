import Link from "next/link";
import { BrandLink } from "@/components/brand";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--page-translucent)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLink className="shrink-0" />

        <nav aria-label="Primary" className="hidden items-center gap-7 text-sm md:flex">
          <Link className="marketing-nav-link" href="/#product">
            Product
          </Link>
          <Link className="marketing-nav-link" href="/pricing">
            Pricing
          </Link>
          <Link className="marketing-nav-link" href="/contact">
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] sm:inline-flex"
          >
            Log in
          </Link>
          <Link href="/signup?plan=starter" className="marketing-button marketing-button-primary">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
