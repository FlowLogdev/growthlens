import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccountLimit } from "@/lib/plans";
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

    const [{ data: customer }, { data: existingAccounts }] = await Promise.all([
      supabase
        .from("customers")
        .select("plan_tier")
        .eq("id", customerId)
        .single(),
      supabase
        .from("platform_accounts")
        .select("platform, account_id")
        .eq("customer_id", customerId),
    ]);

    if (!customer) {
      return NextResponse.redirect(`${siteUrl}/dashboard/connect?error=Customer account not found`);
    }

    const candidates = pages.flatMap((page) => [
      {
        platform: "facebook" as const,
        account_id: page.id,
        account_name: page.name,
        access_token: page.access_token,
      },
      ...(page.instagram_business_account
        ? [
            {
              platform: "instagram" as const,
              account_id: page.instagram_business_account.id,
              account_name: page.name,
              access_token: page.access_token,
            },
          ]
        : []),
    ]);

    if (candidates.length === 0) {
      return NextResponse.redirect(
        `${siteUrl}/dashboard/connect?error=meta_no_pages`,
      );
    }

    const existingKeys = new Set(
      (existingAccounts ?? []).map((account) => `${account.platform}:${account.account_id}`),
    );
    let remaining = Math.max(0, getAccountLimit(customer.plan_tier) - existingKeys.size);
    let skipped = 0;
    let saved = 0;

    for (const candidate of candidates) {
      const key = `${candidate.platform}:${candidate.account_id}`;
      const alreadyConnected = existingKeys.has(key);

      if (!alreadyConnected && remaining === 0) {
        skipped++;
        continue;
      }

      const { error: saveError } = await supabase.from("platform_accounts").upsert(
        {
          customer_id: customerId,
          platform: candidate.platform,
          account_id: candidate.account_id,
          account_name: candidate.account_name,
          access_token: encryptToken(candidate.access_token),
          token_expires_at: expiresAt,
          status: "active",
        },
        { onConflict: "customer_id,platform,account_id" },
      );

      if (saveError) {
        console.error("Meta account persistence failed", {
          customerId,
          platform: candidate.platform,
          accountId: candidate.account_id,
          code: saveError.code,
          message: saveError.message,
        });
        throw new Error("meta_save_failed");
      }

      saved++;

      if (!alreadyConnected) {
        existingKeys.add(key);
        remaining--;
      }
    }

    if (saved === 0) {
      return NextResponse.redirect(
        `${siteUrl}/dashboard/connect?error=account_limit&limit=1`,
      );
    }

    return NextResponse.redirect(
      `${siteUrl}/dashboard/connect?connected=meta&connected_count=${saved}${skipped ? "&limit=1" : ""}`,
    );
  } catch (err) {
    const errorCode = (err as Error).message === "meta_save_failed"
      ? "meta_save_failed"
      : "meta_connection_failed";
    console.error("Meta OAuth callback failed", err);
    return NextResponse.redirect(
      `${siteUrl}/dashboard/connect?error=${errorCode}`,
    );
  }
}
