import type { ReactNode } from "react";
import Link from "next/link";

type GuideLink = {
  id: string;
  label: string;
};

const GUIDE_LINKS: GuideLink[] = [
  { id: "start", label: "Start here" },
  { id: "overview", label: "Overview" },
  { id: "metrics", label: "Metrics" },
  { id: "posts", label: "Posts" },
  { id: "hashtags", label: "Viral Hashtags" },
  { id: "connections", label: "Connect accounts" },
  { id: "links", label: "Tracked links" },
  { id: "billing", label: "Billing" },
  { id: "settings", label: "Settings" },
  { id: "coach", label: "Growth Coach" },
  { id: "language", label: "Language" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "support", label: "Support" },
];

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[2.5rem_1fr] sm:p-5">
      <div className="grid h-10 w-10 place-items-center rounded-full border border-[#d9ff6b]/30 bg-[#d9ff6b]/10 font-mono text-xs font-bold text-[#d9ff6b]">{number}</div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="mt-2 text-sm leading-6 text-white/52">{children}</div>
      </div>
    </div>
  );
}

function GuideSection({ id, eyebrow, title, intro, href, children }: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 rounded-2xl border border-white/11 bg-[#101513]/76 p-5 backdrop-blur-xl sm:p-7">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/50">{intro}</p>
        </div>
        {href && (
          <Link href={href} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[#d9ff6b]/30 px-4 text-xs font-bold text-[#d9ff6b] hover:bg-[#d9ff6b]/10">
            Open this page
          </Link>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function DefinitionGrid({ items }: { items: Array<{ term: string; description: string }> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.term} className="rounded-xl border border-white/9 bg-white/[0.035] p-4">
          <dt className="text-sm font-semibold text-white">{item.term}</dt>
          <dd className="mt-2 text-xs leading-5 text-white/46">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}

function Tip({ children, tone = "lime" }: { children: ReactNode; tone?: "lime" | "blue" | "red" }) {
  const styles = {
    lime: "border-[#d9ff6b]/20 bg-[#d9ff6b]/[0.065] text-[#e8ffad]",
    blue: "border-[#67c7f2]/20 bg-[#67c7f2]/[0.065] text-[#bcecff]",
    red: "border-[#ff7d66]/22 bg-[#ff7d66]/[0.07] text-[#ffc1b5]",
  };
  return <div className={`rounded-xl border p-4 text-sm leading-6 ${styles[tone]}`}>{children}</div>;
}

export default function DocumentationPage() {
  return (
    <div className="space-y-7">
      <header className="rounded-2xl border border-white/11 bg-[radial-gradient(circle_at_85%_20%,rgba(217,255,107,0.14),transparent_38%),rgba(16,21,19,0.78)] p-6 backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">GrowthLens help center</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Everything you need to use GrowthLens confidently.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/54 sm:text-base">This guide explains every dashboard tab, every connection step, the meaning of your numbers, and the fastest way to solve common problems. Start at the top if you are new, or use the index to jump directly to a question.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#start" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016]">Start the setup guide</a>
          <a href="#troubleshooting" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.045] px-5 text-sm font-semibold text-white">Fix a problem</a>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-white/10 bg-[#101513]/72 p-3 backdrop-blur-xl lg:sticky lg:top-5">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">On this page</p>
          <nav aria-label="Documentation sections" className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {GUIDE_LINKS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="rounded-lg px-3 py-2 text-xs font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white">{item.label}</a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 space-y-6">
          <GuideSection id="start" eyebrow="First login" title="Start here: your first 15 minutes" intro="GrowthLens becomes useful after it receives real analytics from at least one social account. Complete these steps in order.">
            <div className="grid gap-3">
              <Step number="01" title="Confirm your workspace">
                Open <Link href="/dashboard/settings" className="font-semibold text-[#d9ff6b] underline underline-offset-2">Settings</Link>, check the account email, and save the business name you want shown in the workspace.
              </Step>
              <Step number="02" title="Connect one social account">
                Open <Link href="/dashboard/connect" className="font-semibold text-[#d9ff6b] underline underline-offset-2">Connect accounts</Link>. Choose Facebook and linked Instagram, or TikTok. Approve analytics access and return to GrowthLens.
              </Step>
              <Step number="03" title="Complete the first sync">
                TikTok customers can select <strong className="text-white/80">Sync data now</strong>. Facebook and Instagram data is collected after the connection completes. Provider data can take a few minutes to appear.
              </Step>
              <Step number="04" title="Read the signal in order">
                Start with Overview, then open Metrics, then Posts. Use the Growth Coach after the numbers appear to turn the strongest signal into a specific test.
              </Step>
            </div>
            <div className="mt-4"><Tip>Do not expect every metric to appear immediately. Social networks return different fields, and some fields can be unavailable for a specific account or post. GrowthLens shows zero or unavailable instead of inventing data.</Tip></div>
          </GuideSection>

          <GuideSection id="overview" eyebrow="Tab 01" title="Overview" intro="Overview is the home screen for your workspace. It answers: what is connected, what plan is active, and what should I review next?" href="/dashboard">
            <DefinitionGrid items={[
              { term: "Connected", description: "The number of connected platform accounts compared with your plan allowance." },
              { term: "Followers", description: "The latest follower total returned for each connected account, added together." },
              { term: "Reach", description: "The recent reach values returned by your connected platforms. Reach means accounts that saw the content when the provider supplies it." },
              { term: "Engagement", description: "The recent average engagement rate from synchronized data. It is a directional signal, not a promise of future performance." },
            ]} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Tip tone="blue"><strong className="text-white">Connected accounts</strong><br />Select Manage to open connection controls. Each account card shows the platform, account name, and current status.</Tip>
              <Tip><strong className="text-white">Latest growth actions</strong><br />These are evidence-backed actions generated from synchronized data. Open Metrics to inspect the numbers behind the recommendation.</Tip>
            </div>
          </GuideSection>

          <GuideSection id="metrics" eyebrow="Tab 02" title="Metrics" intro="Metrics is the analysis room. It summarizes the latest 30 days and helps you see whether exposure and audience reactions are improving." href="/dashboard/metrics">
            <DefinitionGrid items={[
              { term: "Followers", description: "The most recent follower count for the selected connected account or accounts." },
              { term: "Video views", description: "The total available impressions or video views across synchronized posts in the selected period." },
              { term: "Total engagements", description: "Likes, comments, shares, and saves added together." },
              { term: "Engagement rate", description: "Total engagements divided by the available exposure value. Use it to compare content efficiency, not only raw size." },
              { term: "Performance trend", description: "Daily synchronized views, reach, and follower levels. A flat line can mean no new provider data was returned for that day." },
              { term: "Engagement mix", description: "A breakdown of likes, comments, shares, and saves. Shares and saves often show stronger intent than a passive like." },
              { term: "Content format comparison", description: "Views and engagements grouped by post type so you can compare formats such as video or image." },
              { term: "Refresh insights", description: "Pro customers can request an on-demand analysis refresh. A cooldown and daily limit protect the workspace from duplicate requests." },
            ]} />
            <div className="mt-5"><Tip>Starter customers analyze one account at a time. Pro customers can use the cross-account view. Compare similar periods and formats before deciding that one post caused a change.</Tip></div>
          </GuideSection>

          <GuideSection id="posts" eyebrow="Tab 03" title="Posts" intro="Posts compares individual content so you can identify formats, topics, and calls to action worth repeating." href="/dashboard/posts">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><h3 className="font-semibold text-white">Posts with the strongest signal</h3><p className="mt-2 text-sm leading-6 text-white/48">The top three recent posts are ranked using available engagement and exposure data. Treat this as a shortlist for investigation, not a guarantee that the same post will perform again.</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><h3 className="font-semibold text-white">Content ledger</h3><p className="mt-2 text-sm leading-6 text-white/48">The latest 60 synchronized posts appear newest first with type, views, likes, comments, shares, saves, and the original-post link when the platform provides it.</p></div>
            </div>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-white/52">
              <li>Find a post with strong views and strong engagement.</li>
              <li>Open the original and note its opening hook, format, topic, length, and call to action.</li>
              <li>Create a new variation that keeps the winning structure without copying the exact content.</li>
              <li>Compare the new post after enough time has passed for a fair test.</li>
            </ol>
          </GuideSection>

          <GuideSection id="hashtags" eyebrow="Tab 04" title="Viral Hashtags" intro="Viral Hashtags researches a current, relevant mix for a specific niche. No hashtag can guarantee virality, so the result is designed for testing." href="/dashboard/hashtags">
            <div className="grid gap-3">
              <Step number="01" title="Enter a precise niche">Use a specific phrase such as &quot;handmade fragrance for Brazilian women&quot; instead of a broad word such as &quot;beauty.&quot;</Step>
              <Step number="02" title="Describe the ideal audience">Include location, age range, need, interest, or buying intent. More useful detail produces a tighter result.</Step>
              <Step number="03" title="Choose the platform and region">Instagram and TikTok can use different discovery language. Select the platform you will actually publish on.</Step>
              <Step number="04" title="Review and copy the mix">The result separates precise niche tags, adjacent growth opportunities, and broad discovery tags. It also provides content angles and reviewed sources when available.</Step>
            </div>
            <div className="mt-4"><Tip tone="red">If research cannot finish, make the niche more specific and try again. If the error continues after one retry, check that the rest of the dashboard loads before opening a support ticket.</Tip></div>
          </GuideSection>

          <GuideSection id="connections" eyebrow="Tab 05" title="Connect accounts" intro="This page authorizes read-only performance access and shows how many account slots your plan has available." href="/dashboard/connect">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-[#67c7f2]/18 bg-[#67c7f2]/[0.045] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#67c7f2]">Facebook and Instagram</p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-white/54">
                  <li><strong className="text-white">1.</strong> Your Instagram account must be Business or Creator, not Personal.</li>
                  <li><strong className="text-white">2.</strong> The Instagram Professional account must be linked to a Facebook Page.</li>
                  <li><strong className="text-white">3.</strong> Sign in with the Facebook profile that manages that Page.</li>
                  <li><strong className="text-white">4.</strong> When Facebook says the app was previously linked, select <strong className="text-white">Edit Settings</strong>.</li>
                  <li><strong className="text-white">5.</strong> Select the Instagram Professional account and the Facebook Page that belongs with it.</li>
                  <li><strong className="text-white">6.</strong> Keep profile, posts, and insights permissions enabled. Select Done, then OK.</li>
                </ol>
                <p className="mt-4 text-xs leading-5 text-white/42">There is no separate Instagram login button. Instagram is discovered through the Facebook Page connection.</p>
              </div>
              <div className="rounded-2xl border border-[#ff7d66]/18 bg-[#ff7d66]/[0.045] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ff9e8b]">TikTok</p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-white/54">
                  <li><strong className="text-white">1.</strong> Select Connect TikTok and sign in to the account you want to analyze.</li>
                  <li><strong className="text-white">2.</strong> Review and approve profile and video-insights access.</li>
                  <li><strong className="text-white">3.</strong> Return to GrowthLens and confirm the account appears as active.</li>
                  <li><strong className="text-white">4.</strong> Select Sync data now to request the latest profile and video metrics.</li>
                  <li><strong className="text-white">5.</strong> Open Posts and Metrics after the success message appears.</li>
                </ol>
              </div>
            </div>
            <details className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <summary className="cursor-pointer font-semibold text-white">Facebook says no eligible Page was returned</summary>
              <p className="mt-3 text-sm leading-6 text-white/50">Reconnect and select Edit Settings. Confirm that both the Page and its linked Instagram Professional account are selected. Also confirm that your Facebook profile has permission to manage the Page. A personal Instagram account cannot be added through this flow.</p>
            </details>
          </GuideSection>

          <GuideSection id="links" eyebrow="Tab 06" title="Tracked links" intro="The sidebar label says Link clicks. The page creates short GrowthLens links that record visits before sending the visitor to your real destination." href="/dashboard/links">
            <div className="grid gap-3">
              <Step number="01" title="Name the link">Use a name you will recognize later, such as &quot;Spring launch Instagram bio.&quot;</Step>
              <Step number="02" title="Choose the channel">Select Instagram, Facebook, TikTok, YouTube, or Other. This becomes part of the campaign information.</Step>
              <Step number="03" title="Paste the destination">Use the complete secure URL, including https://. This is the page visitors should ultimately reach.</Step>
              <Step number="04" title="Add optional tracking details">A custom tracking name controls the short URL ending. Use lowercase letters, numbers, and hyphens. Campaign helps group related links.</Step>
              <Step number="05" title="Copy and publish the GrowthLens URL">Use the generated usegrowthlens.com/r/... link in the bio, post, message, or campaign. Visits to the original destination URL cannot be counted by GrowthLens.</Step>
            </div>
            <div className="mt-4"><Tip>Use one tracked link per channel or campaign. If you use the same link everywhere, the total click count will work, but you will not know which placement produced the visit.</Tip></div>
          </GuideSection>

          <GuideSection id="billing" eyebrow="Tab 07" title="Billing" intro="Billing shows the current plan and status, opens secure Stripe checkout, and gives active subscribers access to the Stripe billing portal." href="/dashboard/billing">
            <DefinitionGrid items={[
              { term: "Starter - $29 per month", description: "Up to 3 connected accounts, automatic sync every 6 hours, weekly recommendations, a 30-day performance view, and weekly digest." },
              { term: "Pro - $79 per month", description: "Everything in Starter, up to 10 connected accounts, on-demand insight refreshes, cross-account analysis, priority support, and self-service billing." },
              { term: "Choose a plan", description: "Opens Stripe Checkout. Stripe collects the payment information. GrowthLens does not ask you to type card details into the dashboard." },
              { term: "Manage billing", description: "Opens the Stripe customer portal for payment methods, invoices, subscription changes, and cancellation when available." },
            ]} />
            <div className="mt-5"><Tip tone="blue">After a successful checkout, Stripe sends you back to Overview. Wait for the &quot;Subscription activated&quot; message before relying on the new plan allowance. If checkout is canceled, no plan change is applied.</Tip></div>
          </GuideSection>

          <GuideSection id="settings" eyebrow="Tab 08" title="Settings" intro="Settings controls the workspace name and the platform accounts that are currently connected." href="/dashboard/settings">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><h3 className="font-semibold text-white">Business name</h3><p className="mt-2 text-sm leading-6 text-white/48">Enter the name you want associated with the workspace and select Save. The account email is displayed underneath for confirmation.</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><h3 className="font-semibold text-white">Disconnect</h3><p className="mt-2 text-sm leading-6 text-white/48">Disconnect removes that platform account from the GrowthLens workspace. It does not delete the social profile. Reconnecting may require new authorization.</p></div>
            </div>
          </GuideSection>

          <GuideSection id="coach" eyebrow="Always available" title="Growth Coach" intro="Growth Coach is the help and strategy panel on the right side of desktop pages and the Ask coach button on smaller screens.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><h3 className="font-semibold text-white">What it can do</h3><p className="mt-2 text-sm leading-6 text-white/48">Explain the current page, analyze synchronized account data, compare signals, suggest experiments, clarify connection steps, and answer follow-up questions in the current conversation.</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><h3 className="font-semibold text-white">How to ask better questions</h3><p className="mt-2 text-sm leading-6 text-white/48">Ask one focused question with a goal and timeframe. Example: &quot;Which two videos should I study, and what should I test during the next seven days?&quot;</p></div>
            </div>
            <div className="mt-5"><Tip>Recommendations are experiments based on available data, not guaranteed outcomes. The coach cannot replace missing platform data and should not be used for legal, financial, or medical decisions.</Tip></div>
          </GuideSection>

          <GuideSection id="language" eyebrow="Workspace preference" title="Language" intro="GrowthLens supports English (US), Spanish (ES), and Portuguese (BR). The first visit can use location and browser preferences, and the customer can change the language manually.">
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-white/52">
              <li>Find Language near the top of the dashboard sidebar.</li>
              <li>Select English (US), Español (ES), or Português (BR).</li>
              <li>The choice is saved for future visits in the same browser.</li>
              <li>Provider pages such as Facebook, TikTok, or Stripe can use the language configured in the provider account or browser.</li>
            </ol>
          </GuideSection>

          <GuideSection id="troubleshooting" eyebrow="Before opening a ticket" title="Troubleshooting checklist" intro="Use the checks below in order. Most connection and display problems are resolved without changing the account.">
            <div className="space-y-3">
              {[
                ["The page looks old or did not change", "Refresh once. If needed, sign out and sign back in. Avoid repeatedly submitting the same form while the page is loading."],
                ["A connected account has no data", "Open Connect accounts and confirm the status is active. For TikTok, select Sync data now. Then wait a few minutes and reopen Metrics or Posts."],
                ["Instagram is not listed", "Confirm it is a Business or Creator account linked to a Facebook Page. Reconnect Meta, select Edit Settings, and select both the Instagram account and the matching Page."],
                ["Facebook returns to GrowthLens without data", "Read the message at the top of Connect accounts. If it says no eligible Page, repeat the flow with Edit Settings and approve the Page you manage."],
                ["A chart shows zero or unavailable", "The connected platform did not return that field for the selected period. Check Posts for available raw metrics and avoid treating a missing field as a real zero."],
                ["Hashtag research could not finish", "Use a more specific niche, confirm the audience and region, and retry once. If the rest of the site is also failing, wait briefly before opening a ticket."],
                ["A tracked link has zero clicks", "Confirm you published the generated /r/ link, not the destination URL. Test the generated link in a private browser window and then refresh the page."],
                ["The plan did not change after payment", "Open Billing and check the status. Return to Overview and look for the activation message. Do not purchase again if Stripe already sent a receipt."],
                ["The Growth Coach does not answer", "Shorten the question, ask about one goal, and try again. Confirm that other dashboard pages load before reporting a coach-only problem."],
              ].map(([title, answer]) => (
                <details key={title} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-white">{title}</summary>
                  <p className="mt-3 text-sm leading-6 text-white/50">{answer}</p>
                </details>
              ))}
            </div>
          </GuideSection>

          <GuideSection id="support" eyebrow="Still need help" title="Open a support ticket" intro="If the checklist does not solve the problem, send one complete ticket so the support team can reproduce it." href="/contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><h3 className="font-semibold text-white">Include this information</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/48"><li>The dashboard page and action you used.</li><li>The exact message shown on the screen.</li><li>What you expected to happen.</li><li>Your browser and approximate time of the problem.</li><li>A screenshot with sensitive information hidden.</li></ul></div>
              <div className="rounded-xl border border-[#ff7d66]/20 bg-[#ff7d66]/[0.055] p-4"><h3 className="font-semibold text-white">Never include this information</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/52"><li>Passwords or one-time codes.</li><li>API keys or access tokens.</li><li>Full payment card information.</li><li>Private customer or audience data that is not needed to reproduce the issue.</li></ul></div>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/50">A ticket number similar to <span className="font-mono font-semibold text-white">Growth10002026</span> is emailed to you and to support@flowlog.dev. Keep that number in replies so the conversation stays together. Pro customers are marked for priority handling.</p>
          </GuideSection>
        </main>
      </div>
    </div>
  );
}
