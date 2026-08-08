import { requireCurrentCustomer } from "@/lib/current-customer";
import { getAccountLimit } from "@/lib/plans";
import { getMetaOAuthConfiguration } from "@/lib/integrations/meta";
import { getTikTokOAuthConfiguration } from "@/lib/integrations/tiktok";
import { syncTikTokAccount } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  meta_not_configured: "Facebook and Instagram connection is temporarily unavailable while the Meta app credentials are completed.",
  tiktok_not_configured: "TikTok connection is temporarily unavailable while the TikTok app credentials are completed.",
  access_denied: "The connection was canceled before permission was granted.",
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string; limit?: string; sync?: string }>;
}) {
  const { connected, error, limit, sync } = await searchParams;
  const { supabase, customer } = await requireCurrentCustomer();
  const metaConfig = getMetaOAuthConfiguration();
  const tiktokConfig = getTikTokOAuthConfiguration();

  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("id, platform, account_name, status, connected_at")
    .eq("customer_id", customer.id);

  const byPlatform = (platform: string) => accounts?.filter((account) => account.platform === platform) ?? [];
  const accountLimit = getAccountLimit(customer.plan_tier);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Data sources</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Connect accounts</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Choose a platform, approve analytics access, and return to GrowthLens. We request performance data only.</p>
      </header>

      {connected && <p className="rounded-2xl border border-[#7be58c]/28 bg-[#7be58c]/10 p-4 text-sm text-[#baf4c3]">Connected {connected} successfully.</p>}
      {sync === "complete" && <p className="rounded-2xl border border-[#7be58c]/28 bg-[#7be58c]/10 p-4 text-sm text-[#baf4c3]">TikTok data synced successfully. Your latest profile and video metrics are now available.</p>}
      {sync === "failed" && <p className="rounded-2xl border border-[#d9ff6b]/25 bg-[#d9ff6b]/10 p-4 text-sm text-[#e8ffad]">TikTok is connected, but its first data sync did not finish. GrowthLens will retry automatically on the next scheduled sync.</p>}
      {error && <p className="rounded-2xl border border-[#ff7d66]/30 bg-[#ff7d66]/10 p-4 text-sm text-[#ffc1b5]">{ERROR_MESSAGES[error] ?? error}</p>}
      {limit && <p className="rounded-2xl border border-[#d9ff6b]/25 bg-[#d9ff6b]/10 p-4 text-sm text-[#e8ffad]">Available accounts were connected up to this plan&apos;s {accountLimit}-account limit.</p>}

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm backdrop-blur-xl">
        <span className="text-white/48">Account capacity</span>
        <span className="font-mono font-semibold text-white">{accounts?.length ?? 0} / {accountLimit}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/11 bg-[#101513]/68 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#67c7f2]">Meta</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Facebook and Instagram</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${metaConfig.ready ? "bg-[#7be58c]/15 text-[#baf4c3]" : "bg-[#ff7d66]/12 text-[#ffc1b5]"}`}>
              {metaConfig.ready ? "Ready" : "Setup needed"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/48">Connect a Facebook Page and its linked Instagram Business or Creator account.</p>
          <ol className="mt-5 space-y-2 text-xs leading-5 text-white/46">
            <li>1. Sign in to the Facebook profile that manages the Page.</li>
            <li>2. Select the Page and linked Instagram account.</li>
            <li>3. Approve the requested insights permissions.</li>
          </ol>
          {[...byPlatform("facebook"), ...byPlatform("instagram")].length ? (
            <div className="mt-6 space-y-2">
              {[...byPlatform("facebook"), ...byPlatform("instagram")].map((account) => (
                <p key={account.id} className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-white/68">{account.platform}: {account.account_name} ({account.status})</p>
              ))}
            </div>
          ) : metaConfig.ready ? (
            <a href="/api/oauth/meta" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016] transition-transform hover:-translate-y-px">Connect Meta</a>
          ) : (
            <div className="mt-6 rounded-xl border border-[#ff7d66]/20 bg-[#ff7d66]/[0.07] p-3 text-xs leading-5 text-[#ffc1b5]">The app owner must add META_APP_ID and META_APP_SECRET in production. The callback URL is generated automatically.</div>
          )}
        </section>

        <section className="rounded-2xl border border-white/11 bg-[#101513]/68 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ff7d66]">TikTok</p>
              <h2 className="mt-2 text-xl font-semibold text-white">TikTok Business</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${tiktokConfig.ready ? "bg-[#7be58c]/15 text-[#baf4c3]" : "bg-[#ff7d66]/12 text-[#ffc1b5]"}`}>
              {tiktokConfig.ready ? "Ready" : "Setup needed"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/48">Connect a TikTok Business account to compare videos, engagement, and audience response.</p>
          <ol className="mt-5 space-y-2 text-xs leading-5 text-white/46">
            <li>1. Sign in to the TikTok account you want to analyze.</li>
            <li>2. Review the requested profile and video insights access.</li>
            <li>3. Authorize and return to GrowthLens.</li>
          </ol>
          {byPlatform("tiktok").length ? (
            <div className="mt-6 space-y-2">
              {byPlatform("tiktok").map((account) => (
                <div key={account.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white/68 sm:flex-row sm:items-center sm:justify-between">
                  <p>{account.account_name} ({account.status})</p>
                  <form action={syncTikTokAccount}>
                    <input type="hidden" name="account_id" value={account.id} />
                    <button type="submit" className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#d9ff6b]/35 px-4 text-xs font-bold text-[#d9ff6b] transition-colors hover:bg-[#d9ff6b]/10">Sync data now</button>
                  </form>
                </div>
              ))}
            </div>
          ) : tiktokConfig.ready ? (
            <a href="/api/oauth/tiktok" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016] transition-transform hover:-translate-y-px">Connect TikTok</a>
          ) : (
            <div className="mt-6 rounded-xl border border-[#ff7d66]/20 bg-[#ff7d66]/[0.07] p-3 text-xs leading-5 text-[#ffc1b5]">The app owner must add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in production. The callback URL is generated automatically.</div>
          )}
        </section>
      </div>
    </div>
  );
}
