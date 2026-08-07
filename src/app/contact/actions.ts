"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { hasProductAccess } from "@/lib/entitlements";
import { sendSupportTicketEmail } from "@/lib/resend/support";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ticketSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80, "Keep your name under 80 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  subject: z
    .string()
    .trim()
    .min(4, "Add a short subject.")
    .max(160, "Keep the subject under 160 characters.")
    .refine((value) => !/[\r\n]/.test(value), "The subject must be one line."),
  description: z
    .string()
    .trim()
    .min(20, "Please add a little more detail so we can help.")
    .max(5000, "Keep the description under 5,000 characters."),
  company_website: z.string().max(0).optional(),
});

type TicketField = "name" | "email" | "subject" | "description";

export type ContactFormState = {
  status: "idle" | "error" | "success" | "warning";
  message: string;
  ticketNumber?: string;
  fieldErrors?: Partial<Record<TicketField, string[]>>;
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
  message: "",
};

export async function createSupportTicket(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = ticketSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    description: formData.get("description"),
    company_website: formData.get("company_website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: {
        name: fieldErrors.name,
        email: fieldErrors.email,
        subject: fieldErrors.subject,
        description: fieldErrors.description,
      },
    };
  }

  if (parsed.data.company_website) {
    return { status: "success", message: "Your request has been received." };
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const requestKey = forwardedFor || requestHeaders.get("x-real-ip") || "unknown";

  if (
    isRateLimited(`support:${requestKey}:${parsed.data.email}`, {
      windowMs: 10 * 60_000,
      maxRequests: 3,
    })
  ) {
    return {
      status: "error",
      message: "Too many requests were submitted. Please wait 10 minutes and try again.",
    };
  }

  let customerId: string | null = null;
  let priority: "standard" | "priority" = "standard";

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (user) {
    const { data: customer } = await sessionClient
      .from("customers")
      .select("id, plan_tier, subscription_status, trial_ends_at")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (customer) {
      customerId = customer.id;
      priority =
        hasProductAccess(customer) &&
        (customer.plan_tier === "pro" || customer.plan_tier === "business")
          ? "priority"
          : "standard";
    }
  }

  const admin = createAdminClient();
  const { data: ticket, error: insertError } = await admin
    .from("support_tickets")
    .insert({
      customer_id: customerId,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority,
    })
    .select("ticket_number, created_at")
    .single();

  if (insertError || !ticket) {
    console.error("Could not create GrowthLens support ticket", insertError?.message);
    return {
      status: "error",
      message: "We could not open your ticket right now. Please email support@flowlog.dev directly.",
    };
  }

  try {
    const providerId = await sendSupportTicketEmail({
      ticketNumber: ticket.ticket_number,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority,
      createdAt: new Date(ticket.created_at).toISOString(),
    });

    await admin
      .from("support_tickets")
      .update({ email_delivery_status: "sent", email_provider_id: providerId })
      .eq("ticket_number", ticket.ticket_number);

    return {
      status: "success",
      message: "Your ticket is open. We emailed a copy to you and the GrowthLens support team.",
      ticketNumber: ticket.ticket_number,
    };
  } catch (error) {
    await admin
      .from("support_tickets")
      .update({ email_delivery_status: "failed" })
      .eq("ticket_number", ticket.ticket_number);

    console.error("GrowthLens support ticket email failed", (error as Error).message);
    return {
      status: "warning",
      message: "Your ticket is recorded, but the email copy is delayed. Support can still see your request.",
      ticketNumber: ticket.ticket_number,
    };
  }
}
