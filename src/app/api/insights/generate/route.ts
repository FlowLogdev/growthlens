import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { hasOnDemandInsights, hasProductAccess } from "@/lib/entitlements";
import { engagementRate, generateInsights, type PostSummary } from "@/lib/anthropic/analyze";

const PERIOD_DAYS = 30;
const ON_DEMAND_COOLDOWN_MS = 6 * 60 * 60 * 1000;

// Runs per customer, per account (spec Section 10), invoked either by the
// weekly cron fan-out or on-demand from the dashboard's "Refresh insights"
// action — Pro/Business tiers get the on-demand path per Section 12.
export async function POST(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get("account_id");
  if (!accountId) {
    return NextResponse.json({ error: "account_id is required" }, { status: 400 });
  }

  const isCron = isAuthorizedCronRequest(request);
  const supabase = isCron ? createAdminClient() : await createClient();

  if (!isCron) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { data: account, error: accountError } = await supabase
    .from("platform_accounts")
    .select("id, customer_id, platform, account_name")
    .eq("id", accountId)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (!isCron) {
    const { data: customer } = await supabase
      .from("customers")
      .select("plan_tier, subscription_status, trial_ends_at")
      .eq("id", account.customer_id)
      .single();

    if (!customer || !hasProductAccess(customer)) {
      return NextResponse.json(
        { error: "Your trial or subscription is not active." },
        { status: 402 },
      );
    }

    if (!hasOnDemandInsights(customer.plan_tier)) {
      return NextResponse.json(
        { error: "On-demand insight refreshes are available on Pro." },
        { status: 403 },
      );
    }

    const since24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCustomerInsightCount } = await supabase
      .from("ai_insights")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", account.customer_id)
      .gte("generated_at", since24Hours);

    if ((recentCustomerInsightCount ?? 0) >= 4) {
      return NextResponse.json(
        { error: "Your account has reached the 24-hour insight refresh limit." },
        { status: 429 },
      );
    }

    const { data: latestInsight } = await supabase
      .from("ai_insights")
      .select("generated_at")
      .eq("account_id", account.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const generatedAt = latestInsight?.generated_at
      ? new Date(latestInsight.generated_at).getTime()
      : 0;
    const elapsed = Date.now() - generatedAt;

    if (generatedAt && elapsed < ON_DEMAND_COOLDOWN_MS) {
      return NextResponse.json(
        {
          error: "Insights were refreshed recently. Try again after the 6-hour refresh window.",
          retry_after_seconds: Math.ceil((ON_DEMAND_COOLDOWN_MS - elapsed) / 1000),
        },
        { status: 429 },
      );
    }
  }

  const periodStart = new Date(Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const periodEnd = new Date().toISOString().slice(0, 10);

  const { data: dailyMetrics } = await supabase
    .from("daily_metrics")
    .select("date, followers, reach, impressions, engagement_rate")
    .eq("account_id", accountId)
    .gte("date", periodStart)
    .order("date", { ascending: true });

  const { data: posts } = await supabase
    .from("post_performance")
    .select("*")
    .eq("account_id", accountId)
    .gte("posted_at", periodStart);

  const ranked: PostSummary[] = (posts ?? [])
    .map((post) => ({
      platform_post_id: post.platform_post_id,
      caption: post.caption,
      content_type: post.content_type,
      posted_at: post.posted_at,
      reach: post.reach,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      engagement_rate: engagementRate(post),
    }))
    .sort((a, b) => b.engagement_rate - a.engagement_rate);

  const topPosts = ranked.slice(0, 5);
  const bottomPosts = ranked.slice(-5).reverse();

  try {
    const { result, raw } = await generateInsights({
      platform: account.platform,
      niche: "general", // TODO: surface a customer-set niche/industry field once onboarding collects it
      periodDays: PERIOD_DAYS,
      dailyMetrics: dailyMetrics ?? [],
      topPosts,
      bottomPosts,
    });

    const { data: insight, error: insertError } = await supabase
      .from("ai_insights")
      .insert({
        customer_id: account.customer_id,
        account_id: account.id,
        period_start: periodStart,
        period_end: periodEnd,
        top_performers: result.top_performers,
        blockers: result.blockers,
        recommendations: result.recommendations,
        raw_response: raw,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ insight });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
