import { NextResponse } from "next/server";
import { hasProductAccess } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { buildTikTokAuthUrl, getTikTokOAuthConfiguration } from "@/lib/integrations/tiktok";
import { createOAuthState } from "@/lib/oauth-state";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://usegrowthlens.com";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", siteUrl));
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, subscription_status, trial_ends_at")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "Customer record not found" }, { status: 404 });
  }

  if (!hasProductAccess(customer)) {
    return NextResponse.redirect(
      new URL("/dashboard/billing?error=subscription_required", siteUrl),
    );
  }

  if (!getTikTokOAuthConfiguration().ready) {
    return NextResponse.redirect(new URL("/dashboard/connect?error=tiktok_not_configured", siteUrl));
  }

  const state = createOAuthState(customer.id);
  return NextResponse.redirect(buildTikTokAuthUrl(state));
}
