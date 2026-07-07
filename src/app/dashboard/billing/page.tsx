import { requireCurrentCustomer } from "@/lib/current-customer";
import { CheckoutButtons, ManageBillingButton } from "./billing-actions";

export default async function BillingPage() {
  const { customer } = await requireCurrentCustomer();
  const hasSubscription = Boolean(customer.stripe_subscription_id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Billing</h1>

      <div className="rounded border border-gray-200 p-4 text-sm">
        <p>
          Plan: <span className="font-medium">{customer.plan_tier}</span>
        </p>
        <p>
          Status: <span className="font-medium">{customer.subscription_status}</span>
        </p>
      </div>

      {hasSubscription ? (
        <ManageBillingButton />
      ) : (
        <div>
          <p className="mb-3 text-sm text-gray-600">Choose a plan to start your subscription.</p>
          <CheckoutButtons />
        </div>
      )}
    </div>
  );
}
