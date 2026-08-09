import "server-only";
import type Stripe from "stripe";
import { isPlanTier, type PlanTier } from "@/lib/plans";
import { getStripeClient, PRICE_ID_BY_TIER } from "@/lib/stripe/client";

export type SubscriptionSnapshot = {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string;
  planTier: PlanTier;
  trialEndsAt: string | null;
};

export function planTierForPrice(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) return null;

  for (const [tier, configuredPriceId] of Object.entries(PRICE_ID_BY_TIER)) {
    if (configuredPriceId === priceId && isPlanTier(tier)) return tier;
  }

  return null;
}

export function planTierForSubscription(
  subscription: Stripe.Subscription,
  fallback?: unknown,
): PlanTier {
  const priceTier = planTierForPrice(subscription.items.data[0]?.price.id);
  if (priceTier) return priceTier;
  return isPlanTier(fallback) ? fallback : "starter";
}

export async function subscriptionSnapshotFromCheckout(
  session: Stripe.Checkout.Session,
): Promise<SubscriptionSnapshot> {
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscription =
    typeof session.subscription === "string"
      ? await getStripeClient().subscriptions.retrieve(session.subscription)
      : session.subscription;

  if (!subscription) {
    throw new Error("Checkout did not create an active subscription");
  }

  return {
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    planTier: planTierForSubscription(subscription, session.metadata?.plan_tier),
    trialEndsAt: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  };
}
