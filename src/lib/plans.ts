export const PLAN_TIERS = ["starter", "pro"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export const PLANS: Record<
  PlanTier,
  {
    name: string;
    price: number;
    audience: string;
    description: string;
    features: string[];
  }
> = {
  starter: {
    name: "Starter",
    price: 29,
    audience: "For solo creators and focused brands",
    description: "A clear weekly growth loop without another complicated reporting tool.",
    features: [
      "Up to 3 connected social accounts",
      "Automatic social data sync every 6 hours",
      "Weekly AI growth recommendations",
      "30-day performance analysis",
      "Weekly email digest",
    ],
  },
  pro: {
    name: "Pro",
    price: 79,
    audience: "For growing brands and marketing teams",
    description: "Faster insight cycles, cross-account clarity, and priority help when you need it.",
    features: [
      "Everything in Starter",
      "Up to 10 connected social accounts",
      "On-demand AI insight refreshes",
      "Cross-account insight workspace",
      "Priority support tickets",
      "Self-serve billing and cancellation",
    ],
  },
};

export const PLAN_ACCOUNT_LIMITS: Record<PlanTier, number> = {
  starter: 3,
  pro: 10,
};

export function getAccountLimit(planTier: string | null | undefined) {
  if (planTier === "business") return 50;
  return planTier === "pro" ? PLAN_ACCOUNT_LIMITS.pro : PLAN_ACCOUNT_LIMITS.starter;
}

export function isPlanTier(value: unknown): value is PlanTier {
  return typeof value === "string" && PLAN_TIERS.includes(value as PlanTier);
}
