"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/metrics": "Metrics",
  "/dashboard/connect": "Connect accounts",
  "/dashboard/posts": "Posts",
  "/dashboard/hashtags": "Viral Hashtags",
  "/dashboard/links": "Link clicks",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
};

export function GrowthCoach({ accountCount, aiEnabled }: { accountCount: number; aiEnabled: boolean }) {
  const pathname = usePathname();
  const pageLabel = PAGE_LABELS[pathname] ?? "Dashboard";
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        accountCount > 0
          ? "I can explain this page, translate your numbers, and turn your strongest signals into a practical growth test."
          : "I can guide you through connecting an account, explain each dashboard page, and help you prepare a growth plan.",
    },
  ]);

  const quickQuestions = useMemo(() => {
    if (accountCount === 0) {
      return ["How do I connect Instagram?", "What will GrowthLens analyze?", "Why is my connection not working?"];
    }
    if (pageLabel === "Metrics") {
      return ["What changed recently?", "Which metric needs attention?", "Give me a 7-day growth test"];
    }
    if (pageLabel === "Posts") {
      return ["Which post should I repeat?", "What hook should I test?", "How can I earn more shares?"];
    }
    if (pageLabel === "Viral Hashtags") {
      return ["How should I mix hashtags?", "What makes a hashtag relevant?", "Plan a niche content test"];
    }
    return ["What should I do next?", "Explain my latest numbers", "How do I improve engagement?"];
  }, [accountCount, pageLabel]);

  async function askCoach(nextQuestion?: string) {
    const submitted = (nextQuestion ?? question).trim();
    if (submitted.length < 2 || loading) return;

    setMessages((current) => [...current, { role: "user", content: submitted }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: submitted,
          page: pageLabel,
          history: messages.slice(-6).map((message) => ({
            ...message,
            content: message.content.slice(0, 2_000),
          })),
        }),
        signal: AbortSignal.timeout(35_000),
      });
      const payload = (await response.json()) as { answer?: string; error?: string };
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.answer ?? payload.error ?? "I could not answer that right now. Please try again.",
        },
      ]);
    } catch (requestError) {
      const timedOut = (requestError as Error).name === "TimeoutError";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: timedOut
            ? "The analysis took too long. Ask a narrower question and I will try again."
            : "I could not reach the coach. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askCoach();
  }

  const panel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d9ff6b]/35 bg-[#d9ff6b]/10 font-mono text-xs font-bold text-[#d9ff6b]">GL</div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">Growth coach</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-white">Ask about {pageLabel}</h2>
              <p className="mt-1 text-[11px] text-white/38">{aiEnabled ? "Live dashboard guidance" : "Guided dashboard help"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 xl:hidden"
          >
            Close
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "assistant"
                ? "bg-white/[0.075] text-white/78"
                : "ml-auto bg-[#d9ff6b] text-[#172016]"
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="max-w-[92%] rounded-2xl bg-white/[0.075] px-4 py-3 text-sm text-white/55">
            GrowthLens Bot is reviewing your data and preparing a recommendation.
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickQuestions.map((item) => (
            <button
              key={item}
              type="button"
              disabled={loading}
              onClick={() => void askCoach(item)}
              className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-left text-[11px] font-medium text-white/64 transition-colors hover:border-[#d9ff6b]/45 hover:text-white disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-white/15 bg-[#0d120f]/75 p-2 focus-within:border-[#d9ff6b]/55">
          <label htmlFor="growth-coach-question" className="sr-only">Ask the Growth coach</label>
          <textarea
            id="growth-coach-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={800}
            placeholder="Ask what the numbers mean or what to do next"
            className="w-full resize-none bg-transparent px-2 py-1 text-sm leading-5 text-white outline-none placeholder:text-white/34"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || question.trim().length < 2}
              className="rounded-full bg-[#d9ff6b] px-4 py-2 text-xs font-bold text-[#172016] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
            >
              Ask coach
            </button>
          </div>
        </form>
        <p className="mt-2 px-1 text-[10px] leading-4 text-white/35">Advice uses your connected account data. Growth recommendations are experiments, not guaranteed outcomes.</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden min-h-[100dvh] w-[22rem] shrink-0 border-l border-white/10 bg-[#0d120f]/82 backdrop-blur-2xl xl:block">
        <div className="sticky top-0 h-[100dvh]">{panel}</div>
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 rounded-full border border-white/18 bg-[#d9ff6b] px-5 py-3 text-sm font-bold text-[#172016] shadow-[0_18px_55px_rgba(0,0,0,0.36)] xl:hidden"
      >
        Ask coach
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/58 p-3 backdrop-blur-sm xl:hidden" onClick={() => setOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Growth coach"
            onClick={(event) => event.stopPropagation()}
            className="ml-auto h-full w-full max-w-md overflow-hidden rounded-2xl border border-white/14 bg-[#101513] shadow-2xl"
          >
            {panel}
          </section>
        </div>
      )}
    </>
  );
}
