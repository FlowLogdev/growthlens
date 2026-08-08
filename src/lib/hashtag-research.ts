import "server-only";
import { z } from "zod";
import { getSecondaryAIClient, SECONDARY_AI_MODEL } from "@/lib/anthropic/client";

const hashtagSchema = z.object({
  tag: z.string().trim().min(2).max(80),
  category: z.enum(["niche", "growth", "discovery"]),
  reason: z.string().trim().min(4).max(240),
});

const sourceSchema = z.object({
  title: z.string().trim().min(2).max(180),
  url: z.string().url(),
});

export const providerResultSchema = z.object({
  summary: z.string().trim().min(10).max(900),
  hashtags: z.array(hashtagSchema).min(6).max(30),
  content_angles: z.array(z.string().trim().min(4).max(180)).min(2).max(8),
  sources: z.array(sourceSchema).max(12).default([]),
});

export type HashtagResearch = z.infer<typeof providerResultSchema> & {
  generated_at: string;
};

type ResearchInput = {
  niche: string;
  audience?: string;
  platform: "instagram" | "tiktok" | "both";
  region?: string;
};

const jsonInstructions = `Return only valid JSON with this exact shape:
{
  "summary": "short evidence-aware summary",
  "hashtags": [
    { "tag": "#example", "category": "niche", "reason": "why it fits" }
  ],
  "content_angles": ["specific content idea"],
  "sources": [{ "title": "source title", "url": "https://source.example" }]
}
Use only category values niche, growth, or discovery. Include 18 to 24 unique hashtags. A niche tag is tightly relevant, a growth tag has broader adjacent discovery potential, and a discovery tag is broad but still relevant. Never promise virality or invent exact usage counts. Prefer recent evidence, active competitors, platform discovery pages, and credible marketing research. Include the original web sources you used.`;

const recordResearchTool = {
  name: "record_hashtag_research",
  description:
    "Record the final hashtag research after searching current web evidence. Call this exactly once after research is complete. Every field must follow the schema and contain only evidence-supported recommendations.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: { type: "string", minLength: 10, maxLength: 900 },
      hashtags: {
        type: "array",
        minItems: 6,
        maxItems: 30,
        items: {
          type: "object",
          properties: {
            tag: { type: "string", minLength: 2, maxLength: 80 },
            category: { type: "string", enum: ["niche", "growth", "discovery"] },
            reason: { type: "string", minLength: 4, maxLength: 240 },
          },
          required: ["tag", "category", "reason"],
          additionalProperties: false,
        },
      },
      content_angles: {
        type: "array",
        minItems: 2,
        maxItems: 8,
        items: { type: "string", minLength: 4, maxLength: 180 },
      },
      sources: {
        type: "array",
        maxItems: 12,
        items: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 2, maxLength: 180 },
            url: { type: "string", format: "uri" },
          },
          required: ["title", "url"],
          additionalProperties: false,
        },
      },
    },
    required: ["summary", "hashtags", "content_angles", "sources"],
    additionalProperties: false,
  },
};

const primaryResearchSchema = {
  type: "object" as const,
  properties: {
    summary: { type: "string" },
    hashtags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tag: { type: "string" },
          category: { type: "string", enum: ["niche", "growth", "discovery"] },
          reason: { type: "string" },
        },
        required: ["tag", "category", "reason"],
        additionalProperties: false,
      },
    },
    content_angles: {
      type: "array",
      items: { type: "string" },
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
        required: ["title", "url"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "hashtags", "content_angles", "sources"],
  additionalProperties: false,
};

function promptFor(input: ResearchInput) {
  return `Research current high-opportunity social hashtags and competitor language for this request.

Niche: ${input.niche}
Audience: ${input.audience || "not specified"}
Platform: ${input.platform}
Region: ${input.region || "not specified"}

Search the current web. Look for active niche creators, competitor vocabulary, recent topic demand, and platform-relevant discovery patterns. Balance precise niche tags with adjacent growth and broader discovery tags. Do not include banned, misleading, unrelated, or generic spam tags.

${jsonInstructions}`;
}

function extractJson(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first < 0 || last <= first) throw new Error("Research provider did not return JSON");
  return providerResultSchema.parse(JSON.parse(trimmed.slice(first, last + 1)));
}

async function researchWithSecondaryAI(input: ResearchInput) {
  const message = await getSecondaryAIClient().messages.create({
    model: SECONDARY_AI_MODEL,
    max_tokens: 2600,
    system: "You are a social research analyst. Search before answering. Favor relevance and evidence over raw hashtag popularity. Finish by calling record_hashtag_research exactly once; do not write the final result as free-form text.",
    messages: [{ role: "user", content: promptFor(input) }],
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 2 },
      recordResearchTool,
    ],
  }, { signal: AbortSignal.timeout(60_000) });

  const structured = message.content.find(
    (block) => block.type === "tool_use" && block.name === recordResearchTool.name,
  );
  if (structured?.type === "tool_use") {
    return providerResultSchema.parse(structured.input);
  }

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.type === "text" ? block.text : "")
    .join("\n");
  return extractJson(text);
}

type PrimaryAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
  status?: string;
  incomplete_details?: { reason?: string };
};

async function researchWithPrimaryAI(input: ResearchInput) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_RESEARCH_MODEL || "gpt-5-mini",
      reasoning: { effort: "low" },
      tools: [{ type: "web_search", search_context_size: "low" }],
      input: promptFor(input),
      text: {
        format: {
          type: "json_schema",
          name: "hashtag_research",
          strict: true,
          schema: primaryResearchSchema,
        },
      },
      max_output_tokens: 3200,
    }),
    signal: AbortSignal.timeout(45_000),
  });
  const payload = await response.json() as PrimaryAIResponse;
  if (!response.ok) throw new Error(payload.error?.message || `Primary research failed with ${response.status}`);
  if (payload.status === "incomplete") {
    throw new Error(`Primary research incomplete: ${payload.incomplete_details?.reason || "unknown reason"}`);
  }
  const text = (payload.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("\n");
  return extractJson(text);
}

function normalizeTag(input: string) {
  const cleaned = input.trim().replace(/\s+/g, "").replace(/[^#\p{L}\p{N}_]/gu, "");
  if (!cleaned) return "";
  return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
}

export async function researchHashtags(input: ResearchInput): Promise<HashtagResearch> {
  const successful: Array<z.infer<typeof providerResultSchema>> = [];
  const providers: Array<() => Promise<z.infer<typeof providerResultSchema>>> = [];
  if (process.env.OPENAI_API_KEY) providers.push(() => researchWithPrimaryAI(input));
  if (process.env.ANTHROPIC_API_KEY) providers.push(() => researchWithSecondaryAI(input));
  if (!providers.length) throw new Error("AI_RESEARCH_NOT_CONFIGURED");

  for (const run of providers) {
    try {
      successful.push(await run());
      break;
    } catch (error) {
      console.error("GrowthLens research request failed", (error as Error).message);
    }
  }
  if (!successful.length) throw new Error("AI_RESEARCH_FAILED");

  const hashtags = new Map<string, z.infer<typeof hashtagSchema>>();
  const contentAngles = new Set<string>();
  const sources = new Map<string, z.infer<typeof sourceSchema>>();
  for (const result of successful) {
    for (const item of result.hashtags) {
      const tag = normalizeTag(item.tag);
      if (tag && !hashtags.has(tag.toLowerCase())) hashtags.set(tag.toLowerCase(), { ...item, tag });
    }
    for (const angle of result.content_angles) contentAngles.add(angle);
    for (const source of result.sources) sources.set(source.url, source);
  }

  return {
    summary: successful.map((result) => result.summary).join("\n\n"),
    hashtags: [...hashtags.values()].slice(0, 30),
    content_angles: [...contentAngles].slice(0, 8),
    sources: [...sources.values()].slice(0, 12),
    generated_at: new Date().toISOString(),
  };
}
