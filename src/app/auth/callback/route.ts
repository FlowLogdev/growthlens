import { NextResponse, type NextRequest } from "next/server";
import { isPlanTier } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

// Handles the Supabase Auth PKCE redirect (e.g. Google sign-in), not to be
// confused with the Meta/TikTok connect callbacks under /api/oauth/*.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedDestination = searchParams.get("next") ?? "/dashboard";
  const destination =
    requestedDestination.startsWith("/") && !requestedDestination.startsWith("//")
      ? requestedDestination
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      let registrationCompleted = false;
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();

      if (!existing) {
        const plan = new URL(destination, origin).searchParams.get("plan");
        const { error: insertError } = await supabase.from("customers").insert({
          auth_user_id: data.user.id,
          email: data.user.email,
          plan_tier: isPlanTier(plan) ? plan : "starter",
        });
        registrationCompleted = !insertError;
      }

      const destinationUrl = new URL(destination, origin);
      if (registrationCompleted) destinationUrl.searchParams.set("registration_completed", "1");
      return NextResponse.redirect(destinationUrl);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
