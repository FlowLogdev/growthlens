import Link from "next/link";
import { requireCurrentCustomer } from "@/lib/current-customer";

export default async function LinksPage() {
  const { supabase, customer } = await requireCurrentCustomer();
  const { data: clicks } = await supabase
    .from("link_clicks")
    .select("link_slug, source_platform, clicked_at")
    .eq("customer_id", customer.id)
    .order("clicked_at", { ascending: false })
    .limit(500);

  const bySlug = new Map<string, { clicks: number; platforms: Set<string>; latest: string | null }>();
  for (const click of clicks ?? []) {
    const key = click.link_slug ?? "Unlabeled link";
    const current = bySlug.get(key) ?? { clicks: 0, platforms: new Set<string>(), latest: null };
    current.clicks += 1;
    if (click.source_platform) current.platforms.add(click.source_platform);
    if (!current.latest && click.clicked_at) current.latest = click.clicked_at;
    bySlug.set(key, current);
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Traffic intent</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Link clicks</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">See which tracked links turn social attention into site visits.</p>
      </header>

      {!clicks?.length ? (
        <section className="rounded-2xl border border-white/12 bg-[#101513]/72 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white">No tracked clicks yet.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Link activity will appear here when a GrowthLens tracking link receives traffic.</p>
          <Link href="/contact?subject=Link%20tracking" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white">Ask support about tracking</Link>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-white/11 bg-[#101513]/72 backdrop-blur-xl">
          <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-5 py-4 text-[11px] uppercase tracking-[0.08em] text-white/35 sm:grid-cols-[1fr_10rem_8rem_auto]">
            <span>Link</span><span className="hidden sm:block">Sources</span><span className="hidden sm:block">Latest</span><span>Clicks</span>
          </div>
          <div>
            {[...bySlug.entries()].sort((a, b) => b[1].clicks - a[1].clicks).map(([slug, item]) => (
              <div key={slug} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[0.07] px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_10rem_8rem_auto]">
                <span className="truncate text-sm font-medium text-white/78">{slug}</span>
                <span className="hidden text-xs capitalize text-white/40 sm:block">{[...item.platforms].join(", ") || "Direct"}</span>
                <span className="hidden text-xs text-white/40 sm:block">{item.latest ? new Date(item.latest).toLocaleDateString() : "Unknown"}</span>
                <span className="font-mono text-sm font-semibold text-[#d9ff6b]">{item.clicks.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
