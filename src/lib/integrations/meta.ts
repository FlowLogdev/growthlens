import "server-only";

// Meta Graph API integration — kept isolated from tiktok.ts so App Review
// delays on one platform never block shipping the other (spec Section 15).

// Keep Meta calls on a supported Graph API version. Ignore stale production
// overrides instead of silently sending customers through an expired OAuth
// flow (v19.0 expired on May 21, 2026).
function getGraphVersion() {
  const configured = process.env.META_GRAPH_API_VERSION?.trim();
  const major = configured?.match(/^v(\d+)\.0$/)?.[1];
  return major && Number(major) >= 20 ? configured! : "v26.0";
}

const GRAPH_VERSION = getGraphVersion();
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function getMetaOAuthConfiguration() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  const redirectUri = process.env.META_REDIRECT_URI?.trim() ||
    (siteUrl ? `${siteUrl}/api/oauth/meta/callback` : "");

  return {
    appId,
    appSecret,
    redirectUri,
    ready: Boolean(appId && appSecret && redirectUri),
  };
}

export const META_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_insights",
].join(",");

export function buildMetaAuthUrl(state: string) {
  const config = getMetaOAuthConfiguration();
  if (!config.ready) {
    throw new Error("meta_not_configured");
  }
  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", config.appId!);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", META_OAUTH_SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("auth_type", "rerequest");
  url.searchParams.set("return_scopes", "true");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeMetaCode(code: string) {
  const config = getMetaOAuthConfiguration();
  if (!config.ready) throw new Error("meta_not_configured");
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", config.appId!);
  url.searchParams.set("client_secret", config.appSecret!);
  url.searchParams.set("redirect_uri", config.redirectUri);
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
  const config = getMetaOAuthConfiguration();
  if (!config.ready) throw new Error("meta_not_configured");
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", config.appId!);
  url.searchParams.set("client_secret", config.appSecret!);
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

type MetaPermission = {
  permission: string;
  status: "granted" | "declined" | "expired" | string;
};

export type MetaPageDiscovery = {
  pages: MetaPage[];
  grantedPermissions: string[];
  missingPermissions: string[];
  granularPageIds: string[];
};

async function requestMetaPages(url: URL) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Meta list pages failed: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: MetaPage[] };
  return json.data ?? [];
}

async function listGrantedPermissions(userAccessToken: string) {
  const url = new URL(`${GRAPH_BASE}/me/permissions`);
  url.searchParams.set("access_token", userAccessToken);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: MetaPermission[] };
  return json.data ?? [];
}

type MetaGranularScope = {
  scope: string;
  target_ids?: string[];
};

async function listGranularPageIds(userAccessToken: string) {
  const config = getMetaOAuthConfiguration();
  if (!config.ready) return [];

  const url = new URL(`${GRAPH_BASE}/debug_token`);
  url.searchParams.set("input_token", userAccessToken);
  url.searchParams.set("access_token", `${config.appId}|${config.appSecret}`);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    data?: { granular_scopes?: MetaGranularScope[] };
  };
  const pageScopes = new Set(["pages_show_list", "pages_read_engagement"]);
  return Array.from(
    new Set(
      (json.data?.granular_scopes ?? [])
        .filter((item) => pageScopes.has(item.scope))
        .flatMap((item) => item.target_ids ?? []),
    ),
  );
}

async function getSelectedPagesById(pageIds: string[], userAccessToken: string) {
  const results = await Promise.all(
    pageIds.map(async (pageId) => {
      const url = new URL(`${GRAPH_BASE}/${encodeURIComponent(pageId)}`);
      url.searchParams.set("fields", "id,name,access_token,instagram_business_account");
      url.searchParams.set("access_token", userAccessToken);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as MetaPage;
    }),
  );
  return results.filter((page): page is MetaPage => Boolean(page?.id && page?.access_token));
}

export async function discoverMetaPages(userAccessToken: string): Promise<MetaPageDiscovery> {
  const url = new URL(`${GRAPH_BASE}/me/accounts`);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account");
  url.searchParams.set("limit", "100");
  url.searchParams.set("access_token", userAccessToken);

  let pages = await requestMetaPages(url);

  // Some Business Login responses expose the selected assets through the
  // expanded accounts edge even when /me/accounts returns an empty data array.
  if (pages.length === 0) {
    const expandedUrl = new URL(`${GRAPH_BASE}/me`);
    expandedUrl.searchParams.set(
      "fields",
      "accounts.limit(100){id,name,access_token,instagram_business_account}",
    );
    expandedUrl.searchParams.set("access_token", userAccessToken);
    const res = await fetch(expandedUrl, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as { accounts?: { data?: MetaPage[] } };
      pages = json.accounts?.data ?? [];
    }
  }

  // Meta's granular asset selection can contain the selected Page IDs even
  // when both accounts edges are empty. Resolve only those explicitly selected
  // IDs so the fallback cannot discover unrelated business assets.
  const granularPageIds = pages.length === 0
    ? await listGranularPageIds(userAccessToken)
    : [];
  if (pages.length === 0 && granularPageIds.length > 0) {
    pages = await getSelectedPagesById(granularPageIds, userAccessToken);
  }

  const permissions = await listGrantedPermissions(userAccessToken);
  const grantedPermissions = permissions
    .filter((item) => item.status === "granted")
    .map((item) => item.permission);
  const requiredPermissions = META_OAUTH_SCOPES.split(",");
  const missingPermissions = requiredPermissions.filter(
    (permission) => !grantedPermissions.includes(permission),
  );

  if (pages.length === 0) {
    console.warn("Meta returned no eligible Pages", {
      graphVersion: GRAPH_VERSION,
      granularPageCount: granularPageIds.length,
      grantedPermissions,
      missingPermissions,
    });
  }

  return { pages, grantedPermissions, missingPermissions, granularPageIds };
}

async function getAvailableInsights(
  resourceId: string,
  accessToken: string,
  metrics: string[],
  period = "day",
) {
  type InsightValue = { value?: number; end_time?: string };
  type InsightMetric = { name: string; values?: InsightValue[] };
  const results = await Promise.all(
    metrics.map(async (metric) => {
      const url = new URL(`${GRAPH_BASE}/${resourceId}/insights`);
      url.searchParams.set("metric", metric);
      url.searchParams.set("period", period);
      url.searchParams.set("access_token", accessToken);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: InsightMetric[] };
      return json.data ?? [];
    }),
  );
  return { data: results.flat() };
}

export async function getPageInsights(pageId: string, pageAccessToken: string) {
  return getAvailableInsights(pageId, pageAccessToken, [
    "page_media_view",
    "page_total_media_view_unique",
    "page_post_engagements",
    "page_follows",
  ]);
}

export async function getInstagramInsights(igBusinessId: string, accessToken: string) {
  return getAvailableInsights(igBusinessId, accessToken, [
    "reach",
    "views",
    "profile_views",
    "follower_count",
  ]);
}

export async function listInstagramMedia(igBusinessId: string, accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/${igBusinessId}/media`);
  url.searchParams.set(
    "fields",
    "id,caption,media_type,timestamp,permalink,like_count,comments_count",
  );
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
  url.searchParams.set("metric", "reach,views,saved,shares,total_interactions");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Media insights failed: ${await res.text()}`);
  }
  return res.json();
}
