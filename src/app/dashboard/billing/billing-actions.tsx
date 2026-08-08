"use client";

import { useState } from "react";
import { PLANS, type PlanTier } from "@/lib/plans";

const TIERS: PlanTier[] = ["starter", "pro"];

export function CheckoutButtons({ initialTier }: { initialTier?: PlanTier }) {
  const [loading, setLoading] = useState<PlanTier | null>(null);
  const [error, setError] = useState("");

  async function startCheckout(tier: PlanTier) {
    setError("");
    setLoading(tier);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Stripe checkout could not be opened.");
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError("Stripe checkout could not be opened. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {TIERS.map((tier) => {
          const plan = PLANS[tier];
          const recommended = tier === initialTier;

          return (
            <button
              key={tier}
              type="button"
              disabled={loading !== null}
              onClick={() => startCheckout(tier)}
              className={`rounded-xl border p-4 text-left transition-colors disabled:opacity-50 ${
                recommended
                  ? "border-[#58cc70] bg-[#58cc70]/10"
                  : "border-white/12 bg-white/[0.035] hover:border-[#d9ff6b]/35"
              }`}
            >
              <span className="block text-sm font-semibold text-white">{plan.name}</span>
              <span className="mt-1 block text-sm text-white/46">${plan.price} per month</span>
              <span className="mt-3 block text-xs font-medium text-[#d9ff6b]">
                {loading === tier ? "Opening secure checkout..." : `Choose ${plan.name}`}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p aria-live="polite" className="mt-3 text-sm text-[#ff9e8b]">{error}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "The billing portal could not be opened.");
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError("The billing portal could not be opened. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={openPortal}
        className="min-h-11 rounded-full border border-[#d9ff6b]/35 px-5 py-2 text-sm font-semibold text-[#d9ff6b] hover:bg-[#d9ff6b]/10 disabled:opacity-50"
      >
        {loading ? "Opening billing portal..." : "Manage billing"}
      </button>
      {error && <p aria-live="polite" className="mt-3 text-sm text-[#ff9e8b]">{error}</p>}
    </div>
  );
}
