import "server-only";
import { z } from "zod";
import { getSecondaryAIClient, SECONDARY_AI_MODEL } from "./client";

export interface DailyMetricSummary {
  date: string;
  followers: number | null;
  reach: number | null;
  impressions: number | null;
  engagement_rate: number | null;
}

export interface PostSummary {
  platform_post_id: string;
  caption: string | null;
  content_type: string | null;
  posted_at: string | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagement_rate: number;
}

export interface AiInsightResult {
  top_performers: {
    content_types: string[];
    posting_times: string[];
    patterns: string[];
  };
  blockers: Array<{ issue: string; evidence: string; severity: "high" | "medium" | "low" }>;
  recommendations: Array<{ action: string; why: string; timeframe: string }>;
}

const insightSchema = z.object({
  top_performers: z.object({
    content_types: z.array(z.string()),
    posting_times: z.array(z.string()),
    patterns: z.array(z.string()),
  }),
  blockers: z.array(z.object({
    issue: z.string(),
    evidence: z.string(),
    severity: z.enum(["high", "medium", "low"]),
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    why: z.string(),
    timeframe: z.string(),
  })),
});

const primaryInsightSchema = {
  type: "object" as const,
  properties: {
    top_performers: {
      type: "object",
      properties: {
        content_types: { type: "array", items: { type: "string" } },
        posting_times: { type: "array", items: { type: "string" } },
        patterns: { type: "array", items: { type: "string" } },
      },
      required: ["content_types", "posting_times", "patterns"],
      additionalProperties: false,
    },
    blockers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          evidence: { type: "string" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["issue", "evidence", "severity"],
        additionalProperties: false,
      },
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          why: { type: "string" },
          timeframe: { type: "string" },
        },
        required: ["action", "why", "timeframe"],
        additionalProperties: false,
      },
    },
  },
  required: ["top_performers", "blockers", "recommendations"],
  additionalProperties: false,
};

type PrimaryInsightResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

// Prompt template from spec Section 10 — every recommendation must trace to
// a pattern in this account's own data, no generic advice.
function buildPrompt(params: {
  platform: string;
  niche: string;
  periodDays: number;
  dailyMetrics: DailyMetricSummary[];
  topPosts: PostSummary[];
  bottomPosts: PostSummary[];
}) {
  return `You are analyzing social media performance data for a ${params.platform} account in the ${params.niche} space.

AGGREGATED DATA (last ${params.periodDays} days):
${JSON.stringify(params.dailyMetrics, null, 2)}

TOP 5 POSTS BY ENGAGEMENT RATE:
${JSON.stringify(params.topPosts, null, 2)}

BOTTOM 5 POSTS BY ENGAGEMENT RATE:
${JSON.stringify(params.bottomPosts, null, 2)}

Respond with ONLY valid JSON in this exact shape:

{
  "top_performers": {
    "content_types": ["..."],
    "posting_times": ["..."],
    "patterns": ["specific observation 1", "specific observation 2"]
  },
  "blockers": [
    {"issue": "...", "evidence": "specific data point", "severity": "high|medium|low"}
  ],
  "recommendations": [
    {"action": "specific, testable action", "why": "reasoning tied to data", "timeframe": "e.g. next 2 weeks"}
  ]
}

Be specific and reference actual numbers. No generic advice — every recommendation must trace to a pattern in this account's own data.`;
}

async function generateWithPrimaryAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_INSIGHT_MODEL || process.env.OPENAI_COACH_MODEL || "gpt-5-mini",
      reasoning: { effort: "low" },
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "growth_insight",
          strict: true,
          schema: primaryInsightSchema,
        },
      },
      max_output_tokens: 2200,
    }),
    signal: AbortSignal.timeout(40_000),
  });
  const payload = await response.json() as PrimaryInsightResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `Primary insight request failed with ${response.status}`);
  }
  const text = (payload.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();
  if (!text) throw new Error("Primary insight response contained no text");
  return { result: insightSchema.parse(JSON.parse(text)), raw: payload };
}

async function generateWithSecondaryAI(prompt: string) {
  const message = await getSecondaryAIClient().messages.create({
    model: SECONDARY_AI_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  }, { signal: AbortSignal.timeout(40_000) });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Secondary insight response contained no text block");
  }
  return { result: insightSchema.parse(JSON.parse(textBlock.text)), raw: message };
}

export async function generateInsights(params: {
  platform: string;
  niche: string;
  periodDays: number;
  dailyMetrics: DailyMetricSummary[];
  topPosts: PostSummary[];
  bottomPosts: PostSummary[];
}): Promise<{ result: AiInsightResult; raw: unknown }> {
  const prompt = buildPrompt(params);
  const errors: string[] = [];

  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateWithPrimaryAI(prompt);
    } catch (error) {
      errors.push((error as Error).message);
      console.error("Primary insight generation failed", (error as Error).message);
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await generateWithSecondaryAI(prompt);
    } catch (error) {
      errors.push((error as Error).message);
      console.error("Secondary insight generation failed", (error as Error).message);
    }
  }

  throw new Error(errors.at(-1) || "No growth insight provider is configured");
}

export function engagementRate(post: {
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  reach: number | null;
}): number {
  if (!post.reach) return 0;
  const engagements = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0);
  return engagements / post.reach;
}
