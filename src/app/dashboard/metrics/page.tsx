import Link from "next/link";
import { InsightRefreshControl } from "@/components/insight-refresh-control";
import { MetricsCharts, type FormatPoint, type MixPoint, type TrendPoint } from "@/components/metrics-charts";
import { requireCurrentCustomer } from "@/lib/current-customer";
import { hasCrossAccountWorkspace, hasOnDemandInsights, hasProductAccess } from "@/lib/entitlements";

type DailyMetric = {
  account_id: string | null;
  date: string;
  followers: number | null;
  reach: number | null;
  impressions: number | null;
  profile_views: number | null;
  engagement_rate: number | null;
  new_follows: number | null;
};

type PostMetric = {
  content_type: string | null;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
};

function compactNumber(value: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function numberValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { supabase, customer } = await requireCurrentCustomer();
  const params = await searchParams;
  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("id, platform, account_name, status")
    .eq("customer_id", customer.id)
    .neq("status", "revoked");

  const availableAccounts = accounts ?? [];
  const hasActiveAccess = hasProductAccess(customer);
  const canCombineAccounts = hasActiveAccess && hasCrossAccountWorkspace(customer.plan_tier);
  const requestedAccount = availableAccounts.find((account) => account.id === params.account);
  const selectedAccounts = canCombineAccounts && (!params.account || params.account === "all")
    ? availableAccounts
    : [requestedAccount ?? availableAccounts[0]].filter(Boolean);
  const accountIds = selectedAccounts.map((account) => account.id);
  // This authenticated server page is intentionally evaluated per request.
  // eslint-disable-next-line react-hooks/purity
  const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [metricsResult, postsResult] = accountIds.length
    ? await Promise.all([
        supabase
          .from("daily_metrics")
          .select("account_id, date, followers, reach, impressions, profile_views, engagement_rate, new_follows")
          .in("account_id", accountIds)
          .gte("date", periodStart)
          .order("date", { ascending: true })
          .limit(730),
        supabase
          .from("post_performance")
          .select("account_id, content_type, impressions, reach, likes, comments, shares, saves")
          .in("account_id", accountIds)
          .gte("posted_at", periodStart)
          .order("posted_at", { ascending: false })
          .limit(200),
      ])
    : [{ data: [] }, { data: [] }];

  const metrics = (metricsResult.data ?? []) as DailyMetric[];
  const posts = (postsResult.data ?? []) as PostMetric[];
  const latestByAccount = new Map<string, DailyMetric>();
  for (const metric of metrics) {
    if (metric.account_id) latestByAccount.set(metric.account_id, metric);
  }

  const followers = [...latestByAccount.values()].reduce((sum, metric) => sum + numberValue(metric.followers), 0);
  const views = posts.reduce((sum, post) => sum + numberValue(post.impressions), 0);
  const reach = posts.reduce((sum, post) => sum + numberValue(post.reach), 0);
  const likes = posts.reduce((sum, post) => sum + numberValue(post.likes), 0);
  const comments = posts.reduce((sum, post) => sum + numberValue(post.comments), 0);
  const shares = posts.reduce((sum, post) => sum + numberValue(post.shares), 0);
  const saves = posts.reduce((sum, post) => sum + numberValue(post.saves), 0);
  const engagements = likes + comments + shares + saves;
  const measuredExposure = views || reach;
  const engagementRate = measuredExposure > 0
    ? engagements / measuredExposure
    : metrics.length
      ? metrics.reduce((sum, metric) => sum + numberValue(metric.engagement_rate), 0) / metrics.length
      : 0;

  const trendByDate = new Map<string, TrendPoint>();
  for (const metric of metrics) {
    const current = trendByDate.get(metric.date) ?? { date: metric.date, views: 0, reach: 0, followers: 0 };
    current.views += numberValue(metric.impressions);
    current.reach += numberValue(metric.reach);
    current.followers += numberValue(metric.followers);
    trendByDate.set(metric.date, current);
  }
  const trend = [...trendByDate.values()];

  const mix: MixPoint[] = [
    { name: "Likes", value: likes },
    { name: "Comments", value: comments },
    { name: "Shares", value: shares },
    { name: "Saves", value: saves },
  ];

  const formatsByName = new Map<string, FormatPoint>();
  for (const post of posts) {
    const name = post.content_type?.trim() || "Other";
    const current = formatsByName.get(name) ?? { name, views: 0, engagements: 0 };
    current.views += numberValue(post.impressions);
    current.engagements += numberValue(post.likes) + numberValue(post.comments) + numberValue(post.shares) + numberValue(post.saves);
    formatsByName.set(name, current);
  }
  const formats = [...formatsByName.values()].sort((a, b) => b.views - a.views).slice(0, 6);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Signal room</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Metrics</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">See what is moving, which reactions matter, and where your next content test should focus.</p>
        </div>
        <Link href="/dashboard/connect" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.055] px-5 text-sm font-semibold text-white transition-colors hover:border-[#d9ff6b]/40">Sync sources</Link>
      </header>

      {!!availableAccounts.length && (
        <section className="rounded-2xl border border-white/11 bg-[#101513]/72 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/36">30-day performance view</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {canCombineAccounts && (
                  <Link
                    href="/dashboard/metrics?account=all"
                    className={`rounded-full border px-3 py-2 text-xs font-semibold ${!params.account || params.account === "all" ? "border-[#d9ff6b]/45 bg-[#d9ff6b]/12 text-[#d9ff6b]" : "border-white/12 text-white/56"}`}
                  >
                    All accounts
                  </Link>
                )}
                {availableAccounts.map((account) => {
                  const active = params.account === account.id || (!canCombineAccounts && account.id === accountIds[0]);
                  return (
                    <Link
                      key={account.id}
                      href={`/dashboard/metrics?account=${encodeURIComponent(account.id)}`}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold ${active ? "border-[#d9ff6b]/45 bg-[#d9ff6b]/12 text-[#d9ff6b]" : "border-white/12 text-white/56"}`}
                    >
                      <span data-no-translate>{account.account_name ?? account.platform}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            {!canCombineAccounts && availableAccounts.length > 1 && (
              <p className="max-w-md text-xs leading-5 text-white/42">
                Starter analyzes one account at a time. <Link href="/dashboard/billing?plan=pro" className="font-semibold text-[#d9ff6b]">Upgrade to Pro</Link> to combine every connected account in one workspace.
              </p>
            )}
          </div>
        </section>
      )}

      {hasActiveAccess && hasOnDemandInsights(customer.plan_tier) && (
        <InsightRefreshControl
          accounts={availableAccounts.map((account) => ({
            id: account.id,
            label: `${account.account_name ?? account.platform} (${account.platform})`,
          }))}
        />
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Metrics summary">
        {[
          { label: "Followers", value: compactNumber(followers), helper: "latest per connected account" },
          { label: "Video views", value: compactNumber(views), helper: `${posts.length} posts in 30 days` },
          { label: "Total engagements", value: compactNumber(engagements), helper: "likes, comments, shares, saves" },
          { label: "Engagement rate", value: `${(engagementRate * 100).toFixed(1)}%`, helper: measuredExposure ? "engagements divided by exposure" : "latest available average" },
        ].map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/11 bg-white/[0.055] p-4 backdrop-blur-xl">
            <p className="text-xs font-medium text-white/42">{metric.label}</p>
            <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em] text-white">{metric.value}</p>
            <p className="mt-1 text-[11px] text-white/32">{metric.helper}</p>
          </article>
        ))}
      </section>

      {!availableAccounts.length ? (
        <section className="rounded-2xl border border-white/12 bg-[#101513]/72 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white">Connect one account to open the signal room.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">GrowthLens never fills charts with demo numbers. Your real metrics appear after a successful platform sync.</p>
          <Link href="/dashboard/connect" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016]">Connect an account</Link>
        </section>
      ) : (
        <MetricsCharts trend={trend} mix={mix} formats={formats} />
      )}
    </div>
  );
}
