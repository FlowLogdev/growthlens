import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import {
  planTierForSubscription,
  subscriptionSnapshotFromCheckout,
} from "@/lib/stripe/subscriptions";
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
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    return NextResponse.json({ error: "Could not record webhook event" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.metadata?.customer_id;

        if (customerId) {
          const snapshot = await subscriptionSnapshotFromCheckout(session);
          const { error } = await supabase
            .from("customers")
            .update({
              stripe_customer_id: snapshot.stripeCustomerId,
              stripe_subscription_id: snapshot.stripeSubscriptionId,
              subscription_status: snapshot.subscriptionStatus,
              plan_tier: snapshot.planTier,
              trial_ends_at: snapshot.trialEndsAt,
            })
            .eq("id", customerId);

          if (error) throw error;
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
          plan_tier: planTierForSubscription(subscription),
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          ...(event.type === "customer.subscription.deleted"
            ? { stripe_subscription_id: null }
            : {}),
        };

        const update = customerId
          ? supabase.from("customers").update(statusUpdate).eq("id", customerId)
          : supabase
              .from("customers")
              .update(statusUpdate)
              .eq("stripe_subscription_id", subscription.id);
        const { error } = await update;

        if (error) throw error;
        break;
      }

      default:
        break;
    }
  } catch {
    // Remove the idempotency marker so Stripe can retry a transient failure.
    await supabase.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
