import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const supabase = createAdminClient();
  const { data: link } = await supabase
    .from("tracked_links")
    .select("customer_id, slug, destination_url, source_platform, utm_source, utm_medium, utm_campaign")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!link) {
    return NextResponse.redirect(new URL("/?tracking=not_found", request.url));
  }

  let destination: URL;
  try {
    destination = new URL(link.destination_url);
    if (!["http:", "https:"].includes(destination.protocol)) throw new Error("Unsupported URL");
  } catch {
    return NextResponse.redirect(new URL("/?tracking=invalid", request.url));
  }

  if (link.utm_source) destination.searchParams.set("utm_source", link.utm_source);
  if (link.utm_medium) destination.searchParams.set("utm_medium", link.utm_medium);
  if (link.utm_campaign) destination.searchParams.set("utm_campaign", link.utm_campaign);

  const { error } = await supabase.from("link_clicks").insert({
    customer_id: link.customer_id,
    link_slug: link.slug,
    source_platform: link.source_platform,
    utm_source: link.utm_source,
    utm_medium: link.utm_medium,
    utm_campaign: link.utm_campaign,
    user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
  });

  if (error) console.error("Tracked link click could not be recorded", error);
  return NextResponse.redirect(destination, 302);
}
