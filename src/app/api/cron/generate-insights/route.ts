import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

// Weekly fan-out for AI insight generation (spec Sections 6 and 10) — same
// pattern as trigger-syncs: enqueue one call per account rather than looping
// in a single long-running invocation.
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
      fetch(`${siteUrl}/api/insights/generate?account_id=${account.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    ),
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ triggered: accounts?.length ?? 0, failed });
}
