import Link from "next/link";
import { requireCurrentCustomer } from "@/lib/current-customer";

type Post = {
  id: string;
  posted_at: string | null;
  content_type: string | null;
  caption: string | null;
  reach: number | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  video_completion_rate: number | null;
  permalink: string | null;
};

function value(input: number | null | undefined) {
  return typeof input === "number" && Number.isFinite(input) ? input : 0;
}

function compactNumber(input: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(input);
}

function formatDate(input: string | null) {
  if (!input) return "Date unavailable";
  return new Date(input).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function engagementTotal(post: Post) {
  return value(post.likes) + value(post.comments) + value(post.shares) + value(post.saves);
}

export default async function PostsPage() {
  const { supabase, customer } = await requireCurrentCustomer();

  const { data } = await supabase
    .from("post_performance")
    .select("id, posted_at, content_type, caption, reach, impressions, likes, comments, shares, saves, video_completion_rate, permalink")
    .eq("customer_id", customer.id)
    .order("posted_at", { ascending: false })
    .limit(60);

  const posts = (data ?? []) as Post[];
  const totalViews = posts.reduce((sum, post) => sum + value(post.impressions), 0);
  const totalEngagements = posts.reduce((sum, post) => sum + engagementTotal(post), 0);
  const topPosts = [...posts]
    .sort((a, b) => {
      const scoreA = engagementTotal(a) + value(a.impressions) * 0.02;
      const scoreB = engagementTotal(b) + value(b.impressions) * 0.02;
      return scoreB - scoreA;
    })
    .slice(0, 3);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Content intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Posts</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Compare real post performance and find formats worth repeating.</p>
        </div>
        <Link href="/dashboard/metrics" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.055] px-5 text-sm font-semibold text-white transition-colors hover:border-[#d9ff6b]/40">View all metrics</Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Post summary">
        {[
          { label: "Synced posts", value: String(posts.length), helper: "most recent content" },
          { label: "Video views", value: compactNumber(totalViews), helper: "across synced posts" },
          { label: "Engagements", value: compactNumber(totalEngagements), helper: "likes, comments, shares, saves" },
        ].map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/11 bg-white/[0.055] p-4 backdrop-blur-xl">
            <p className="text-xs font-medium text-white/42">{metric.label}</p>
            <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em] text-white">{metric.value}</p>
            <p className="mt-1 text-[11px] text-white/32">{metric.helper}</p>
          </article>
        ))}
      </section>

      {!posts.length ? (
        <section className="rounded-2xl border border-white/12 bg-[#101513]/72 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white">No content has synced yet.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Connect a social account or run a new sync. GrowthLens will show real post data here when the platform returns it.</p>
          <Link href="/dashboard/connect" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016]">Manage connections</Link>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl">
            <div>
              <h2 className="text-base font-semibold text-white">Posts with the strongest signal</h2>
              <p className="mt-1 text-xs text-white/40">Ranked by reactions and available exposure data</p>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {topPosts.map((post, index) => (
                <article key={post.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-semibold text-[#d9ff6b]">0{index + 1}</p>
                    <p className="text-[11px] text-white/35">{formatDate(post.posted_at)}</p>
                  </div>
                  <p data-no-translate={Boolean(post.caption?.trim()) || undefined} className="mt-4 line-clamp-3 min-h-15 text-sm font-medium leading-5 text-white/82">{post.caption?.trim() || `${post.content_type || "Post"} content`}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-white/34">Views</p><p className="mt-1 font-mono font-semibold text-white">{compactNumber(value(post.impressions))}</p></div>
                    <div><p className="text-white/34">Engagements</p><p className="mt-1 font-mono font-semibold text-white">{compactNumber(engagementTotal(post))}</p></div>
                  </div>
                  {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-xs font-semibold text-[#d9ff6b]">Open original</a>}
                </article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/11 bg-[#101513]/72 backdrop-blur-xl">
            <div className="border-b border-white/10 p-5">
              <h2 className="text-base font-semibold text-white">Content ledger</h2>
              <p className="mt-1 text-xs text-white/40">The latest 60 synced posts, newest first</p>
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] bg-transparent text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                    <th>Posted</th>
                    <th>Type</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Shares</th>
                    <th>Saves</th>
                    <th><span className="sr-only">Original post</span></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-t border-white/[0.07] text-white/68 transition-colors hover:bg-white/[0.035]">
                      <td className="whitespace-nowrap">{formatDate(post.posted_at)}</td>
                      <td className="capitalize">{post.content_type || "Other"}</td>
                      <td className="font-mono text-white/82">{value(post.impressions).toLocaleString()}</td>
                      <td className="font-mono">{value(post.likes).toLocaleString()}</td>
                      <td className="font-mono">{value(post.comments).toLocaleString()}</td>
                      <td className="font-mono">{value(post.shares).toLocaleString()}</td>
                      <td className="font-mono">{value(post.saves).toLocaleString()}</td>
                      <td>{post.permalink ? <a href={post.permalink} target="_blank" rel="noreferrer" className="font-semibold text-[#d9ff6b]">View</a> : <span className="text-white/24">Unavailable</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {posts.map((post) => (
                <article key={post.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="capitalize text-white/68">{post.content_type || "Other"}</span>
                    <span className="text-white/35">{formatDate(post.posted_at)}</span>
                  </div>
                  <p data-no-translate={Boolean(post.caption?.trim()) || undefined} className="mt-3 line-clamp-2 text-sm leading-5 text-white/78">{post.caption?.trim() || "Caption unavailable"}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-xs text-white/62">
                    <span>{compactNumber(value(post.impressions))} views</span>
                    <span>{compactNumber(value(post.likes))} likes</span>
                    <span>{compactNumber(value(post.shares))} shares</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
