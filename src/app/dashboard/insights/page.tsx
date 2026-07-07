import { requireCurrentCustomer } from "@/lib/current-customer";

export default async function InsightsPage() {
  const { supabase, customer } = await requireCurrentCustomer();

  const { data: insights } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("customer_id", customer.id)
    .order("generated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI insights</h1>

      {!insights?.length ? (
        <p className="text-sm text-gray-500">
          No insights generated yet. These run weekly once an account is connected and has synced
          data.
        </p>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded border border-gray-200 p-4">
              <p className="mb-3 text-xs text-gray-500">
                {insight.period_start} – {insight.period_end} · generated{" "}
                {new Date(insight.generated_at).toLocaleString()}
              </p>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="mb-1 font-medium">Top performers</p>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600">
                    {JSON.stringify(insight.top_performers, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 font-medium">Blockers</p>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600">
                    {JSON.stringify(insight.blockers, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 font-medium">Recommendations</p>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600">
                    {JSON.stringify(insight.recommendations, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
