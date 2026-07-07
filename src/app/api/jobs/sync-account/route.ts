import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/encryption";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import {
  getInstagramInsights,
  listInstagramMedia,
  getMediaInsights,
  getPageInsights,
} from "@/lib/integrations/meta";
import { listTikTokVideos } from "@/lib/integrations/tiktok";

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
      const insights = await getInstagramInsights(account.account_id, accessToken);
      const metricValue = (name: string) =>
        insights?.data?.find((m: { name: string }) => m.name === name)?.values?.at(-1)?.value ??
        null;

      await supabase.from("daily_metrics").upsert(
        {
          customer_id: account.customer_id,
          account_id: account.id,
          date: today,
          reach: metricValue("reach"),
          impressions: metricValue("impressions"),
          profile_views: metricValue("profile_views"),
          followers: metricValue("follower_count"),
        },
        { onConflict: "account_id,date" },
      );

      const media = await listInstagramMedia(account.account_id, accessToken);
      for (const item of media?.data ?? []) {
        const mediaInsights = await getMediaInsights(item.id, accessToken);
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
            impressions: value("impressions"),
            likes: value("likes"),
            comments: value("comments"),
            shares: value("shares"),
            saves: value("saved"),
          },
          { onConflict: "account_id,platform_post_id" },
        );
      }
    } else if (account.platform === "facebook") {
      const insights = await getPageInsights(account.account_id, accessToken);
      const metricValue = (name: string) =>
        insights?.data?.find((m: { name: string }) => m.name === name)?.values?.at(-1)?.value ??
        null;

      await supabase.from("daily_metrics").upsert(
        {
          customer_id: account.customer_id,
          account_id: account.id,
          date: today,
          impressions: metricValue("page_impressions"),
          followers: metricValue("page_fans"),
        },
        { onConflict: "account_id,date" },
      );
    } else if (account.platform === "tiktok") {
      const videos = await listTikTokVideos(accessToken);
      for (const video of videos?.data?.videos ?? []) {
        await supabase.from("post_performance").upsert(
          {
            customer_id: account.customer_id,
            account_id: account.id,
            platform_post_id: video.id,
            posted_at: new Date(video.create_time * 1000).toISOString(),
            content_type: "video",
            caption: video.title,
            likes: video.like_count,
            comments: video.comment_count,
            shares: video.share_count,
            impressions: video.view_count,
          },
          { onConflict: "account_id,platform_post_id" },
        );
      }
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
