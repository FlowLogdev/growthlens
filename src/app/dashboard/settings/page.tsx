import { requireCurrentCustomer } from "@/lib/current-customer";
import { disconnectAccount, updateBusinessName } from "./actions";

export default async function SettingsPage() {
  const { supabase, customer } = await requireCurrentCustomer();

  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("id, platform, account_name, status")
    .eq("customer_id", customer.id)
    .neq("status", "revoked");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="space-y-3">
        <h2 className="font-medium">Account details</h2>
        <form action={updateBusinessName} className="flex max-w-sm items-end gap-2">
          <div className="flex-1">
            <label htmlFor="business_name" className="block text-sm text-gray-600">
              Business name
            </label>
            <input
              id="business_name"
              name="business_name"
              defaultValue={customer.business_name ?? ""}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="rounded bg-black px-3 py-2 text-sm text-white">
            Save
          </button>
        </form>
        <p className="text-sm text-gray-500">Email: {customer.email}</p>
      </div>

      <div className="space-y-3">
        <h2 className="font-medium">Connected platforms</h2>
        {!accounts?.length ? (
          <p className="text-sm text-gray-500">No accounts connected.</p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm"
              >
                <span>
                  {account.platform} — {account.account_name} ({account.status})
                </span>
                <form action={disconnectAccount}>
                  <input type="hidden" name="account_id" value={account.id} />
                  <button type="submit" className="text-red-600 hover:underline">
                    Disconnect
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
