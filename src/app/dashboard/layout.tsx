import Link from "next/link";
import { signOut } from "../(auth)/actions";
import { BrandMark } from "@/components/brand";
import { requireCurrentCustomer } from "@/lib/current-customer";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/connect", label: "Connect accounts" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/insights", label: "AI insights" },
  { href: "/dashboard/links", label: "Link clicks" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/contact", label: "Support" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { customer } = await requireCurrentCustomer();

  return (
    <div className="min-h-[100dvh] bg-[#f7f8f5] text-gray-950 md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-5 md:flex">
        <div className="mb-7 px-1">
          <BrandMark />
          <p className="mt-3 truncate text-xs text-gray-500">{customer.business_name ?? customer.email}</p>
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
        <form action={signOut} className="mt-auto px-2 pt-8">
          <button type="submit" className="text-sm text-gray-500 hover:underline">
            Log out
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <BrandMark />
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard/billing" className="text-gray-600">Billing</Link>
            <form action={signOut}>
              <button type="submit" className="text-gray-600">Log out</button>
            </form>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
