import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | GrowthLens",
  description: "How GrowthLens collects, uses, stores, and deletes personal and social platform data.",
};

const sectionClassName = "space-y-3";
const headingClassName = "text-xl font-semibold tracking-tight text-gray-950";
const listClassName = "list-disc space-y-2 pl-5";
const linkClassName = "font-medium text-gray-950 underline underline-offset-4 hover:text-gray-600";

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-shell min-h-[100dvh] text-white/72">
      <div className="legal-content relative mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
        <Link href="/" className="text-sm font-semibold text-gray-950 hover:text-gray-600">
          GrowthLens
        </Link>

        <header className="mt-10 border-b border-gray-200 pb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Legal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Effective and last updated: <time dateTime="2026-08-08">August 8, 2026</time>
          </p>
        </header>

        <div className="mt-10 space-y-10 text-[15px] leading-7">
          <section className={sectionClassName} aria-labelledby="overview">
            <h2 id="overview" className={headingClassName}>
              1. Overview
            </h2>
            <p>
              GrowthLens provides social-media analytics and AI-generated organic growth
              recommendations for businesses and creators. This Privacy Policy explains how
              GrowthLens (&quot;GrowthLens,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) collects, uses, discloses, protects, and deletes information when
              you use usegrowthlens.com and the GrowthLens service.
            </p>
            <p>
              By connecting a Facebook Page, Instagram Business account, or TikTok Business
              account, you authorize GrowthLens to access only the information covered by the
              permissions you approve. You may disconnect a platform account at any time.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="information-we-collect">
            <h2 id="information-we-collect" className={headingClassName}>
              2. Information we collect
            </h2>
            <ul className={listClassName}>
              <li>
                <strong className="text-gray-950">Account information:</strong> your email
                address, authentication identifier, business name, account creation date, plan,
                and subscription status.
              </li>
              <li>
                <strong className="text-gray-950">Connected account information:</strong>
                platform account identifiers and names, connection status, encrypted access and
                refresh tokens, and token expiration dates.
              </li>
              <li>
                <strong className="text-gray-950">Social performance data:</strong> follower
                counts, reach, impressions, profile views, engagement metrics, post or video
                identifiers, captions, content types, timestamps, permalinks, views, likes,
                comments, shares, and saves made available by the connected platform.
              </li>
              <li>
                <strong className="text-gray-950">Billing information:</strong> Stripe customer
                and subscription identifiers and subscription events. Payment-card details are
                collected and processed by Stripe; GrowthLens does not store complete card
                numbers.
              </li>
              <li>
                <strong className="text-gray-950">Service and communications data:</strong>
                email preferences, support messages, AI recommendations, and records showing that
                scheduled reports or service emails were sent.
              </li>
              <li>
                <strong className="text-gray-950">Technical data:</strong> authentication
                cookies, request and security logs, IP address and browser information recorded by
                our infrastructure providers, and—when tracked links are used—link slug, source,
                UTM parameters, click time, and user agent.
              </li>
            </ul>
          </section>

          <section className={sectionClassName} aria-labelledby="platform-data">
            <h2 id="platform-data" className={headingClassName}>
              3. Meta and TikTok platform data
            </h2>
            <p>GrowthLens requests the following permissions for these specific purposes:</p>
            <ul className={listClassName}>
              <li>
                <code>pages_show_list</code> to display the Facebook Pages you manage so you can
                choose which Page to connect.
              </li>
              <li>
                <code>pages_read_engagement</code> to retrieve Page identity and engagement or
                performance metrics for your dashboard.
              </li>
              <li>
                <code>instagram_basic</code> to retrieve basic Instagram Business account and
                media information.
              </li>
              <li>
                <code>instagram_manage_insights</code> to retrieve Instagram account and media
                insights used in analytics and recommendations.
              </li>
              <li>
                TikTok <code>user.info.basic</code>, <code>user.info.stats</code>, and
                <code>video.list</code> to retrieve your connected profile, account statistics, videos, and their
                performance metrics.
              </li>
            </ul>
            <p>
              We use platform data only to provide and improve GrowthLens for the customer who
              connected the account. We do not sell platform data, use it for targeted advertising,
              or publish, edit, or delete your social-media content.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="how-we-use-information">
            <h2 id="how-we-use-information" className={headingClassName}>
              4. How we use information
            </h2>
            <ul className={listClassName}>
              <li>Authenticate users and operate, maintain, and secure GrowthLens.</li>
              <li>Connect authorized social accounts and synchronize performance data.</li>
              <li>Display dashboards, trends, post performance, and account status.</li>
              <li>
                Analyze account metrics and post data to generate tailored growth recommendations.
              </li>
              <li>Process subscriptions, maintain billing records, and prevent duplicate events.</li>
              <li>Send requested service messages and weekly insight digests.</li>
              <li>Detect abuse, investigate errors, comply with law, and enforce our terms.</li>
            </ul>
            <p>
              Where applicable, our legal bases include performing our contract with you, your
              consent to connect optional platform accounts, our legitimate interests in operating
              and securing the service, and compliance with legal obligations.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="sharing">
            <h2 id="sharing" className={headingClassName}>
              5. How information is shared
            </h2>
            <p>
              We disclose information only as needed to provide the service, follow your
              instructions, protect GrowthLens and its users, or comply with law. Our service
              providers include:
            </p>
            <ul className={listClassName}>
              <li>
                <strong className="text-gray-950">Supabase</strong> for authentication and
                database hosting.
              </li>
              <li>
                <strong className="text-gray-950">Vercel</strong> for application hosting,
                delivery, request processing, and scheduled jobs.
              </li>
              <li>
                <strong className="text-gray-950">Stripe</strong> for subscription billing and
                payment processing.
              </li>
              <li>
                <strong className="text-gray-950">AI processing providers</strong> for generating
                account-specific insights and niche research from selected
                performance data, post summaries, and the research prompts you submit.
              </li>
              <li>
                <strong className="text-gray-950">Resend</strong> for transactional and weekly
                insight emails.
              </li>
              <li>
                <strong className="text-gray-950">Meta and TikTok</strong> when you authorize a
                connection or when GrowthLens requests data from their APIs on your behalf.
              </li>
            </ul>
            <p>
              We do not sell or rent your personal information or connected-platform data. We may
              disclose information in connection with a merger, financing, acquisition, or sale of
              assets, subject to appropriate confidentiality and notice requirements.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="storage-security">
            <h2 id="storage-security" className={headingClassName}>
              6. Storage and security
            </h2>
            <p>
              GrowthLens stores account records, synchronized metrics, posts, and AI insights in
              Supabase. Social-platform access and refresh tokens are encrypted by GrowthLens using
              authenticated encryption before storage. We also use encrypted network connections,
              tenant-level database access controls, restricted service credentials, and other
              administrative and technical safeguards.
            </p>
            <p>
              No system is completely secure. You are responsible for protecting your account
              credentials and promptly notifying us if you suspect unauthorized access.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="retention-deletion">
            <h2 id="retention-deletion" className={headingClassName}>
              7. Retention, disconnection, and deletion
            </h2>
            <p>
              We generally retain account information and synchronized platform data while your
              GrowthLens account is active or as needed to provide the service. Platform tokens are
              retained until the account is disconnected, access is revoked, the token expires, or
              the GrowthLens account is deleted.
            </p>
            <p>
              You may disconnect a social account from GrowthLens and revoke GrowthLens in the
              connected platform&apos;s settings. You can request deletion through our public
              <Link href="/data-deletion" className={linkClassName}>
                data-deletion page
              </Link>
              . Account deletion removes the GrowthLens customer record, authentication account,
              connected tokens, synchronized metrics and posts, link-click records, and generated
              insights.
            </p>
            <p>
              We retain a limited deletion audit record containing the submitted email address,
              request status, and request time for security and compliance purposes. Some
              information may remain temporarily in provider backups or logs, or be retained when
              required for fraud prevention, dispute resolution, tax, accounting, or other legal
              obligations.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="choices-rights">
            <h2 id="choices-rights" className={headingClassName}>
              8. Your choices and privacy rights
            </h2>
            <p>
              Depending on where you live, you may have rights to request access to, correction of,
              deletion of, restriction of, or portability of your personal information; object to
              certain processing; withdraw consent; or appeal a denied privacy request. You may
              also have the right to complain to your local data-protection authority.
            </p>
            <p>
              To exercise a right, use the data-deletion page or contact us at the address below.
              We may ask for information needed to verify your identity and request. You may
              unsubscribe from optional email messages using the controls provided in GrowthLens or
              the message.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="international">
            <h2 id="international" className={headingClassName}>
              9. International data transfers
            </h2>
            <p>
              GrowthLens and its service providers may process information in the United States
              and other countries. Where required, we use recognized transfer mechanisms and
              contractual safeguards for international transfers of personal information.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="children">
            <h2 id="children" className={headingClassName}>
              10. Children&apos;s privacy
            </h2>
            <p>
              GrowthLens is a business service and is not directed to children under 18. We do not
              knowingly collect personal information from children. If you believe a child has
              provided information to us, contact us so we can investigate and delete it.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="changes">
            <h2 id="changes" className={headingClassName}>
              11. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy as GrowthLens changes. We will post the revised
              policy on this page and update the date above. If a change materially affects how we
              use information, we will provide additional notice when required.
            </p>
          </section>

          <section className={sectionClassName} aria-labelledby="contact">
            <h2 id="contact" className={headingClassName}>
              12. Contact us
            </h2>
            <p>
              For privacy questions or requests, email{" "}
              <a href="mailto:support@flowlog.dev" className={linkClassName}>
                support@flowlog.dev
              </a>
              . For account deletion, you may also use the{" "}
              <Link href="/data-deletion" className={linkClassName}>
                GrowthLens data-deletion form
              </Link>
              .
            </p>
          </section>
        </div>

        <footer className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-6 text-sm">
          <Link href="/" className={linkClassName}>
            Home
          </Link>
          <Link href="/terms" className={linkClassName}>
            Terms of Service
          </Link>
          <Link href="/data-deletion" className={linkClassName}>
            Delete your data
          </Link>
        </footer>
      </div>
    </main>
  );
}
