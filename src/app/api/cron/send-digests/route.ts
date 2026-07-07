import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sendWeeklyDigestEmail } from "@/lib/resend/digest";
import type { AiInsightResult } from "@/lib/anthropic/analyze";

// Runs after /api/cron/generate-insights each week (spec Section 6, step 5).
// Groups the week's insights per customer — a customer with 3 connected
// accounts gets one digest, not three.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: insights, error } = await supabase
    .from("ai_insights")
    .select("customer_id, top_performers, blockers, recommendations")
    .gte("generated_at", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byCustomer = new Map<string, AiInsightResult[]>();
  for (const row of insights ?? []) {
    const list = byCustomer.get(row.customer_id) ?? [];
    list.push({
      top_performers: row.top_performers,
      blockers: row.blockers,
      recommendations: row.recommendations,
    } as AiInsightResult);
    byCustomer.set(row.customer_id, list);
  }

  let sent = 0;
  let failed = 0;

  for (const [customerId, customerInsights] of byCustomer) {
    const { data: customer } = await supabase
      .from("customers")
      .select("email, business_name")
      .eq("id", customerId)
      .single();

    if (!customer?.email) {
      failed++;
      continue;
    }

    try {
      await sendWeeklyDigestEmail({
        to: customer.email,
        businessName: customer.business_name,
        insights: customerInsights,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
