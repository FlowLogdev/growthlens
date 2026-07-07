import Link from "next/link";
import { requireCurrentCustomer } from "@/lib/current-customer";

export default async function DashboardOverviewPage() {
  const { supabase, customer } = await requireCurrentCustomer();

  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("id, platform, account_name, status")
    .eq("customer_id", customer.id);

  const { data: latestInsight } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("customer_id", customer.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-gray-500">
          Plan: {customer.plan_tier} · Status: {customer.subscription_status}
        </p>
      </div>

      {!accounts?.length && (
        <div className="rounded border border-dashed border-gray-300 p-6 text-center">
          <p className="mb-3 text-sm text-gray-600">No accounts connected yet.</p>
          <Link href="/dashboard/connect" className="text-sm font-medium underline">
            Connect Facebook, Instagram, or TikTok
          </Link>
        </div>
      )}

      {!!accounts?.length && (
        <div className="grid grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="rounded border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500">{account.platform}</p>
              <p className="font-medium">{account.account_name ?? account.id}</p>
              <p className="text-xs text-gray-500">{account.status}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-medium">Latest AI insight</h2>
        {!latestInsight && (
          <p className="text-sm text-gray-500">
            No insights generated yet — connect an account to get your first recommendations.
          </p>
        )}
        {latestInsight && (
          <div className="rounded border border-gray-200 p-4">
            <p className="mb-2 text-xs text-gray-500">
              {latestInsight.period_start} – {latestInsight.period_end}
            </p>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(latestInsight.recommendations, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
