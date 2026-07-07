import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptToken } from "@/lib/encryption";
import { verifyOAuthState } from "@/lib/oauth-state";
import { isRateLimited } from "@/lib/rate-limit";
import { exchangeTikTokCode, getTikTokUserInfo } from "@/lib/integrations/tiktok";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`tiktok-callback:${ip}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/connect?error=${encodeURIComponent(oauthError)}`,
    );
  }

  const customerId = verifyOAuthState(state);
  if (!code || !customerId) {
    return NextResponse.redirect(`${siteUrl}/dashboard/connect?error=Invalid or expired state`);
  }

  try {
    const tokenResponse = await exchangeTikTokCode(code);
    const userInfo = await getTikTokUserInfo(tokenResponse.access_token);

    const supabase = createAdminClient();
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString();

    await supabase.from("platform_accounts").upsert(
      {
        customer_id: customerId,
        platform: "tiktok",
        account_id: tokenResponse.open_id,
        account_name: userInfo?.data?.user?.display_name ?? null,
        access_token: encryptToken(tokenResponse.access_token),
        refresh_token: encryptToken(tokenResponse.refresh_token),
        token_expires_at: expiresAt,
        status: "active",
      },
      { onConflict: "customer_id,platform,account_id" },
    );

    return NextResponse.redirect(`${siteUrl}/dashboard/connect?connected=tiktok`);
  } catch (err) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/connect?error=${encodeURIComponent((err as Error).message)}`,
    );
  }
}
