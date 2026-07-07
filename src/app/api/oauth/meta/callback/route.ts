import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptToken } from "@/lib/encryption";
import { verifyOAuthState } from "@/lib/oauth-state";
import { isRateLimited } from "@/lib/rate-limit";
import { exchangeMetaCode, exchangeForLongLivedToken, listPages } from "@/lib/integrations/meta";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`meta-callback:${ip}`)) {
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
    const shortLived = await exchangeMetaCode(code);
    const longLived = await exchangeForLongLivedToken(shortLived.access_token);
    const pages = await listPages(longLived.access_token);

    const supabase = createAdminClient();
    const expiresAt = new Date(Date.now() + longLived.expires_in * 1000).toISOString();

    for (const page of pages) {
      await supabase.from("platform_accounts").upsert(
        {
          customer_id: customerId,
          platform: "facebook",
          account_id: page.id,
          account_name: page.name,
          access_token: encryptToken(page.access_token),
          token_expires_at: expiresAt,
          status: "active",
        },
        { onConflict: "customer_id,platform,account_id" },
      );

      if (page.instagram_business_account) {
        await supabase.from("platform_accounts").upsert(
          {
            customer_id: customerId,
            platform: "instagram",
            account_id: page.instagram_business_account.id,
            account_name: page.name,
            access_token: encryptToken(page.access_token),
            token_expires_at: expiresAt,
            status: "active",
          },
          { onConflict: "customer_id,platform,account_id" },
        );
      }
    }

    return NextResponse.redirect(`${siteUrl}/dashboard/connect?connected=meta`);
  } catch (err) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/connect?error=${encodeURIComponent((err as Error).message)}`,
    );
  }
}
