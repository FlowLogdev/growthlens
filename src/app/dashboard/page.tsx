import Link from "next/link";
import { getAccountLimit } from "@/lib/plans";
import { requireCurrentCustomer } from "@/lib/current-customer";

function formatStatus(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "Not available";
}

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { supabase, customer } = await requireCurrentCustomer();
  const params = await searchParams;

  const [{ data: accounts }, { data: latestInsight }, { data: metrics }] = await Promise.all([
    supabase
      .from("platform_accounts")
      .select("id, platform, account_name, status")
      .eq("customer_id", customer.id),
    supabase
      .from("ai_insights")
      .select("period_start, period_end, recommendations, blockers, generated_at")
      .eq("customer_id", customer.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("daily_metrics")
      .select("account_id, date, followers, reach, impressions, engagement_rate, platform_accounts!inner(customer_id)")
      .eq("platform_accounts.customer_id", customer.id)
      .order("date", { ascending: false })
      .limit(20),
  ]);

  const totals = (metrics ?? []).reduce(
    (result, metric) => ({
      followers: result.followers,
      reach: result.reach + (metric.reach ?? 0),
      impressions: result.impressions + (metric.impressions ?? 0),
      engagement: result.engagement + (metric.engagement_rate ?? 0),
    }),
    { followers: 0, reach: 0, impressions: 0, engagement: 0 },
  );
  const latestFollowers = new Map<string, number>();
  for (const metric of metrics ?? []) {
    if (metric.account_id && !latestFollowers.has(metric.account_id)) {
      latestFollowers.set(metric.account_id, metric.followers ?? 0);
    }
  }
  totals.followers = [...latestFollowers.values()].reduce((sum, value) => sum + value, 0);
  const averageEngagement = metrics?.length ? totals.engagement / metrics.length : 0;
  const recommendations = Array.isArray(latestInsight?.recommendations)
    ? latestInsight.recommendations as Array<{ action?: string; why?: string; timeframe?: string }>
    : [];

  return (
    <div className="space-y-7">
      {params.checkout === "success" && (
        <p className="rounded-xl border border-[#58cc70]/35 bg-[#58cc70]/10 p-4 text-sm text-[#b8f2c2]">
          Subscription activated. Your {formatStatus(customer.plan_tier)} plan and account allowance are ready.
        </p>
      )}
      {params.checkout === "failed" && (
        <p className="rounded-xl border border-[#ff806b]/35 bg-[#ff806b]/10 p-4 text-sm text-[#ffb5a8]">
          We could not confirm the checkout. No plan change was applied. Open Billing to retry or contact support.
        </p>
      )}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Performance workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Overview</h1>
          <p className="mt-2 text-sm text-white/48">
            {customer.business_name ?? customer.email}, {formatStatus(customer.plan_tier)} plan, {formatStatus(customer.subscription_status)}
          </p>
        </div>
        <Link href="/dashboard/connect" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016] transition-transform hover:-translate-y-px">
          {accounts?.length ? "Manage accounts" : "Connect an account"}
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Performance summary">
        {[
          { label: "Connected", value: `${accounts?.length ?? 0} / ${getAccountLimit(customer.plan_tier)}`, helper: `${formatStatus(customer.plan_tier)} plan allowance` },
          { label: "Followers", value: totals.followers.toLocaleString(), helper: "latest synced totals" },
          { label: "Reach", value: totals.reach.toLocaleString(), helper: "recent data points" },
          { label: "Engagement", value: `${(averageEngagement * 100).toFixed(1)}%`, helper: "recent average" },
        ].map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/11 bg-white/[0.055] p-4 backdrop-blur-xl">
            <p className="text-xs font-medium text-white/42">{metric.label}</p>
            <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em] text-white">{metric.value}</p>
            <p className="mt-1 text-[11px] text-white/32">{metric.helper}</p>
          </article>
        ))}
      </section>

      {!accounts?.length ? (
        <section className="grid gap-6 rounded-2xl border border-white/12 bg-[#101513]/68 p-6 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white">Your first useful signal starts with one account.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/54">Connect Facebook and Instagram or TikTok. GrowthLens will sync performance data, compare content, and prepare evidence-backed actions.</p>
          </div>
          <div className="rounded-2xl border border-[#d9ff6b]/20 bg-[#d9ff6b]/[0.07] p-5">
            <p className="text-sm font-semibold text-white">Connection checklist</p>
            <ol className="mt-3 space-y-2 text-sm text-white/58">
              <li>1. Choose the social platform.</li>
              <li>2. Approve read-only analytics access.</li>
              <li>3. Return here and wait for the first sync.</li>
            </ol>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/11 bg-white/[0.055] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Connected accounts</h2>
            <Link href="/dashboard/connect" className="text-xs font-semibold text-[#d9ff6b]">Manage</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {accounts.map((account) => (
              <Link key={account.id} href={`/dashboard/${account.platform}`} className="rounded-2xl border border-white/10 bg-[#0d120f]/48 p-4 transition-colors hover:border-[#d9ff6b]/35">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#d9ff6b]">{account.platform}</p>
                <p className="mt-2 font-semibold text-white">{account.account_name ?? account.id}</p>
                <p className="mt-1 text-xs capitalize text-white/40">{formatStatus(account.status)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/11 bg-white/[0.055] p-5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Latest growth actions</h2>
            <p className="mt-1 text-xs text-white/38">The Growth coach can explain the evidence and help you plan the test.</p>
          </div>
          <Link href="/dashboard/metrics" className="text-xs font-semibold text-[#d9ff6b]">Open Metrics</Link>
        </div>
        {!recommendations.length ? (
          <p className="mt-6 rounded-2xl border border-dashed border-white/14 px-4 py-7 text-sm text-white/45">Connect an account and complete the first sync to generate recommendations.</p>
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {recommendations.slice(0, 4).map((item, index) => (
              <article key={`${item.action}-${index}`} className="rounded-2xl border border-white/10 bg-[#0d120f]/48 p-4">
                <p className="text-sm font-semibold leading-6 text-white">{item.action ?? "Review this growth signal"}</p>
                {item.why && <p className="mt-2 text-xs leading-5 text-white/48">{item.why}</p>}
                {item.timeframe && <p className="mt-3 text-[11px] font-semibold text-[#d9ff6b]">{item.timeframe}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
