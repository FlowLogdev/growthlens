import "server-only";

// Meta Graph API integration — kept isolated from tiktok.ts so App Review
// delays on one platform never block shipping the other (spec Section 15).

const GRAPH_VERSION = "v19.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export const META_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_insights",
].join(",");

export function buildMetaAuthUrl(state: string) {
  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("redirect_uri", process.env.META_REDIRECT_URI!);
  url.searchParams.set("scope", META_OAUTH_SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeMetaCode(code: string) {
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  url.searchParams.set("redirect_uri", process.env.META_REDIRECT_URI!);
  url.searchParams.set("code", code);

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Meta token exchange failed: ${await res.text()}`);
  }
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

// Short-lived user tokens (~1-2h) must be exchanged for a long-lived token
// (~60 days) before being stored — otherwise the sync job breaks within hours.
export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Meta long-lived token exchange failed: ${await res.text()}`);
  }
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

export async function listPages(userAccessToken: string): Promise<MetaPage[]> {
  const url = new URL(`${GRAPH_BASE}/me/accounts`);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account");
  url.searchParams.set("access_token", userAccessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Meta list pages failed: ${await res.text()}`);
  }
  const json = (await res.json()) as { data: MetaPage[] };
  return json.data;
}

export async function getPageInsights(pageId: string, pageAccessToken: string) {
  const url = new URL(`${GRAPH_BASE}/${pageId}/insights`);
  url.searchParams.set("metric", "page_impressions,page_engaged_users,page_fans");
  url.searchParams.set("access_token", pageAccessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Meta page insights failed: ${await res.text()}`);
  }
  return res.json();
}

export async function getInstagramInsights(igBusinessId: string, accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/${igBusinessId}/insights`);
  url.searchParams.set("metric", "reach,impressions,profile_views,follower_count");
  url.searchParams.set("period", "day");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Instagram insights failed: ${await res.text()}`);
  }
  return res.json();
}

export async function listInstagramMedia(igBusinessId: string, accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/${igBusinessId}/media`);
  url.searchParams.set("fields", "id,caption,media_type,timestamp,permalink");
  url.searchParams.set("limit", "50");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Instagram media list failed: ${await res.text()}`);
  }
  return res.json();
}

export async function getMediaInsights(mediaId: string, accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/${mediaId}/insights`);
  url.searchParams.set("metric", "reach,impressions,likes,comments,saved,shares,video_views");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Media insights failed: ${await res.text()}`);
  }
  return res.json();
}
