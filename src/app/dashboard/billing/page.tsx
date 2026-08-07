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
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Subscription</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Billing</h1>
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

      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Current plan</p>
            <p className="mt-1 font-semibold capitalize">{customer.plan_tier}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Status</p>
            <p className="mt-1 font-semibold capitalize">{customer.subscription_status}</p>
          </div>
        </div>
      </div>

      {hasSubscription ? (
        <ManageBillingButton />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-4 text-sm text-gray-600">Choose a monthly plan. Stripe securely collects and stores your payment details.</p>
          <CheckoutButtons initialTier={selectedPlan} />
        </div>
      )}

      <p className="text-xs leading-5 text-gray-500">
        Need help with a payment or subscription? <Link href="/contact?subject=Billing%20support" className="font-medium underline">Open a support ticket</Link>.
      </p>
    </div>
  );
}
