export type SubscriptionAccess = {
  subscription_status: string | null;
  trial_ends_at?: string | null;
};

export function hasProductAccess(customer: SubscriptionAccess, now = Date.now()) {
  if (customer.subscription_status === "active") return true;

  if (customer.subscription_status !== "trialing") return false;

  if (!customer.trial_ends_at) {
    return true;
  }

  return new Date(customer.trial_ends_at).getTime() > now;
}

export function hasOnDemandInsights(planTier: string | null) {
  return planTier === "pro" || planTier === "business";
}

export function hasCrossAccountWorkspace(planTier: string | null) {
  return planTier === "pro" || planTier === "business";
}
