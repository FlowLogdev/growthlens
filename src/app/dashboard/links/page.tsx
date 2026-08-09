import { requireCurrentCustomer } from "@/lib/current-customer";
import { CopyTrackedLink, TrackedLinkForm } from "./link-tools";

export default async function LinksPage() {
  const { supabase, customer } = await requireCurrentCustomer();
  const [{ data: links }, { data: clicks }] = await Promise.all([
    supabase
      .from("tracked_links")
      .select("id, title, slug, destination_url, source_platform, created_at, active")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("link_clicks")
      .select("link_slug, source_platform, clicked_at")
      .eq("customer_id", customer.id)
      .order("clicked_at", { ascending: false })
      .limit(1000),
  ]);

  const clicksBySlug = new Map<string, { count: number; latest: string | null }>();
  for (const click of clicks ?? []) {
    if (!click.link_slug) continue;
    const current = clicksBySlug.get(click.link_slug) ?? { count: 0, latest: null };
    current.count += 1;
    if (!current.latest && click.clicked_at) current.latest = click.clicked_at;
    clicksBySlug.set(click.link_slug, current);
  }

  const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Traffic intent</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Tracked links</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Create a short GrowthLens URL for your bio, posts, and campaigns. Each visit is counted here and forwarded to your destination with campaign tags.</p>
      </header>

      <section className="grid gap-5 rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl lg:grid-cols-[0.8fr_1.2fr] lg:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#d9ff6b]">Create</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Make a measurable link</h2>
          <p className="mt-3 text-sm leading-6 text-white/46">Choose the social channel and destination. GrowthLens adds standard UTM tags and records every redirect without changing your destination page.</p>
        </div>
        <TrackedLinkForm />
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/11 bg-[#101513]/72 backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-white">Your tracking links</h2>
          <p className="mt-1 text-xs text-white/38">Use a separate link for each channel or campaign to compare traffic.</p>
        </div>
        {!links?.length ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-white/68">No tracking links yet.</p>
            <p className="mt-2 text-xs text-white/38">Create the first one above, copy it, and add it to a social post or profile.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {links.map((link) => {
              const trackingUrl = `${siteUrl}/r/${link.slug}`;
              const activity = clicksBySlug.get(link.slug) ?? { count: 0, latest: null };
              return (
                <article key={link.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{link.title}</h3>
                      <span className="rounded-full border border-white/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/42">{link.source_platform}</span>
                    </div>
                    <p className="mt-2 truncate font-mono text-xs text-[#d9ff6b]">{trackingUrl}</p>
                    <p className="mt-1 truncate text-xs text-white/32">To: {link.destination_url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-white">{activity.count.toLocaleString()}</p>
                      <p className="text-[10px] uppercase tracking-wide text-white/32">clicks{activity.latest ? ` · latest ${new Date(activity.latest).toLocaleDateString()}` : ""}</p>
                    </div>
                    <CopyTrackedLink url={trackingUrl} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
