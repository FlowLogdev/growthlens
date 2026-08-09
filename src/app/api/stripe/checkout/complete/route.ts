import { NextResponse, type NextRequest } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { subscriptionSnapshotFromCheckout } from "@/lib/stripe/subscriptions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function dashboardUrl(request: NextRequest, result: "success" | "failed") {
  const url = new URL("/dashboard", request.url);
  url.searchParams.set("checkout", result);
  return url;
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_")) {
    return NextResponse.redirect(dashboardUrl(request, "failed"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", "/dashboard/billing");
    return NextResponse.redirect(loginUrl);
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer) {
    return NextResponse.redirect(dashboardUrl(request, "failed"));
  }

  try {
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const ownsCheckout =
      session.mode === "subscription" &&
      session.status === "complete" &&
      session.client_reference_id === customer.id &&
      session.metadata?.customer_id === customer.id;

    if (!ownsCheckout) {
      return NextResponse.redirect(dashboardUrl(request, "failed"));
    }

    const snapshot = await subscriptionSnapshotFromCheckout(session);
    const { error } = await createAdminClient()
      .from("customers")
      .update({
        stripe_customer_id: snapshot.stripeCustomerId,
        stripe_subscription_id: snapshot.stripeSubscriptionId,
        subscription_status: snapshot.subscriptionStatus,
        plan_tier: snapshot.planTier,
        trial_ends_at: snapshot.trialEndsAt,
      })
      .eq("id", customer.id)
      .eq("auth_user_id", user.id);

    if (error) throw error;
  } catch (error) {
    console.error("Stripe checkout confirmation failed", error);
    return NextResponse.redirect(dashboardUrl(request, "failed"));
  }

  return NextResponse.redirect(dashboardUrl(request, "success"));
}
