import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

// Lazily constructed so importing this module (e.g. during Next.js build-time
// page data collection) doesn't require STRIPE_SECRET_KEY to already be set.
export function getStripeClient(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return client;
}

export const PRICE_ID_BY_TIER: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_ID_STARTER!,
  pro: process.env.STRIPE_PRICE_ID_PRO!,
};
