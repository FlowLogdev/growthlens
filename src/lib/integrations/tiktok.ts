import "server-only";

// TikTok API integration — kept isolated from meta.ts so App Review delays
// on one platform never block shipping the other (spec Section 15).
// Access tokens last 24h, refresh tokens last 365 days — see refreshTikTokToken,
// which the token-refresh cron job (Section 7.2) must call before expiry.

const API_BASE = "https://open.tiktokapis.com";

export const TIKTOK_OAUTH_SCOPES = ["user.info.basic", "video.list", "video.insights"].join(",");

export function buildTikTokAuthUrl(state: string) {
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY!);
  url.searchParams.set("redirect_uri", process.env.TIKTOK_REDIRECT_URI!);
  url.searchParams.set("scope", TIKTOK_OAUTH_SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  token_type: string;
}

export async function exchangeTikTokCode(code: string): Promise<TikTokTokenResponse> {
  const res = await fetch(`${API_BASE}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    }),
  });

  if (!res.ok) {
    throw new Error(`TikTok token exchange failed: ${await res.text()}`);
  }
  return res.json();
}

export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse> {
  const res = await fetch(`${API_BASE}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`TikTok token refresh failed: ${await res.text()}`);
  }
  return res.json();
}

export async function getTikTokUserInfo(accessToken: string) {
  const url = new URL(`${API_BASE}/v2/user/info/`);
  url.searchParams.set("fields", "open_id,display_name,avatar_url,follower_count");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`TikTok user info failed: ${await res.text()}`);
  }
  return res.json();
}

export async function listTikTokVideos(accessToken: string, cursor = 0) {
  const res = await fetch(`${API_BASE}/v2/video/list/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      max_count: 20,
      cursor,
      fields: [
        "id",
        "title",
        "create_time",
        "view_count",
        "like_count",
        "comment_count",
        "share_count",
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`TikTok video list failed: ${await res.text()}`);
  }
  return res.json();
}

export async function queryTikTokVideoInsights(accessToken: string, videoIds: string[]) {
  const res = await fetch(`${API_BASE}/v2/video/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filters: { video_ids: videoIds },
      fields: ["id", "view_count", "like_count", "comment_count", "share_count"],
    }),
  });
  if (!res.ok) {
    throw new Error(`TikTok video insights failed: ${await res.text()}`);
  }
  return res.json();
}
