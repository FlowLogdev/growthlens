import { requireCurrentCustomer } from "@/lib/current-customer";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
  const { supabase, customer } = await requireCurrentCustomer();

  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("id, platform, account_name, status, connected_at")
    .eq("customer_id", customer.id);

  const byPlatform = (platform: string) => accounts?.filter((a) => a.platform === platform) ?? [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Connect accounts</h1>

      {connected && (
        <p className="rounded bg-green-50 p-3 text-sm text-green-700">
          Connected {connected} successfully.
        </p>
      )}
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded border border-gray-200 p-5">
          <h2 className="font-medium">Facebook & Instagram</h2>
          <p className="mb-4 text-sm text-gray-500">
            Connects your Facebook Page and its linked Instagram Business account.
          </p>
          {byPlatform("facebook").length === 0 && byPlatform("instagram").length === 0 ? (
            <a
              href="/api/oauth/meta"
              className="inline-block rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              Connect Facebook & Instagram
            </a>
          ) : (
            <ul className="space-y-1 text-sm">
              {[...byPlatform("facebook"), ...byPlatform("instagram")].map((a) => (
                <li key={a.id}>
                  {a.platform}: {a.account_name} ({a.status})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded border border-gray-200 p-5">
          <h2 className="font-medium">TikTok</h2>
          <p className="mb-4 text-sm text-gray-500">Connects your TikTok Business account.</p>
          {byPlatform("tiktok").length === 0 ? (
            <a
              href="/api/oauth/tiktok"
              className="inline-block rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              Connect TikTok
            </a>
          ) : (
            <ul className="space-y-1 text-sm">
              {byPlatform("tiktok").map((a) => (
                <li key={a.id}>
                  {a.account_name} ({a.status})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
