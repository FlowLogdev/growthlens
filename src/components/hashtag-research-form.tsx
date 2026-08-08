"use client";

import { FormEvent, useMemo, useState } from "react";

type Hashtag = {
  tag: string;
  category: "niche" | "growth" | "discovery";
  reason: string;
};

type ResearchResult = {
  summary: string;
  hashtags: Hashtag[];
  content_angles: string[];
  sources: Array<{ title: string; url: string }>;
  providers: string[];
  generated_at: string;
};

const GROUPS: Array<{ key: Hashtag["category"]; label: string; description: string }> = [
  { key: "niche", label: "Niche relevance", description: "Precise tags that match the audience and topic." },
  { key: "growth", label: "Growth opportunities", description: "Adjacent discovery lanes with room to test." },
  { key: "discovery", label: "Broad discovery", description: "Larger topic tags used carefully for reach." },
];

export function HashtagResearchForm({ configuredProviders }: { configuredProviders: string[] }) {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "both">("both");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [copied, setCopied] = useState(false);

  const allTags = useMemo(() => result?.hashtags.map((item) => item.tag).join(" ") ?? "", [result]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (niche.trim().length < 2 || loading) return;
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const response = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, audience, platform, region }),
      });
      const payload = await response.json() as ResearchResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Research could not be completed.");
      setResult(payload);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    if (!allTags) return;
    await navigator.clipboard.writeText(allTags);
    setCopied(true);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
      <form onSubmit={submit} className="h-fit rounded-2xl border border-white/11 bg-[#101513]/76 p-5 backdrop-blur-xl sm:p-6">
        <h2 className="text-lg font-semibold text-white">Research a niche</h2>
        <p className="mt-2 text-sm leading-6 text-white/46">GrowthLens searches current web evidence and competitor language. More detail produces tighter recommendations.</p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-white/68">Niche</span>
            <input value={niche} onChange={(event) => setNiche(event.target.value)} required minLength={2} maxLength={120} placeholder="Example: handmade skincare for sensitive skin" className="mt-2 w-full rounded-xl border border-white/15 bg-[#0d120f]/78 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#d9ff6b]/60" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-white/68">Ideal audience</span>
            <input value={audience} onChange={(event) => setAudience(event.target.value)} maxLength={160} placeholder="Example: US women 25 to 40" className="mt-2 w-full rounded-xl border border-white/15 bg-[#0d120f]/78 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#d9ff6b]/60" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-white/68">Platform</span>
              <select value={platform} onChange={(event) => setPlatform(event.target.value as typeof platform)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#0d120f]/78 px-4 py-3 text-sm text-white outline-none focus:border-[#d9ff6b]/60">
                <option value="both">Instagram and TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-white/68">Region</span>
              <input value={region} onChange={(event) => setRegion(event.target.value)} maxLength={80} placeholder="United States" className="mt-2 w-full rounded-xl border border-white/15 bg-[#0d120f]/78 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#d9ff6b]/60" />
            </label>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-[#ff7d66]/25 bg-[#ff7d66]/10 p-3 text-xs leading-5 text-[#ffc1b5]">{error}</p>}
        <button type="submit" disabled={loading || niche.trim().length < 2 || configuredProviders.length === 0} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45">
          {loading ? "Searching current evidence..." : "Research hashtags"}
        </button>
        <p className="mt-3 text-center text-[11px] text-white/34">
          {configuredProviders.length ? `Available research: ${configuredProviders.join(" + ")}` : "Add an Anthropic or OpenAI server key to enable research."}
        </p>
      </form>

      <section className="min-w-0 rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl sm:p-6" aria-live="polite">
        {!result && !loading && (
          <div className="grid min-h-[34rem] place-items-center rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
            <div className="max-w-md">
              <p className="font-mono text-xs font-semibold text-[#d9ff6b]">#research-before-reach</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-white">Build a relevant hashtag mix.</h2>
              <p className="mt-3 text-sm leading-6 text-white/46">Enter a specific niche to generate a sourced mix of precise, adjacent, and broad discovery tags.</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="grid min-h-[34rem] place-items-center text-center">
            <div>
              <div className="mx-auto h-10 w-10 animate-pulse rounded-full border border-[#d9ff6b]/45 bg-[#d9ff6b]/10" />
              <p className="mt-5 text-sm font-semibold text-white">Researching competitors and current topic signals</p>
              <p className="mt-2 text-xs text-white/40">This can take up to a minute.</p>
            </div>
          </div>
        )}
        {result && !loading && (
          <div>
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9ff6b]">Current research</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/58">{result.summary}</p>
              </div>
              <button type="button" onClick={() => void copyAll()} className="shrink-0 rounded-full border border-[#d9ff6b]/35 px-4 py-2 text-xs font-bold text-[#d9ff6b] hover:bg-[#d9ff6b]/10">{copied ? "Copied" : "Copy all"}</button>
            </div>

            <div className="mt-6 space-y-6">
              {GROUPS.map((group) => {
                const items = result.hashtags.filter((item) => item.category === group.key);
                if (!items.length) return null;
                return (
                  <section key={group.key}>
                    <h3 className="text-sm font-semibold text-white">{group.label}</h3>
                    <p className="mt-1 text-xs text-white/36">{group.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {items.map((item) => (
                        <div key={item.tag.toLowerCase()} className="rounded-xl border border-white/9 bg-white/[0.04] p-3">
                          <p className="font-mono text-sm font-semibold text-[#d9ff6b]">{item.tag}</p>
                          <p className="mt-2 text-xs leading-5 text-white/44">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {!!result.content_angles.length && (
              <section className="mt-7 border-t border-white/10 pt-5">
                <h3 className="text-sm font-semibold text-white">Content angles to test</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {result.content_angles.map((angle) => <p key={angle} className="rounded-xl bg-[#d9ff6b]/[0.065] p-3 text-xs leading-5 text-[#e8ffad]">{angle}</p>)}
                </div>
              </section>
            )}

            {!!result.sources.length && (
              <section className="mt-7 border-t border-white/10 pt-5">
                <h3 className="text-sm font-semibold text-white">Sources reviewed</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] text-white/54 hover:border-[#d9ff6b]/35 hover:text-white">{source.title}</a>)}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
