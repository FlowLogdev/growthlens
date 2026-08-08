import Link from "next/link";
import { isPlanTier } from "@/lib/plans";
import { requireCurrentCustomer } from "@/lib/current-customer";
import { CheckoutButtons, ManageBillingButton } from "./billing-actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string;
    checkout?: string;
    welcome?: string;
    error?: string;
  }>;
}) {
  const { customer } = await requireCurrentCustomer();
  const params = await searchParams;
  const selectedPlan = isPlanTier(params.plan) ? params.plan : undefined;
  const hasSubscription = Boolean(customer.stripe_subscription_id);

  return (
    <div className="max-w-3xl space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Subscription</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Billing</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">Choose your plan and manage secure billing through Stripe.</p>
      </div>

      {params.welcome === "1" && (
        <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Your account is ready. Choose a plan when you want to activate paid billing.
        </p>
      )}
      {params.checkout === "success" && (
        <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Payment received. Stripe is activating your subscription now.
        </p>
      )}
      {params.checkout === "cancelled" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Checkout was canceled. No charge was made.
        </p>
      )}
      {params.error === "subscription_required" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Your trial has ended. Choose a plan to keep syncing connected accounts.
        </p>
      )}

      <div className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 text-sm backdrop-blur-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/35">Current plan</p>
            <p className="mt-1 font-semibold capitalize text-white">{customer.plan_tier}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/35">Status</p>
            <p className="mt-1 font-semibold capitalize text-white">{customer.subscription_status}</p>
          </div>
        </div>
      </div>

      {hasSubscription ? (
        <ManageBillingButton />
      ) : (
        <div className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl">
          <p className="mb-4 text-sm text-white/50">Choose a monthly plan. Stripe securely collects and stores your payment details.</p>
          <CheckoutButtons initialTier={selectedPlan} />
        </div>
      )}

      <p className="text-xs leading-5 text-white/40">
        Need help with a payment or subscription? <Link href="/contact?subject=Billing%20support" className="font-medium underline">Open a support ticket</Link>.
      </p>
    </div>
  );
}
