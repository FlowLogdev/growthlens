import Link from "next/link";
import { BrandLink } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-page grid min-h-[100dvh] bg-[var(--page)] text-[var(--ink)] lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[#111712] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <BrandLink className="[--ink:#fff]" />
        </div>
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d9ff6b]">A clearer weekly rhythm</p>
          <p className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.055em]">
            Connect the data. Find the signal. Decide what to test next.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3 text-xs text-white/48">
            <p>Facebook Pages</p>
            <p>Instagram Business</p>
            <p>TikTok Business</p>
          </div>
        </div>
        <p className="text-xs text-white/35">AI recommendations grounded in your own social performance.</p>
      </aside>

      <main className="flex min-h-[100dvh] items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <BrandLink />
            <Link href="/" className="text-sm text-[var(--muted)]">Home</Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
