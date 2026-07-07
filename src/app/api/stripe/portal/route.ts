import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("stripe_customer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet" }, { status: 404 });
  }

  const session = await getStripeClient().billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
