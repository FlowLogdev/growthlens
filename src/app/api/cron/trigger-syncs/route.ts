import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasProductAccess } from "@/lib/entitlements";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

// Fan-out entrypoint (spec Section 8). Never loop through every account's
// API calls in this single invocation — Vercel functions have execution
// time limits, and one slow/expired-token account would block everyone
// else's sync. Instead, this just enqueues one call per account and returns.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: accounts, error } = await supabase
    .from("platform_accounts")
    .select("id, customer_id")
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const customerIds = [...new Set((accounts ?? []).map((account) => account.customer_id))];
  const { data: customers, error: customerError } = customerIds.length
    ? await supabase
        .from("customers")
        .select("id, subscription_status, trial_ends_at")
        .in("id", customerIds)
    : { data: [], error: null };

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  const eligibleCustomerIds = new Set(
    (customers ?? []).filter((customer) => hasProductAccess(customer)).map((customer) => customer.id),
  );
  const eligibleAccounts = (accounts ?? []).filter((account) =>
    eligibleCustomerIds.has(account.customer_id),
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const results = await Promise.allSettled(
    eligibleAccounts.map((account) =>
      fetch(`${siteUrl}/api/jobs/sync-account?account_id=${account.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      }).then(async (response) => {
        if (!response.ok) {
          const detail = await response.text();
          throw new Error(`Sync failed for ${account.id}: ${response.status} ${detail}`);
        }
        return response;
      }),
    ),
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    triggered: eligibleAccounts.length,
    failed,
  });
}
