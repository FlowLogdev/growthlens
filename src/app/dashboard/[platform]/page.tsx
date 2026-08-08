import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentCustomer } from "@/lib/current-customer";

const VALID_PLATFORMS = ["facebook", "instagram", "tiktok"];

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!VALID_PLATFORMS.includes(platform)) {
    notFound();
  }

  const { supabase, customer } = await requireCurrentCustomer();

  const { data: platformAccounts } = await supabase
    .from("platform_accounts")
    .select("id, account_name")
    .eq("customer_id", customer.id)
    .eq("platform", platform);

  const accountIds = (platformAccounts ?? []).map((a) => a.id);

  const { data: metrics } = accountIds.length
    ? await supabase
        .from("daily_metrics")
        .select("date, reach, impressions, engagement_rate, followers")
        .in("account_id", accountIds)
        .order("date", { ascending: true })
        .limit(90)
    : { data: [] };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Platform detail</p>
          <h1 className="mt-2 text-3xl font-semibold capitalize tracking-[-0.045em] text-white sm:text-4xl">{platform}</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">Inspect the latest account-level snapshots for this platform.</p>
        </div>
        <Link href="/dashboard/metrics" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white hover:border-[#d9ff6b]/40">Open Metrics</Link>
      </header>

      {!platformAccounts?.length && (
        <p className="rounded-2xl border border-white/12 bg-[#101513]/72 p-6 text-sm text-white/48">
          No {platform} account connected. Connect one from the Connect accounts page.
        </p>
      )}

      {!!platformAccounts?.length && (
        <section className="overflow-hidden rounded-2xl border border-white/11 bg-[#101513]/72 backdrop-blur-xl">
          <div className="border-b border-white/10 p-5">
            <p className="text-sm font-semibold text-white">Daily metric snapshots</p>
            <p className="mt-1 text-xs text-white/38">Latest {metrics?.length ?? 0} available data points</p>
          </div>
          {!metrics?.length ? (
            <p className="p-6 text-sm text-white/42">No metrics synced yet. Run a new sync from Connect accounts.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] bg-transparent text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                  <th className="pr-4">Date</th>
                  <th className="pr-4">Followers</th>
                  <th className="pr-4">Reach</th>
                  <th className="pr-4">Impressions</th>
                  <th>Engagement rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.date} className="border-t border-white/[0.07] text-white/68">
                    <td className="pr-4">{m.date}</td>
                    <td className="pr-4">{m.followers ?? "-"}</td>
                    <td className="pr-4">{m.reach ?? "-"}</td>
                    <td className="pr-4">{m.impressions ?? "-"}</td>
                    <td>{m.engagement_rate ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
