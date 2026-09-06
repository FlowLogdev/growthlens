import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/encryption";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import {
  getInstagramInsights,
  getInstagramProfile,
  listInstagramMedia,
  getMediaInsights,
  getPageInsights,
  getPageProfile,
} from "@/lib/integrations/meta";
import { syncTikTokAccountData } from "@/lib/integrations/sync-tiktok";

// One invocation per connected account (spec Section 8). Keeping this
// isolated per-account means one customer's expired token or rate-limited
// call fails independently without blocking the rest of the fan-out.
export async function POST(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = request.nextUrl.searchParams.get("account_id");
  if (!accountId) {
    return NextResponse.json({ error: "account_id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: account, error } = await supabase
    .from("platform_accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (error || !account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const accessToken = decryptToken(account.access_token);
  const today = new Date().toISOString().slice(0, 10);

  try {
    if (account.platform === "instagram") {
      const [insights, profile] = await Promise.all([
        getInstagramInsights(account.account_id, accessToken),
        getInstagramProfile(account.account_id, accessToken),
      ]);
      const metricValue = (name: string) =>
        insights?.data?.find((m: { name: string }) => m.name === name)?.values?.at(-1)?.value ??
        null;

      await supabase.from("daily_metrics").upsert(
        {
          customer_id: account.customer_id,
          account_id: account.id,
          date: today,
          reach: metricValue("reach"),
          impressions: metricValue("views"),
          profile_views: metricValue("profile_views"),
          followers: profile.followers_count ?? metricValue("follower_count"),
        },
        { onConflict: "account_id,date" },
      );

      const media = await listInstagramMedia(account.account_id, accessToken);
      for (const item of media?.data ?? []) {
        let mediaInsights: { data?: Array<{ name: string; values?: Array<{ value?: number }> }> } = {};
        try {
          mediaInsights = await getMediaInsights(item.id, accessToken);
        } catch (insightError) {
          // Meta does not expose every insight for every media type. Preserve
          // profile metrics and public post counts instead of failing the
          // entire account sync because one post rejects one metric.
          console.warn("Instagram media insights unavailable", {
            accountId: account.id,
            mediaId: item.id,
            mediaType: item.media_type,
            message: insightError instanceof Error ? insightError.message : "Unknown error",
          });
        }
        const value = (name: string) =>
          mediaInsights?.data?.find((m: { name: string }) => m.name === name)?.values?.[0]
            ?.value ?? null;

        await supabase.from("post_performance").upsert(
          {
            customer_id: account.customer_id,
            account_id: account.id,
            platform_post_id: item.id,
            posted_at: item.timestamp,
            content_type: item.media_type,
            caption: item.caption,
            permalink: item.permalink,
            reach: value("reach"),
            impressions: value("views"),
            likes: item.like_count ?? null,
            comments: item.comments_count ?? null,
            shares: value("shares"),
            saves: value("saved"),
          },
          { onConflict: "account_id,platform_post_id" },
        );
      }
    } else if (account.platform === "facebook") {
      const [insights, profile] = await Promise.all([
        getPageInsights(account.account_id, accessToken),
        getPageProfile(account.account_id, accessToken),
      ]);
      const metricValue = (name: string) =>
        insights?.data?.find((m: { name: string }) => m.name === name)?.values?.at(-1)?.value ??
        null;

      await supabase.from("daily_metrics").upsert(
        {
          customer_id: account.customer_id,
          account_id: account.id,
          date: today,
          impressions: metricValue("page_media_view"),
          reach: metricValue("page_total_media_view_unique"),
          followers: profile.followers_count ?? profile.fan_count ?? metricValue("page_follows"),
          engagement_rate: metricValue("page_media_view")
            ? (metricValue("page_post_engagements") ?? 0) / metricValue("page_media_view")!
            : null,
        },
        { onConflict: "account_id,date" },
      );
    } else if (account.platform === "tiktok") {
      await syncTikTokAccountData({
        accountId: account.id,
        customerId: account.customer_id,
        accessToken,
      });
    }

    return NextResponse.json({ synced: true, account_id: accountId });
  } catch (err) {
    await supabase.from("platform_accounts").update({ status: "expired" }).eq("id", accountId);

    return NextResponse.json(
      { error: (err as Error).message, account_id: accountId },
      { status: 502 },
    );
  }
}
