import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { MarketingLayout } from "@/components/marketing-layout";

export const metadata: Metadata = {
  title: "Contact support",
  description: "Open a GrowthLens support ticket and receive a ticket number by email.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const defaultSubject = typeof subject === "string" ? subject.slice(0, 160) : "";

  return (
    <MarketingLayout>
      <section className="border-b border-[var(--line)]">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="marketing-eyebrow">GrowthLens support</p>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl">
              Tell us what is getting in your way.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[var(--muted)]">
              Open a tracked case and keep the ticket number in every reply so the conversation stays together.
            </p>

            <div className="mt-10 border-y border-[var(--line)] py-7">
              <p className="font-mono text-sm font-bold">Growth10002026</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Your confirmation uses this format with a unique sequence and the current year.</p>
            </div>

            <dl className="mt-8 space-y-6 text-sm">
              <div>
                <dt className="text-[var(--subtle)]">Support inbox</dt>
                <dd className="mt-1 font-semibold">
                  <a href="mailto:support@flowlog.dev" className="underline decoration-[#58cc70] decoration-2 underline-offset-4">support@flowlog.dev</a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--subtle)]">Who receives the ticket</dt>
                <dd className="mt-1 max-w-sm leading-6 text-[var(--muted)]">You receive the confirmation. GrowthLens support receives the same case, subject, and description.</dd>
              </div>
              <div>
                <dt className="text-[var(--subtle)]">Pro support</dt>
                <dd className="mt-1 max-w-sm leading-6 text-[var(--muted)]">Signed-in Pro customers are automatically marked for priority handling.</dd>
              </div>
            </dl>
          </div>

          <ContactForm defaultSubject={defaultSubject} />
        </div>
      </section>
    </MarketingLayout>
  );
}
