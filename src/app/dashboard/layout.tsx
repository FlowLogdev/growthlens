import Link from "next/link";
import { signOut } from "../(auth)/actions";
import { requireCurrentCustomer } from "@/lib/current-customer";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/connect", label: "Connect accounts" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/insights", label: "AI insights" },
  { href: "/dashboard/links", label: "Link clicks" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { customer } = await requireCurrentCustomer();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 p-4">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold">GrowthLens</p>
          <p className="truncate text-xs text-gray-500">{customer.business_name ?? customer.email}</p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-6 px-2">
          <button type="submit" className="text-sm text-gray-500 hover:underline">
            Log out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
