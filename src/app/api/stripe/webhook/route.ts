import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe webhooks can be delivered more than once — every event is recorded
// in stripe_events (primary key = Stripe event ID) before it's processed, so
// duplicate deliveries are detected and skipped instead of double-applying
// subscription state changes.
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { error: insertError } = await supabase
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });

  if (insertError) {
    // Unique violation on `id` means we've already processed this event.
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.metadata?.customer_id;
      const planTier = session.metadata?.plan_tier;

      if (customerId) {
        await supabase
          .from("customers")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: "active",
            plan_tier: planTier ?? "starter",
          })
          .eq("id", customerId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.metadata?.customer_id;

      const statusUpdate = {
        subscription_status:
          event.type === "customer.subscription.deleted" ? "canceled" : subscription.status,
      };

      if (customerId) {
        await supabase.from("customers").update(statusUpdate).eq("id", customerId);
      } else {
        await supabase
          .from("customers")
          .update(statusUpdate)
          .eq("stripe_subscription_id", subscription.id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
