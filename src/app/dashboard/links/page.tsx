import { requireCurrentCustomer } from "@/lib/current-customer";

export default async function LinksPage() {
  const { supabase, customer } = await requireCurrentCustomer();

  const { data: clicks } = await supabase
    .from("link_clicks")
    .select("*")
    .eq("customer_id", customer.id)
    .order("clicked_at", { ascending: false })
    .limit(200);

  const bySlug = new Map<string, number>();
  for (const click of clicks ?? []) {
    const key = click.link_slug ?? "(no slug)";
    bySlug.set(key, (bySlug.get(key) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Link-in-bio clicks</h1>

      {!clicks?.length ? (
        <p className="text-sm text-gray-500">No link clicks recorded yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="pr-4 py-2">Link</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {[...bySlug.entries()].map(([slug, count]) => (
              <tr key={slug} className="border-t border-gray-100">
                <td className="pr-4 py-2">{slug}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
