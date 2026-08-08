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
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Workspace control</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Manage your business identity and connected data sources.</p>
      </header>

      <section className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl sm:p-6">
        <h2 className="font-semibold text-white">Account details</h2>
        <form action={updateBusinessName} className="flex max-w-sm items-end gap-2">
          <div className="flex-1">
            <label htmlFor="business_name" className="mt-4 block text-xs font-semibold text-white/62">
              Business name
            </label>
            <input
              id="business_name"
              name="business_name"
              defaultValue={customer.business_name ?? ""}
              className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-[#0d120f]/78 px-3 py-2 text-sm text-white outline-none focus:border-[#d9ff6b]/60"
            />
          </div>
          <button type="submit" className="min-h-11 rounded-full bg-[#d9ff6b] px-5 py-2 text-sm font-bold text-[#172016]">
            Save
          </button>
        </form>
        <p className="mt-4 text-xs text-white/40">Account email: {customer.email}</p>
      </section>

      <section className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl sm:p-6">
        <h2 className="font-semibold text-white">Connected platforms</h2>
        {!accounts?.length ? (
          <p className="mt-4 text-sm text-white/42">No accounts connected.</p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm"
              >
                <span className="capitalize text-white/68">
                  {account.platform} - {account.account_name} ({account.status})
                </span>
                <form action={disconnectAccount}>
                  <input type="hidden" name="account_id" value={account.id} />
                  <button type="submit" className="text-xs font-semibold text-[#ff9e8b] hover:text-[#ffc1b5]">
                    Disconnect
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
