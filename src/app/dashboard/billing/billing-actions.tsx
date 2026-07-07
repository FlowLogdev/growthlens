"use client";

import { useState } from "react";

const TIERS = [
  { tier: "starter", label: "Starter — $29/mo" },
  { tier: "pro", label: "Pro — $79/mo" },
];

export function CheckoutButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function startCheckout(tier: string) {
    setLoading(tier);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const { url } = await res.json();
    if (url) window.location.assign(url);
    setLoading(null);
  }

  return (
    <div className="flex gap-3">
      {TIERS.map(({ tier, label }) => (
        <button
          key={tier}
          disabled={loading !== null}
          onClick={() => startCheckout(tier)}
          className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading === tier ? "Redirecting…" : label}
        </button>
      ))}
    </div>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.assign(url);
    setLoading(false);
  }

  return (
    <button
      disabled={loading}
      onClick={openPortal}
      className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Opening…" : "Manage billing"}
    </button>
  );
}
