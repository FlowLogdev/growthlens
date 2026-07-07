import { requireCurrentCustomer } from "@/lib/current-customer";

export default async function PostsPage() {
  const { supabase, customer } = await requireCurrentCustomer();

  const { data: posts } = await supabase
    .from("post_performance")
    .select("*")
    .eq("customer_id", customer.id)
    .order("posted_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Posts</h1>

      {!posts?.length ? (
        <p className="text-sm text-gray-500">No posts synced yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="pr-4 py-2">Posted</th>
              <th className="pr-4">Type</th>
              <th className="pr-4">Reach</th>
              <th className="pr-4">Likes</th>
              <th className="pr-4">Comments</th>
              <th className="pr-4">Shares</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-gray-100">
                <td className="pr-4 py-2">
                  {post.posted_at ? new Date(post.posted_at).toLocaleDateString() : "–"}
                </td>
                <td className="pr-4">{post.content_type ?? "–"}</td>
                <td className="pr-4">{post.reach ?? "–"}</td>
                <td className="pr-4">{post.likes ?? "–"}</td>
                <td className="pr-4">{post.comments ?? "–"}</td>
                <td className="pr-4">{post.shares ?? "–"}</td>
                <td>
                  {post.permalink ? (
                    <a href={post.permalink} target="_blank" rel="noreferrer" className="underline">
                      View
                    </a>
                  ) : (
                    "–"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
