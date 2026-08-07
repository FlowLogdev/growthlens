import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { PLANS, type PlanTier } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple GrowthLens plans for creators, growing brands, and small marketing teams.",
};

function PlanPanel({ tier, featured = false }: { tier: PlanTier; featured?: boolean }) {
  const plan = PLANS[tier];

  return (
    <article
      className={`relative border px-6 py-8 sm:px-8 sm:py-10 ${
        featured
          ? "rounded-[2rem] border-[#58cc70]/40 bg-[#111712] text-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] lg:-mt-7 lg:mb-7"
          : "rounded-[1.5rem] border-[var(--line-strong)] bg-[var(--surface)]"
      }`}
    >
      {featured && (
        <p className="absolute right-6 top-6 rounded-full bg-[#d9ff6b] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#172016]">
          Best for growth
        </p>
      )}
      <p className={`text-xs font-semibold uppercase tracking-[0.15em] ${featured ? "text-white/48" : "text-[var(--subtle)]"}`}>
        {plan.audience}
      </p>
      <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">{plan.name}</h2>
      <div className="mt-4 flex items-end gap-2">
        <p className="text-6xl font-semibold tracking-[-0.065em]">${plan.price}</p>
        <p className={`pb-2 text-sm ${featured ? "text-white/48" : "text-[var(--subtle)]"}`}>USD / month</p>
      </div>
      <p className={`mt-6 max-w-md leading-7 ${featured ? "text-white/66" : "text-[var(--muted)]"}`}>
        {plan.description}
      </p>
      <Link
        href={`/signup?plan=${tier}`}
        className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
          featured ? "bg-[#d9ff6b] text-[#172016]" : "bg-[var(--ink)] text-[var(--page)]"
        }`}
      >
        Start with {plan.name}
      </Link>
      <p className={`mt-3 text-center text-xs ${featured ? "text-white/42" : "text-[var(--subtle)]"}`}>
        14-day trial before you choose to pay
      </p>
      <div className={`mt-8 border-t pt-7 ${featured ? "border-white/10" : "border-[var(--line)]"}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${featured ? "text-white/45" : "text-[var(--subtle)]"}`}>
          What is included
        </p>
        <ul className="mt-5 space-y-4">
          {plan.features.map((feature) => (
            <li key={feature} className="grid grid-cols-[0.55rem_1fr] gap-3 text-sm leading-6">
              <span aria-hidden="true" className={`mt-2 size-1.5 rounded-full ${featured ? "bg-[#d9ff6b]" : "bg-[#58cc70]"}`} />
              <span className={featured ? "text-white/78" : "text-[var(--muted)]"}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
export default function PricingPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-[var(--line)]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 md:pb-24 md:pt-28 lg:px-8">
          <p className="marketing-eyebrow">Straightforward monthly pricing</p>
          <h1 className="mx-auto mt-6 max-w-5xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
            Pay for clarity, not dashboard clutter.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Start with 14 days to connect your channels and see how GrowthLens fits your weekly workflow.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 lg:px-8">
          <PlanPanel tier="starter" />
          <PlanPanel tier="pro" featured />
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-soft)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-20 lg:px-8">
          <div>
            <p className="marketing-eyebrow">A simple ROI check</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              Starter breaks even by saving about 35 minutes.
            </h2>
          </div>
          <div className="border-l border-[var(--line-strong)] pl-6 sm:pl-10">
            <p className="text-lg leading-8 text-[var(--muted)]">
              At a working value of $50 per hour, saving 35 minutes equals roughly $29. One useful weekly decision can create additional upside, but GrowthLens never guarantees performance or revenue.
            </p>
            <p className="mt-5 text-sm text-[var(--subtle)]">Example only. Your actual value depends on your time, audience, and execution.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <p className="marketing-eyebrow">Questions before you choose</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Know exactly what happens next.</h2>
            <p className="mt-5 leading-7 text-[var(--muted)]">
              Need a hand choosing? Open a ticket and tell us how many accounts you manage.
            </p>
            <Link href="/contact" className="mt-7 inline-flex text-sm font-semibold underline decoration-[#58cc70] decoration-2 underline-offset-4">
              Contact support
            </Link>
          </div>
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            <details className="group py-6" open>
              <summary className="cursor-pointer list-none pr-8 text-lg font-semibold">Can I use Stripe to pay?</summary>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                Yes. GrowthLens uses Stripe Checkout for card payment and Stripe&apos;s customer portal for subscription changes and cancellation.
              </p>
            </details>
            <details className="group py-6">
              <summary className="cursor-pointer list-none pr-8 text-lg font-semibold">Will I be charged during the trial?</summary>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                No card is required to create an account. You choose a paid plan from the billing page when you are ready to continue.
              </p>
            </details>
            <details className="group py-6">
              <summary className="cursor-pointer list-none pr-8 text-lg font-semibold">Can I cancel without contacting support?</summary>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                Yes. Open Billing in your dashboard and use the Stripe billing portal to manage or cancel the subscription.
              </p>
            </details>
            <details className="group py-6">
              <summary className="cursor-pointer list-none pr-8 text-lg font-semibold">Do you guarantee follower or revenue growth?</summary>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                No. GrowthLens provides evidence-backed analysis and recommendations. Results depend on your content, execution, market, and platform conditions.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.04em]">Managing clients or a larger portfolio?</p>
            <p className="mt-3 text-[var(--muted)]">Tell us what you need and we will shape a practical business plan.</p>
          </div>
          <Link href="/contact?subject=Business%20plan" className="marketing-button marketing-button-secondary marketing-button-large">
            Request a quote
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
