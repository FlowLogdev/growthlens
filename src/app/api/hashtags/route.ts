import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { researchHashtags } from "@/lib/hashtag-research";

const requestSchema = z.object({
  niche: z.string().trim().min(2).max(120),
  audience: z.string().trim().max(160).optional(),
  platform: z.enum(["instagram", "tiktok", "both"]),
  region: z.string().trim().max(80).optional(),
  locale: z.enum(["en-US", "es-ES", "pt-BR"]).default("en-US"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to research hashtags." }, { status: 401 });

  if (isRateLimited(`hashtag-research:${user.id}`, { windowMs: 60 * 60_000, maxRequests: 10 })) {
    return NextResponse.json({ error: "You have reached the hourly research limit. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The research request could not be read." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a niche and choose a platform." }, { status: 400 });

  try {
    const result = await researchHashtags(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = (error as Error).message;
    if (message === "AI_RESEARCH_NOT_CONFIGURED") {
      return NextResponse.json({ error: "UseGrowthLens Bot could not find the information you need." }, { status: 503 });
    }
    console.error("Hashtag research failed", message);
    return NextResponse.json({ error: "UseGrowthLens Bot could not find the information you need." }, { status: 502 });
  }
}
