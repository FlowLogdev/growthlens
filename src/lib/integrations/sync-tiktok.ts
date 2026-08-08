import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getTikTokUserInfo, listTikTokVideos } from "@/lib/integrations/tiktok";

interface SyncTikTokAccountInput {
  accountId: string;
  customerId: string;
  accessToken: string;
}

export async function syncTikTokAccountData({
  accountId,
  customerId,
  accessToken,
}: SyncTikTokAccountInput) {
  const supabase = createAdminClient();
  const [userInfo, videos] = await Promise.all([
    getTikTokUserInfo(accessToken),
    listTikTokVideos(accessToken),
  ]);
  const profile = userInfo?.data?.user;
  const today = new Date().toISOString().slice(0, 10);

  const { error: metricError } = await supabase.from("daily_metrics").upsert(
    {
      customer_id: customerId,
      account_id: accountId,
      date: today,
      followers: profile?.follower_count ?? null,
    },
    { onConflict: "account_id,date" },
  );

  if (metricError) {
    throw new Error(`TikTok metric sync failed: ${metricError.message}`);
  }

  const videoRows = (videos?.data?.videos ?? []).map(
    (video: {
      id: string;
      title?: string;
      create_time: number;
      view_count?: number;
      like_count?: number;
      comment_count?: number;
      share_count?: number;
      share_url?: string;
    }) => ({
      customer_id: customerId,
      account_id: accountId,
      platform_post_id: video.id,
      posted_at: new Date(video.create_time * 1000).toISOString(),
      content_type: "video",
      caption: video.title ?? null,
      likes: video.like_count ?? null,
      comments: video.comment_count ?? null,
      shares: video.share_count ?? null,
      impressions: video.view_count ?? null,
      permalink: video.share_url ?? null,
    }),
  );

  if (videoRows.length) {
    const { error: postError } = await supabase
      .from("post_performance")
      .upsert(videoRows, { onConflict: "account_id,platform_post_id" });

    if (postError) {
      throw new Error(`TikTok video sync failed: ${postError.message}`);
    }
  }

  return {
    followers: profile?.follower_count ?? null,
    following: profile?.following_count ?? null,
    likes: profile?.likes_count ?? null,
    videos: profile?.video_count ?? videoRows.length,
    syncedVideos: videoRows.length,
  };
}
