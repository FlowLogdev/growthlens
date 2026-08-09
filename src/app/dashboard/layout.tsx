import Image from "next/image";
import Link from "next/link";
import { signOut } from "../(auth)/actions";
import { BrandMark } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { GrowthCoach } from "@/components/growth-coach";
import { LanguageSwitcher } from "@/components/language-switcher";
import { requireCurrentCustomer } from "@/lib/current-customer";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, customer } = await requireCurrentCustomer();
  const { count: accountCount } = await supabase
    .from("platform_accounts")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customer.id)
    .neq("status", "revoked");

  return (
    <div className="dashboard-shell relative isolate min-h-[100dvh] overflow-x-hidden text-white md:flex">
      <Image
        src="/brand/growthlens-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="fixed -z-30 object-cover object-center"
      />
      <div aria-hidden="true" className="fixed inset-0 -z-20 bg-[#0a0f0c]/88" />
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_72%_18%,rgba(217,255,107,0.11),transparent_27%),linear-gradient(120deg,rgba(7,11,8,0.98),rgba(11,16,13,0.82)_55%,rgba(8,13,10,0.94))]" />

      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-[#0d120f]/78 p-5 backdrop-blur-2xl md:flex">
        <div className="mb-7 px-1 [--ink:#f2f4ef]">
          <Link href="/dashboard" aria-label="GrowthLens dashboard" className="inline-flex rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d9ff6b]">
            <BrandMark />
          </Link>
          <p data-no-translate className="mt-3 truncate text-xs text-white/42">{customer.business_name ?? customer.email}</p>
          <div className="mt-4"><LanguageSwitcher /></div>
        </div>
        <DashboardNav />
        <form action={signOut} className="mt-auto px-2 pt-8">
          <button type="submit" className="text-sm text-white/42 hover:text-white">
            Log out
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1 md:flex">
        <div className="min-w-0 flex-1">
        <header className="border-b border-white/10 bg-[#0d120f]/78 px-4 py-3 backdrop-blur-2xl md:hidden">
          <div className="flex items-center justify-between [--ink:#f2f4ef]">
            <Link href="/dashboard" aria-label="GrowthLens dashboard"><BrandMark /></Link>
            <div className="flex items-center gap-4 text-sm">
            <LanguageSwitcher compact />
            <Link href="/dashboard/billing" className="text-white/64">Billing</Link>
            <form action={signOut}>
              <button type="submit" className="text-white/64">Log out</button>
            </form>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto pb-1">
            <DashboardNav mobile />
          </div>
        </header>
        <main data-auto-translate className="mx-auto w-full max-w-[1120px] p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 xl:pb-8">{children}</main>
        </div>
        <GrowthCoach
          accountCount={accountCount ?? 0}
          aiEnabled={Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)}
        />
      </div>
    </div>
  );
}
