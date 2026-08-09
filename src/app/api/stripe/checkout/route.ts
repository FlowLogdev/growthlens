import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PLAN_TIERS } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, PRICE_ID_BY_TIER } from "@/lib/stripe/client";

const checkoutSchema = z.object({
  tier: z.enum(PLAN_TIERS),
});

export async function POST(request: NextRequest) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown plan tier" }, { status: 400 });
  }

  const { tier } = parsed.data;
  const priceId = PRICE_ID_BY_TIER[tier];

  if (!priceId) {
    return NextResponse.json(
      { error: "This plan is not configured in Stripe yet." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, stripe_customer_id, stripe_subscription_id, subscription_status, email")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "Customer record not found" }, { status: 404 });
  }

  if (customer.stripe_subscription_id && customer.subscription_status !== "canceled") {
    return NextResponse.json(
      { error: "You already have a subscription. Use Manage billing instead." },
      { status: 409 },
    );
  }

  const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;

  const session = await getStripeClient().checkout.sessions.create({
    mode: "subscription",
    customer: customer.stripe_customer_id ?? undefined,
    customer_email: customer.stripe_customer_id ? undefined : customer.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: customer.id,
    subscription_data: {
      metadata: { customer_id: customer.id },
    },
    metadata: { customer_id: customer.id, plan_tier: tier },
    success_url: `${siteUrl}/api/stripe/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/dashboard/billing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
