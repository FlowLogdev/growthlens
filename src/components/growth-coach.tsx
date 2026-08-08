"use client";

import { FormEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

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
  const { locale, t } = useLocale();
  const pageLabel = PAGE_LABELS[pathname] ?? "Dashboard";
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const quickQuestions = useMemo(() => {
    if (accountCount === 0) {
      return ["How do I connect Instagram?", "What will GrowthLens analyze?", "Why is my connection not working?"].map(t);
    }
    if (pageLabel === "Metrics") {
      return ["What changed recently?", "Which metric needs attention?", "Give me a 7-day growth test"].map(t);
    }
    if (pageLabel === "Posts") {
      return ["Which post should I repeat?", "What hook should I test?", "How can I earn more shares?"].map(t);
    }
    if (pageLabel === "Viral Hashtags") {
      return ["How should I mix hashtags?", "What makes a hashtag relevant?", "Plan a niche content test"].map(t);
    }
    return ["What should I do next?", "Explain my latest numbers", "How do I improve engagement?"].map(t);
  }, [accountCount, pageLabel, t]);

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
          pagePath: pathname,
          locale,
          history: messages.slice(-6).map((message) => ({
            ...message,
            content: message.content.slice(0, 2_000),
          })),
        }),
        signal: AbortSignal.timeout(45_000),
      });
      const payload = (await response.json()) as { answer?: string; error?: string };
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.answer ?? payload.error ?? localizedError(locale, "answer"),
        },
      ]);
    } catch (requestError) {
      const timedOut = (requestError as Error).name === "TimeoutError";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: localizedError(locale, timedOut ? "timeout" : "network"),
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
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9ff6b]">{t("Growth coach")}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-white">{askAboutPage(locale, t(pageLabel))}</h2>
              <p className="mt-1 text-[11px] text-white/38">{t(aiEnabled ? "Live dashboard guidance" : "Guided dashboard help")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 xl:hidden"
          >
            {t("Close")}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="max-w-[92%] rounded-2xl bg-white/[0.075] px-4 py-3 text-sm leading-6 text-white/78">
            {t(accountCount > 0
              ? "I can explain this page, translate your numbers, and turn your strongest signals into a practical growth test."
              : "I can guide you through connecting an account, explain each dashboard page, and help you prepare a growth plan.")}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "assistant"
                ? "bg-white/[0.075] text-white/78"
                : "ml-auto bg-[#d9ff6b] text-[#172016]"
            }`}
          >
            <CoachMessageContent content={message.content} />
          </div>
        ))}
        {loading && (
          <div className="max-w-[92%] rounded-2xl bg-white/[0.075] px-4 py-3 text-sm text-white/55">
            {t("GrowthLens Bot is reviewing your data and preparing a recommendation.")}
          </div>
        )}
        <div ref={messagesEndRef} />
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
          <label htmlFor="growth-coach-question" className="sr-only">{t("Ask the Growth coach")}</label>
          <textarea
            id="growth-coach-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={800}
            placeholder={t("Ask what the numbers mean or what to do next")}
            className="w-full resize-none bg-transparent px-2 py-1 text-sm leading-5 text-white outline-none placeholder:text-white/34"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || question.trim().length < 2}
              className="rounded-full bg-[#d9ff6b] px-4 py-2 text-xs font-bold text-[#172016] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t("Ask coach")}
            </button>
          </div>
        </form>
        <p className="mt-2 px-1 text-[10px] leading-4 text-white/35">{t("Advice uses your connected account data. Growth recommendations are experiments, not guaranteed outcomes.")}</p>
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
        {t("Ask coach")}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/58 p-3 backdrop-blur-sm xl:hidden" onClick={() => setOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={t("Growth coach")}
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

function localizedError(locale: string, type: "answer" | "timeout" | "network") {
  const messages = {
    "en-US": {
      answer: "I could not answer that right now. Please try again.",
      timeout: "The analysis took too long. Ask a narrower question and I will try again.",
      network: "I could not reach the coach. Please try again in a moment.",
    },
    "es-ES": {
      answer: "No pude responder en este momento. Inténtalo de nuevo.",
      timeout: "El análisis tardó demasiado. Haz una pregunta más específica e inténtalo de nuevo.",
      network: "No pude conectar con el asesor. Inténtalo de nuevo en un momento.",
    },
    "pt-BR": {
      answer: "Não consegui responder agora. Tente novamente.",
      timeout: "A análise demorou demais. Faça uma pergunta mais específica e tente novamente.",
      network: "Não consegui acessar o consultor. Tente novamente em instantes.",
    },
  } as const;
  return messages[locale as keyof typeof messages]?.[type] ?? messages["en-US"][type];
}

function askAboutPage(locale: string, page: string) {
  if (locale === "es-ES") return `Pregunta sobre ${page}`;
  if (locale === "pt-BR") return `Pergunte sobre ${page}`;
  return `Ask about ${page}`;
}

function InlineFormatting({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="font-medium text-[#d9ff6b] underline underline-offset-2">{link[1]}</a>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function CoachMessageContent({ content }: { content: string }) {
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  return (
    <div data-no-translate className="space-y-2">
      {lines.map((line, index) => {
        if (/^#{1,3}\s+/.test(line)) {
          return <h3 key={index} className="pt-1 font-semibold leading-5 text-white"><InlineFormatting text={line.replace(/^#{1,3}\s+/, "")} /></h3>;
        }
        if (/^[-•]\s+/.test(line)) {
          return <div key={index} className="flex gap-2"><span className="text-[#d9ff6b]">•</span><p><InlineFormatting text={line.replace(/^[-•]\s+/, "")} /></p></div>;
        }
        const numbered = line.match(/^(\d+)[.)]\s+(.+)/);
        if (numbered) {
          return <div key={index} className="flex gap-2"><span className="font-mono text-[#d9ff6b]">{numbered[1]}.</span><p><InlineFormatting text={numbered[2]} /></p></div>;
        }
        return <p key={index}><InlineFormatting text={line} /></p>;
      })}
    </div>
  );
}
