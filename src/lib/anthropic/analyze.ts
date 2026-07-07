import "server-only";
import { getAnthropicClient, CLAUDE_MODEL } from "./client";

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

export async function generateInsights(params: {
  platform: string;
  niche: string;
  periodDays: number;
  dailyMetrics: DailyMetricSummary[];
  topPosts: PostSummary[];
  bottomPosts: PostSummary[];
}): Promise<{ result: AiInsightResult; raw: unknown }> {
  const message = await getAnthropicClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: buildPrompt(params) }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude response contained no text block");
  }

  const result = JSON.parse(textBlock.text) as AiInsightResult;
  return { result, raw: message };
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
