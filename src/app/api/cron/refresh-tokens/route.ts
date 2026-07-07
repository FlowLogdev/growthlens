import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptToken, encryptToken } from "@/lib/encryption";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { refreshTikTokToken } from "@/lib/integrations/tiktok";

// TikTok access tokens last 24h; refresh tokens last 365 days (spec Section
// 7.2). Run this well before expiry — e.g. every 6 hours — checking
// token_expires_at across every connected TikTok account, since this can't
// be a manual per-account refresh at SaaS scale.
const REFRESH_WINDOW_MS = 6 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() + REFRESH_WINDOW_MS).toISOString();

  const { data: accounts, error } = await supabase
    .from("platform_accounts")
    .select("*")
    .eq("platform", "tiktok")
    .eq("status", "active")
    .lt("token_expires_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let refreshed = 0;
  let failed = 0;

  for (const account of accounts ?? []) {
    if (!account.refresh_token) {
      failed++;
      continue;
    }

    try {
      const refreshToken = decryptToken(account.refresh_token);
      const result = await refreshTikTokToken(refreshToken);

      await supabase
        .from("platform_accounts")
        .update({
          access_token: encryptToken(result.access_token),
          refresh_token: encryptToken(result.refresh_token),
          token_expires_at: new Date(Date.now() + result.expires_in * 1000).toISOString(),
        })
        .eq("id", account.id);

      refreshed++;
    } catch {
      await supabase.from("platform_accounts").update({ status: "expired" }).eq("id", account.id);
      failed++;
    }
  }

  return NextResponse.json({ refreshed, failed });
}
