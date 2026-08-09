"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentCustomer } from "@/lib/current-customer";

export type CreateTrackedLinkState = {
  error: string;
  success: string;
};

const optionalSlug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.")
  .min(3, "The custom name must have at least 3 characters.")
  .max(48, "The custom name must have 48 characters or fewer.")
  .optional()
  .or(z.literal(""));

const linkSchema = z.object({
  title: z.string().trim().min(2, "Add a short name for this link.").max(80),
  destination_url: z
    .string()
    .trim()
    .url("Enter a complete destination URL, including https://.")
    .refine((value) => {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
    }, "Only standard http or https links are supported."),
  slug: optionalSlug,
  source_platform: z.enum(["instagram", "facebook", "tiktok", "youtube", "other"]),
  utm_campaign: z.string().trim().max(80).optional().or(z.literal("")),
});

function generatedSlug() {
  return `go-${randomBytes(4).toString("hex")}`;
}

export async function createTrackedLink(
  _previousState: CreateTrackedLinkState,
  formData: FormData,
): Promise<CreateTrackedLinkState> {
  const parsed = linkSchema.safeParse({
    title: formData.get("title"),
    destination_url: formData.get("destination_url"),
    slug: formData.get("slug"),
    source_platform: formData.get("source_platform"),
    utm_campaign: formData.get("utm_campaign"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the link details.", success: "" };
  }

  const { supabase, customer } = await requireCurrentCustomer();
  const slug = parsed.data.slug || generatedSlug();
  const { error } = await supabase.from("tracked_links").insert({
    customer_id: customer.id,
    title: parsed.data.title,
    slug,
    destination_url: parsed.data.destination_url,
    source_platform: parsed.data.source_platform,
    utm_source: parsed.data.source_platform,
    utm_medium: "social",
    utm_campaign: parsed.data.utm_campaign || null,
  });

  if (error?.code === "23505") {
    return { error: "That custom tracking name is already in use. Choose another one.", success: "" };
  }
  if (error) {
    console.error("Tracked link creation failed", error);
    return { error: "GrowthLens could not create the tracking link. Please try again.", success: "" };
  }

  revalidatePath("/dashboard/links");
  return { error: "", success: `Tracking link created: ${slug}` };
}
