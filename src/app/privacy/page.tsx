export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last updated: [DATE]</p>
      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <p>
          TODO: Replace this placeholder before submitting for Meta/TikTok App Review (spec
          Section 13). Meta and TikTok will read this page directly, so it must specifically
          describe:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            What social data is collected via each permission (e.g. `instagram_manage_insights`,
            `pages_read_engagement`, `user.info.basic`, `video.list`, `video.insights`) and why.
          </li>
          <li>Where and how tokens and metrics are stored (Supabase Postgres, encrypted at rest).</li>
          <li>How long data is retained and how a customer can request deletion (see Data Deletion page).</li>
          <li>Any subprocessors used (Supabase, Stripe, Anthropic, Resend, Vercel).</li>
        </ul>
      </div>
    </div>
  );
}
