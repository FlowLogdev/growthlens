import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, PRICE_ID_BY_TIER } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const { tier } = (await request.json()) as { tier?: string };
  const priceId = tier ? PRICE_ID_BY_TIER[tier] : undefined;

  if (!priceId) {
    return NextResponse.json({ error: "Unknown plan tier" }, { status: 400 });
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
    .select("id, stripe_customer_id, email")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "Customer record not found" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await getStripeClient().checkout.sessions.create({
    mode: "subscription",
    customer: customer.stripe_customer_id ?? undefined,
    customer_email: customer.stripe_customer_id ? undefined : customer.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { customer_id: customer.id },
    },
    metadata: { customer_id: customer.id, plan_tier: tier! },
    success_url: `${siteUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${siteUrl}/dashboard/billing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
