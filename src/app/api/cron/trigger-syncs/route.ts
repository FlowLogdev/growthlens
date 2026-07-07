import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    .select("id")
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const results = await Promise.allSettled(
    (accounts ?? []).map((account) =>
      fetch(`${siteUrl}/api/jobs/sync-account?account_id=${account.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    ),
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    triggered: accounts?.length ?? 0,
    failed,
  });
}
