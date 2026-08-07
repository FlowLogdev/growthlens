import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | GrowthLens",
  description: "The terms that govern access to and use of the GrowthLens service.",
};

const sectionClassName = "space-y-3";
const headingClassName = "text-xl font-semibold tracking-tight text-gray-950";
const listClassName = "list-disc space-y-2 pl-5";
const linkClassName = "font-medium text-gray-950 underline underline-offset-4 hover:text-gray-600";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white text-gray-700">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <Link href="/" className="text-sm font-semibold text-gray-950 hover:text-gray-600">
          GrowthLens
        </Link>

        <header className="mt-10 border-b border-gray-200 pb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Legal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Effective and last updated: <time dateTime="2026-08-07">August 7, 2026</time>
          </p>
        </header>

        <div className="mt-10 space-y-10 text-[15px] leading-7">
          <section className={sectionClassName} aria-labelledby="acceptance">
            <h2 id="acceptance" className={headingClassName}>
              1. Acceptance of these terms
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of
              usegrowthlens.com and the GrowthLens service (collectively, the
              &quot;Service&quot;). By creating an account, connecting a social-media account,
              purchasing a subscription, or otherwise using the Service, you agree to these Terms
              and our{" "}
              <Link href="/privacy" className={linkClassName}>
                Privacy Policy
              </Link>
              . If you do not agree, do not use the Service.
            </p>
            <p>
              If you use GrowthLens for a company or other organization, you represent that you
              have authority to bind that organization. In that case, &quot;you&quot; includes the
              organization.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="service">
            <h2 id="service" className={headingClassName}>
              2. The GrowthLens Service
            </h2>
            <p>
              GrowthLens connects to authorized Facebook Pages, Instagram Business accounts, and
              TikTok Business accounts to synchronize available performance data, display
              analytics, and generate AI-assisted organic growth recommendations. Features may
              vary by subscription plan, platform availability, account type, permissions, region,
              or third-party review status.
            </p>
            <p>
              GrowthLens is an independent service. It is not sponsored, endorsed, or operated by
              Meta, Facebook, Instagram, TikTok, Stripe, Anthropic, Supabase, Vercel, or Resend.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="eligibility-account">
            <h2 id="eligibility-account" className={headingClassName}>
              3. Eligibility and account security
            </h2>
            <ul className={listClassName}>
              <li>You must be at least 18 years old and legally able to enter into a contract.</li>
              <li>You must provide accurate account and billing information and keep it current.</li>
              <li>
                You are responsible for protecting your credentials and for activity under your
                account.
              </li>
              <li>
                You must notify us promptly if you suspect unauthorized access or another security
                incident.
              </li>
              <li>
                You may not share access in a way that exceeds your plan or use another person&apos;s
                account without authorization.
              </li>
            </ul>
          </section>

          <section className={sectionClassName} aria-labelledby="connected-platforms">
            <h2 id="connected-platforms" className={headingClassName}>
              4. Connected platforms and permissions
            </h2>
            <p>
              You may connect only social accounts that you own or are authorized to manage. By
              connecting an account, you authorize GrowthLens to obtain and process the profile,
              post, video, audience, and performance information made available through the
              permissions you approve, as described in the Privacy Policy.
            </p>
            <p>
              You are responsible for complying with the terms and policies of each connected
              platform. You may disconnect an account from GrowthLens or revoke GrowthLens through
              the platform&apos;s settings. Platform API changes, outages, permission restrictions,
              rate limits, expired tokens, or app-review decisions may limit or interrupt features
              without creating liability for GrowthLens.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="customer-data">
            <h2 id="customer-data" className={headingClassName}>
              5. Your data and content
            </h2>
            <p>
              As between you and GrowthLens, you retain your rights in the information, content,
              and platform data you provide or authorize GrowthLens to access (&quot;Customer
              Data&quot;). You grant GrowthLens a limited, non-exclusive license to host, copy,
              process, transmit, and display Customer Data only as necessary to provide, secure,
              support, and improve the Service, comply with your instructions, and meet legal
              obligations.
            </p>
            <p>
              You represent that you have the rights and permissions necessary for GrowthLens to
              process Customer Data. You are responsible for the legality, accuracy, and quality of
              Customer Data and for maintaining any copies you require.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="ai-insights">
            <h2 id="ai-insights" className={headingClassName}>
              6. AI-generated insights
            </h2>
            <p>
              GrowthLens uses artificial intelligence to generate recommendations from selected
              account metrics and post summaries. AI output may be incomplete, inaccurate,
              outdated, or unsuitable for your circumstances. It is provided for informational
              purposes and is not professional, financial, legal, or business advice.
            </p>
            <p>
              You are responsible for reviewing recommendations and deciding whether to act on
              them. GrowthLens does not guarantee audience growth, engagement, revenue, platform
              approval, or any other result.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="acceptable-use">
            <h2 id="acceptable-use" className={headingClassName}>
              7. Acceptable use
            </h2>
            <p>You may not use the Service to:</p>
            <ul className={listClassName}>
              <li>Violate law, another person&apos;s rights, or a connected platform&apos;s terms.</li>
              <li>Access or process accounts or data without authorization.</li>
              <li>Upload malicious code or interfere with the Service or another user.</li>
              <li>
                Probe, scan, bypass, or defeat security, authentication, rate limits, or access
                controls.
              </li>
              <li>
                Reverse engineer, copy, resell, sublicense, or commercially exploit the Service
                except as expressly permitted in writing.
              </li>
              <li>
                Use automated means to scrape or extract the Service beyond documented interfaces.
              </li>
              <li>Misrepresent affiliation with GrowthLens or use the Service for fraud or abuse.</li>
            </ul>
          </section>

          <section className={sectionClassName} aria-labelledby="subscriptions">
            <h2 id="subscriptions" className={headingClassName}>
              8. Subscriptions, billing, and cancellation
            </h2>
            <p>
              Paid features require a subscription. Prices, billing intervals, included features,
              and any trial terms are shown before purchase. You authorize Stripe and GrowthLens to
              charge the payment method associated with your subscription, including applicable
              taxes, on a recurring basis until cancellation.
            </p>
            <p>
              You may manage or cancel a paid subscription through the GrowthLens billing portal.
              Unless stated otherwise at purchase or required by law, cancellation takes effect at
              the end of the current paid billing period and fees already paid are non-refundable.
              We may change future pricing or plan features with reasonable advance notice.
            </p>
            <p>
              If payment fails or becomes overdue, we may retry the charge, limit paid features, or
              suspend the account. You remain responsible for amounts incurred before cancellation
              or suspension.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="third-parties">
            <h2 id="third-parties" className={headingClassName}>
              9. Third-party services
            </h2>
            <p>
              The Service depends on third parties, including Meta, TikTok, Stripe, Anthropic,
              Supabase, Vercel, and Resend. Their products are governed by their own terms and
              policies. GrowthLens does not control and is not responsible for third-party systems,
              content, decisions, outages, or changes.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="intellectual-property">
            <h2 id="intellectual-property" className={headingClassName}>
              10. GrowthLens intellectual property
            </h2>
            <p>
              GrowthLens and its licensors own the Service, including its software, design,
              branding, documentation, and other materials, excluding Customer Data and third-party
              materials. Subject to these Terms, we grant you a limited, revocable,
              non-transferable, non-sublicensable right to use the Service for your internal
              business purposes during your account term.
            </p>
            <p>
              If you provide feedback, you grant GrowthLens a perpetual, worldwide, royalty-free
              right to use it without restriction or compensation, provided we do not identify you
              publicly without permission.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="availability">
            <h2 id="availability" className={headingClassName}>
              11. Availability and changes
            </h2>
            <p>
              We may add, modify, suspend, or discontinue features to maintain security, comply
              with law or platform rules, respond to third-party changes, or improve the Service.
              We do not promise uninterrupted or error-free operation or a particular service
              level unless agreed in a separate written contract.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="termination">
            <h2 id="termination" className={headingClassName}>
              12. Suspension, termination, and deletion
            </h2>
            <p>
              You may stop using GrowthLens, disconnect platforms, cancel your subscription, or
              request account deletion at any time. We may suspend or terminate access if you
              materially breach these Terms, create security or legal risk, fail to pay amounts
              due, or use the Service in a way that could harm GrowthLens, a connected platform, or
              another person.
            </p>
            <p>
              To delete your GrowthLens account and associated data, use our{" "}
              <Link href="/data-deletion" className={linkClassName}>
                data-deletion page
              </Link>
              . Sections that by their nature should survive termination—including payment,
              ownership, disclaimers, liability limits, and dispute provisions—will survive.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="disclaimers">
            <h2 id="disclaimers" className={headingClassName}>
              13. Disclaimers
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE AND ALL RECOMMENDATIONS ARE
              PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; GROWTHLENS DISCLAIMS ALL
              EXPRESS OR IMPLIED WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, AND RELIABILITY. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE SECURE, UNINTERRUPTED, OR ERROR-FREE OR THAT DATA
              WILL ALWAYS BE AVAILABLE OR ACCURATE.
            </p>
            <p>
              Some jurisdictions do not allow certain warranty exclusions, so parts of this
              section may not apply to you.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="liability">
            <h2 id="liability" className={headingClassName}>
              14. Limitation of liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GROWTHLENS WILL NOT BE LIABLE FOR INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST
              PROFITS, REVENUE, GOODWILL, BUSINESS OPPORTUNITY, OR DATA, EVEN IF ADVISED THAT SUCH
              DAMAGES ARE POSSIBLE.
            </p>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GROWTHLENS&apos; TOTAL LIABILITY ARISING OUT
              OF OR RELATING TO THE SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF $100 OR
              THE AMOUNT YOU PAID TO GROWTHLENS DURING THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO
              THE CLAIM. These limits do not apply where liability cannot legally be limited.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="indemnity">
            <h2 id="indemnity" className={headingClassName}>
              15. Indemnification
            </h2>
            <p>
              To the extent permitted by law, you will defend, indemnify, and hold GrowthLens and
              its personnel harmless from third-party claims, damages, and reasonable costs arising
              from your Customer Data, your misuse of the Service, your connected accounts, or your
              violation of these Terms, law, or another person&apos;s rights.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="disputes">
            <h2 id="disputes" className={headingClassName}>
              16. Disputes and applicable law
            </h2>
            <p>
              Before filing a formal claim, you and GrowthLens agree to make a good-faith effort to
              resolve the dispute informally for at least 30 days after written notice. These Terms
              are governed by the laws applicable where GrowthLens is established, without regard
              to conflict-of-law rules, except where the law in your place of residence requires
              otherwise. Nothing in these Terms limits non-waivable consumer rights.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="general">
            <h2 id="general" className={headingClassName}>
              17. General terms
            </h2>
            <p>
              These Terms and the Privacy Policy are the agreement between you and GrowthLens about
              the Service unless a separate written agreement applies. If one provision is
              unenforceable, the remaining provisions remain effective. A failure to enforce a
              provision is not a waiver. You may not assign these Terms without our consent; we may
              assign them in connection with a reorganization, financing, merger, acquisition, or
              sale of assets.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="updates-contact">
            <h2 id="updates-contact" className={headingClassName}>
              18. Updates and contact
            </h2>
            <p>
              We may update these Terms by posting a revised version and changing the date above.
              If a change materially affects your rights, we will provide additional notice when
              required. Continued use after the effective date of revised Terms constitutes
              acceptance.
            </p>
            <p>
              Questions about these Terms may be sent to{" "}
              <a href="mailto:support@flowlog.dev" className={linkClassName}>
                support@flowlog.dev
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-6 text-sm">
          <Link href="/" className={linkClassName}>
            Home
          </Link>
          <Link href="/privacy" className={linkClassName}>
            Privacy Policy
          </Link>
          <Link href="/data-deletion" className={linkClassName}>
            Delete your data
          </Link>
        </footer>
      </div>
    </main>
  );
}
