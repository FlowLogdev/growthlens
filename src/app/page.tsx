import Image from "next/image";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";

const WORKFLOW = [
  {
    number: "01",
    title: "Connect the channels that matter",
    copy: "Bring Facebook Pages, Instagram Business, and TikTok Business performance into one focused workspace.",
  },
  {
    number: "02",
    title: "Find the signal inside the noise",
    copy: "GrowthLens compares posts, timing, reach, and engagement to surface patterns specific to your audience.",
  },
  {
    number: "03",
    title: "Act on a short weekly plan",
    copy: "Get evidence-backed recommendations with a clear action, reason, and timeframe for your next growth test.",
  },
];

const SIGNALS = [
  { label: "Engagement", value: "+18%", tone: "text-[#33a853]" },
  { label: "Best format", value: "Short video", tone: "text-[var(--ink)]" },
  { label: "Next test", value: "Tue 11 AM", tone: "text-[var(--ink)]" },
];

export default function LandingPage() {
  return (
    <MarketingLayout>
      <section className="relative isolate min-h-[calc(100dvh-72px)] overflow-hidden border-b border-white/10 bg-[#101513] text-white">
        <Image
          src="/brand/growthlens-hero.png"
          alt="Three streams of social data converging into an upward growth signal"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[68%_center] sm:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,12,10,0.96)_0%,rgba(8,12,10,0.84)_34%,rgba(8,12,10,0.28)_67%,rgba(8,12,10,0.08)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,12,10,0.2)_0%,rgba(8,12,10,0.06)_52%,rgba(8,12,10,0.82)_100%)]"
        />

        <div className="mx-auto grid min-h-[calc(100dvh-72px)] w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_0.58fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-2xl self-center">
            <p className="inline-flex text-xs font-bold uppercase tracking-[0.15em] text-[#d9ff6b]">
              AI-powered organic growth intelligence
            </p>
            <h1 className="mt-6 text-balance text-[clamp(3.15rem,6.4vw,6.35rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#f4f7f2]">
              Turn social signals into a sharper growth plan.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-7 text-white/72">
              Connect your channels, find the patterns, and get practical weekly actions.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup?plan=starter"
                className="marketing-button marketing-button-large bg-[#d9ff6b] text-[#172016] hover:bg-[#c8ef5f]"
              >
                Start your 14-day trial
              </Link>
              <Link
                href="/pricing"
                className="marketing-button marketing-button-large border border-white/24 bg-[#101513]/55 text-white backdrop-blur-md hover:border-white/55 hover:bg-[#101513]/75"
              >
                See pricing
              </Link>
            </div>
          </div>

          <div className="w-full self-end rounded-2xl border border-white/16 bg-[#101513]/68 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:mb-2 lg:max-w-md lg:justify-self-end">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/52">This week&apos;s signal</p>
              <span className="rounded-full bg-[#d9ff6b] px-2.5 py-1 text-[11px] font-bold text-[#172016]">Ready</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {SIGNALS.map((signal) => (
                <div key={signal.label}>
                  <p className="text-sm font-semibold text-white">{signal.value}</p>
                  <p className="mt-1 text-[11px] text-white/46">{signal.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-[var(--surface-soft)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-sm font-medium text-[var(--muted)]">Built for the channels where organic growth happens</p>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {['Facebook Pages', 'Instagram Business', 'TikTok Business'].map((platform) => (
              <span key={platform} className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="scroll-mt-24 border-b border-[var(--line)]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:px-8">
          <div>
            <p className="marketing-eyebrow">One useful loop</p>
            <h2 className="mt-5 max-w-lg text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              Less reporting theater. More useful decisions.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-[var(--muted)]">
              GrowthLens is designed to answer one question every week: what should you do next?
            </p>
          </div>

          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {WORKFLOW.map((item) => (
              <article key={item.number} className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:py-10">
                <p className="font-mono text-xs text-[var(--subtle)]">{item.number}</p>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.025em]">{item.title}</h3>
                  <p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-[var(--line)] bg-[#111712] text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:px-8">
          <div>
            <p className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
              Recommendations with receipts
            </p>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              Every action traces back to your own performance data.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/62">
              No generic growth hacks. GrowthLens connects recommendations to actual posts, engagement, timing, and reach.
            </p>
          </div>

          <div className="relative rounded-[1.75rem] border border-white/12 bg-white/[0.055] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Recommended test</p>
                <p className="mt-2 text-xl font-semibold">Repeat the short-form tutorial format</p>
              </div>
              <span className="rounded-full bg-[#d9ff6b] px-3 py-1 text-xs font-bold text-[#172016]">High signal</span>
            </div>
            <dl className="mt-6 space-y-6">
              <div className="grid grid-cols-[6.5rem_1fr] gap-4">
                <dt className="text-sm text-white/40">Evidence</dt>
                <dd className="text-sm leading-6 text-white/76">Tutorial posts reached 2.4x more non-followers and held 31% more watch time.</dd>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-4">
                <dt className="text-sm text-white/40">Action</dt>
                <dd className="text-sm leading-6 text-white/76">Publish two focused tutorials next week with the winning 11 AM opening window.</dd>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-4">
                <dt className="text-sm text-white/40">Measure</dt>
                <dd className="text-sm leading-6 text-white/76">Compare non-follower reach and completion rate after seven days.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1fr_auto] md:items-end md:py-28 lg:px-8">
          <div>
            <p className="marketing-eyebrow">Simple monthly plans</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              Price it against one hour of your time.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
              Starter is $29 per month. Pro is $79 with faster insight cycles and priority support.
            </p>
          </div>
          <Link href="/pricing" className="marketing-button marketing-button-primary marketing-button-large">
            Compare plans
          </Link>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#d9ff6b] px-6 py-12 text-[#172016] sm:px-10 sm:py-16 lg:px-16">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#172016]/55">Your next growth decision can be clearer</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <h2 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Stop guessing what worked. Build the next week from evidence.
              </h2>
              <Link href="/signup?plan=starter" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#172016] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                Start free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
