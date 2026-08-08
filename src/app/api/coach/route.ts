import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSecondaryAIClient, SECONDARY_AI_MODEL } from "@/lib/anthropic/client";
import { isRateLimited } from "@/lib/rate-limit";

const requestSchema = z.object({
  question: z.string().trim().min(2).max(800),
  page: z.string().trim().max(80).optional(),
  history: z.array(z.object({
    role: z.enum(["assistant", "user"]),
    content: z.string().trim().min(1).max(6_000),
  })).max(8).optional(),
});

type PrimaryAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

const coachSystemPrompt =
  "You are the GrowthLens coach inside a social analytics dashboard. Explain the current page, account connection steps, and data-backed growth actions. Use only the supplied customer context. Never invent metrics, causes, competitor facts, or guarantees. If data is missing, say what must be connected or synced first. Distinguish observation from hypothesis. Give concise, practical guidance with one prioritized next experiment and a measurement window. Do not claim that GrowthLens can publish or change a social account.";

function extractPrimaryAIText(payload: PrimaryAIResponse) {
  return (payload.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();
}

async function askPrimaryAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_COACH_MODEL || "gpt-5-mini",
      reasoning: { effort: "low" },
      instructions: coachSystemPrompt,
      input: prompt,
      max_output_tokens: 650,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json() as PrimaryAIResponse;
  if (!response.ok) throw new Error(payload.error?.message || `Primary coach request failed with ${response.status}`);
  return extractPrimaryAIText(payload);
}

async function askSecondaryAI(prompt: string) {
  const message = await getSecondaryAIClient().messages.create({
    model: SECONDARY_AI_MODEL,
    max_tokens: 320,
    system: `${coachSystemPrompt} Act as a second analyst. Give only a brief cross-check that adds one caveat, missing signal, or useful measurement detail. Do not repeat the full answer.`,
    messages: [{ role: "user", content: prompt }],
  }, { signal: AbortSignal.timeout(30_000) });
  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : "";
}

function fallbackAnswer(question: string, accountCount: number) {
  const normalized = question.toLowerCase();
  if (accountCount === 0 || normalized.includes("connect")) {
    return "Open Connect accounts, choose Facebook and Instagram or TikTok, then approve the requested read-only analytics permissions. For Instagram, the profile must be a Business or Creator account linked to a Facebook Page. If a provider is unavailable, GrowthLens will show the exact configuration item that still needs attention.";
  }
  if (normalized.includes("engagement")) {
    return "Open Metrics and compare views, likes, comments, shares, and engagement rate. Then use Posts to repeat the strongest content format with one controlled change, such as the opening hook or posting time, and compare the next seven days.";
  }
  return "Use Metrics for trends and engagement mix, Posts for content-level performance, Viral Hashtags for current niche research, and Link clicks for traffic intent. Ask about a specific number or post and I will turn it into a testable next step.";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to use the Growth coach." }, { status: 401 });
  }

  if (isRateLimited(`growth-coach:${user.id}`, { windowMs: 60 * 60_000, maxRequests: 30 })) {
    return NextResponse.json({ error: "The coach has reached its hourly limit. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The question could not be read." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const question = typeof body === "object" && body !== null && "question" in body
      ? (body as { question?: unknown }).question
      : undefined;
    const validQuestion = z.string().trim().min(2).max(800).safeParse(question).success;
    return NextResponse.json(
      {
        error: validQuestion
          ? "The recent conversation could not be read. Please ask the question again."
          : "Enter a question between 2 and 800 characters.",
      },
      { status: 400 },
    );
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, business_name, plan_tier")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "Customer account not found." }, { status: 404 });
  }

  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("id, platform, account_name, status")
    .eq("customer_id", customer.id)
    .limit(20);
  const accountIds = (accounts ?? []).map((account) => account.id);

  const [{ data: insights }, metricsResult, postsResult] = await Promise.all([
    supabase
      .from("ai_insights")
      .select("period_start, period_end, top_performers, blockers, recommendations, generated_at")
      .eq("customer_id", customer.id)
      .order("generated_at", { ascending: false })
      .limit(3),
    accountIds.length
      ? supabase
          .from("daily_metrics")
          .select("account_id, date, followers, reach, impressions, engagement_rate")
          .in("account_id", accountIds)
          .order("date", { ascending: false })
          .limit(45)
      : Promise.resolve({ data: [] }),
    accountIds.length
      ? supabase
          .from("post_performance")
          .select("account_id, content_type, posted_at, reach, impressions, likes, comments, shares, saves, watch_time_avg, video_completion_rate")
          .in("account_id", accountIds)
          .order("posted_at", { ascending: false })
          .limit(25)
      : Promise.resolve({ data: [] }),
  ]);

  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ answer: fallbackAnswer(parsed.data.question, accounts?.length ?? 0) });
  }

  const context = {
    business: customer.business_name,
    plan: customer.plan_tier,
    page: parsed.data.page,
    accounts: accounts ?? [],
    recent_metrics: metricsResult.data ?? [],
    recent_posts: postsResult.data ?? [],
    recent_insights: insights ?? [],
  };

  const recentConversation = (parsed.data.history ?? [])
    .slice(-6)
    .map((message) => ({ ...message, content: message.content.slice(0, 2_000) }));
  const prompt = `CUSTOMER CONTEXT\n${JSON.stringify(context)}\n\nRECENT CONVERSATION\n${JSON.stringify(recentConversation)}\n\nQUESTION\n${parsed.data.question}`;
  const primaryJob = process.env.OPENAI_API_KEY
    ? askPrimaryAI(prompt).catch((error) => {
        console.error("Primary coach request failed", (error as Error).message);
        return "";
      })
    : Promise.resolve("");
  const secondaryJob = process.env.ANTHROPIC_API_KEY
    ? askSecondaryAI(prompt).catch((error) => {
        console.error("Secondary coach request failed", (error as Error).message);
        return "";
      })
    : Promise.resolve("");

  const [primaryAnswer, secondaryAnswer] = await Promise.all([primaryJob, secondaryJob]);
  const answer = primaryAnswer
    ? [primaryAnswer, secondaryAnswer].filter(Boolean).join("\n\n")
    : secondaryAnswer;

  return NextResponse.json({
    answer: answer || fallbackAnswer(parsed.data.question, accounts?.length ?? 0),
  });
}
