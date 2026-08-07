import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-page min-h-[100dvh] bg-[var(--page)] text-[var(--ink)]">
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
