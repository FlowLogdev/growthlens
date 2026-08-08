import { HashtagResearchForm } from "@/components/hashtag-research-form";

export default function ViralHashtagsPage() {
  const researchEnabled = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Discovery research</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Viral Hashtags</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Research a current hashtag mix for your niche, audience, and platform. Results include sources and never guarantee virality.</p>
      </header>
      <HashtagResearchForm researchEnabled={researchEnabled} />
    </div>
  );
}
