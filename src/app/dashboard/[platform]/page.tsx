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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold capitalize">{platform}</h1>

      {!platformAccounts?.length && (
        <p className="text-sm text-gray-500">
          No {platform} account connected. Connect one from the Connect accounts page.
        </p>
      )}

      {!!platformAccounts?.length && (
        <div className="rounded border border-gray-200 p-4">
          <p className="mb-2 text-sm font-medium">Daily metrics (last {metrics?.length ?? 0} days)</p>
          {!metrics?.length ? (
            <p className="text-sm text-gray-500">No metrics synced yet — check back after the next sync run.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pr-4">Date</th>
                  <th className="pr-4">Followers</th>
                  <th className="pr-4">Reach</th>
                  <th className="pr-4">Impressions</th>
                  <th>Engagement rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.date}>
                    <td className="pr-4">{m.date}</td>
                    <td className="pr-4">{m.followers ?? "–"}</td>
                    <td className="pr-4">{m.reach ?? "–"}</td>
                    <td className="pr-4">{m.impressions ?? "–"}</td>
                    <td>{m.engagement_rate ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
