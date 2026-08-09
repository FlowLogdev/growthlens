import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSecondaryAIClient, SECONDARY_AI_MODEL } from "@/lib/anthropic/client";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { hasTranslation, translate, type Locale } from "@/lib/i18n";

const requestSchema = z.object({
  locale: z.enum(["es-ES", "pt-BR"]),
  texts: z.array(z.string().trim().min(1).max(1_200)).min(1).max(40),
});

const responseSchema = z.object({
  translations: z.array(z.string().trim().min(1).max(2_400)),
});

const translationCache = new Map<string, string>();

type PrimaryResponse = {
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  error?: { message?: string };
};

function localeName(locale: Locale) {
  return locale === "pt-BR" ? "Brazilian Portuguese" : "Spanish as used in Spain";
}

function parseTranslations(text: string, expected: number) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = responseSchema.parse(JSON.parse(cleaned));
  if (parsed.translations.length !== expected) throw new Error("Translation count mismatch");
  return parsed.translations;
}

function translationPrompt(locale: Locale, texts: string[]) {
  return `Translate every item in the JSON array into ${localeName(locale)}.

These strings come from a social analytics software interface. Preserve GrowthLens, product and platform names, URLs, email addresses, hashtags, IDs, numbers, dates, placeholders, and Markdown formatting. Translate the complete meaning naturally and professionally. Do not summarize, omit, add commentary, or change the array order.

Return only valid JSON in this exact shape: {"translations":["translated item"]}

Input:
${JSON.stringify(texts)}`;
}

async function translateWithPrimary(locale: Locale, texts: string[]) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_LOCALIZATION_MODEL || process.env.OPENAI_COACH_MODEL || "gpt-5-mini",
      reasoning: { effort: "low" },
      input: translationPrompt(locale, texts),
      text: {
        format: {
          type: "json_schema",
          name: "localized_ui",
          strict: true,
          schema: {
            type: "object",
            properties: {
              translations: { type: "array", items: { type: "string" } },
            },
            required: ["translations"],
            additionalProperties: false,
          },
        },
      },
      max_output_tokens: 4_000,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const payload = await response.json() as PrimaryResponse;
  if (!response.ok) throw new Error(payload.error?.message || `Localization failed with ${response.status}`);
  const output = (payload.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("\n");
  return parseTranslations(output, texts.length);
}

async function translateWithSecondary(locale: Locale, texts: string[]) {
  const message = await getSecondaryAIClient().messages.create({
    model: SECONDARY_AI_MODEL,
    max_tokens: 4_000,
    system: "You translate software interfaces exactly. Return only the requested JSON and preserve the input order.",
    messages: [{ role: "user", content: translationPrompt(locale, texts) }],
  }, { signal: AbortSignal.timeout(30_000) });
  const output = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.type === "text" ? block.text : "")
    .join("\n");
  return parseTranslations(output, texts.length);
}

async function translateUnknown(locale: Locale, texts: string[]) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await translateWithPrimary(locale, texts);
    } catch (error) {
      console.error("Primary localization failed", (error as Error).message);
    }
  }
  if (process.env.ANTHROPIC_API_KEY) return translateWithSecondary(locale, texts);
  throw new Error("LOCALIZATION_NOT_CONFIGURED");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  if (isRateLimited(`localize:${user.id}`, { windowMs: 60 * 60_000, maxRequests: 90 })) {
    return NextResponse.json({ error: "Localization limit reached." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid localization request." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid localization request." }, { status: 400 });

  const { locale, texts } = parsed.data;
  const resolved = new Map<string, string>();
  const unknown: string[] = [];
  for (const source of [...new Set(texts)]) {
    if (hasTranslation(locale, source)) {
      resolved.set(source, translate(locale, source));
      continue;
    }
    const cached = translationCache.get(`${locale}:${source}`);
    if (cached) resolved.set(source, cached);
    else unknown.push(source);
  }

  if (unknown.length) {
    try {
      const translated = await translateUnknown(locale, unknown);
      unknown.forEach((source, index) => {
        const value = translated[index] || source;
        translationCache.set(`${locale}:${source}`, value);
        resolved.set(source, value);
      });
    } catch (error) {
      console.error("Dashboard localization failed", (error as Error).message);
      return NextResponse.json({ error: "Localization is temporarily unavailable." }, { status: 503 });
    }
  }

  return NextResponse.json({ translations: texts.map((source) => resolved.get(source) ?? source) });
}
