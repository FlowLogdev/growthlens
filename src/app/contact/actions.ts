"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { sendSupportTicketEmail } from "@/lib/resend/support";
import { isResendConfigured } from "@/lib/resend/client";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
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
});

type TicketField = "name" | "email" | "subject" | "description";

type TicketValues = Record<TicketField, string>;

type TicketReceipt = {
  ticket_id: string;
  ticket_number: string;
  created_at: string;
  priority: "standard" | "priority";
};

export type ContactFormState = {
  status: "idle" | "error" | "success" | "warning";
  message: string;
  ticketNumber?: string;
  fieldErrors?: Partial<Record<TicketField, string[]>>;
  values?: TicketValues;
};

function readFormText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function formatFieldList(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? "the highlighted fields";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export async function createSupportTicket(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const rawValues = {
    name: readFormText(formData, "name"),
    email: readFormText(formData, "email"),
    subject: readFormText(formData, "subject"),
    description: readFormText(formData, "description"),
  };
  const preservedValues: TicketValues = {
    name: rawValues.name.slice(0, 80),
    email: rawValues.email.slice(0, 254),
    subject: rawValues.subject.slice(0, 160),
    description: rawValues.description.slice(0, 5000),
  };
  const parsed = ticketSchema.safeParse({
    ...rawValues,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const visibleErrors = {
      name: fieldErrors.name,
      email: fieldErrors.email,
      subject: fieldErrors.subject,
      description: fieldErrors.description,
    };
    const invalidLabels = [
      visibleErrors.name?.length ? "Name" : null,
      visibleErrors.email?.length ? "Email" : null,
      visibleErrors.subject?.length ? "Subject" : null,
      visibleErrors.description?.length ? "Description" : null,
    ].filter((label): label is string => Boolean(label));

    return {
      status: "error",
      message: `Please check: ${formatFieldList(invalidLabels)}.`,
      fieldErrors: visibleErrors,
      values: preservedValues,
    };
  }

  const validValues: TicketValues = {
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    description: parsed.data.description,
  };

  try {
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
        values: validValues,
      };
    }

    const supabase = await createClient();
    const { data, error: insertError } = await supabase
      .rpc("create_support_ticket", {
        p_name: parsed.data.name,
        p_email: parsed.data.email,
        p_subject: parsed.data.subject,
        p_description: parsed.data.description,
      })
      .single();
    const ticket = data as TicketReceipt | null;

    if (insertError || !ticket) {
      const rateLimited = insertError?.message.includes("rate_limited");
      console.error("Could not create GrowthLens support ticket", insertError?.message);
      return {
        status: "error",
        message: rateLimited
          ? "Too many requests were submitted. Please wait 10 minutes and try again."
          : "We could not open your ticket right now. Please email support@flowlog.dev directly.",
        values: validValues,
      };
    }

    const markDelivery = async (status: "sent" | "failed", providerId: string | null = null) => {
      if (!isAdminClientConfigured()) return;

      try {
        const admin = createAdminClient();
        const { error } = await admin
          .from("support_tickets")
          .update({
            email_delivery_status: status,
            email_provider_id: status === "sent" ? providerId : null,
          })
          .eq("id", ticket.ticket_id);

        if (error) {
          console.error("Could not update GrowthLens ticket delivery status", error.message);
        }
      } catch (error) {
        console.error(
          "Could not update GrowthLens ticket delivery status",
          (error as Error).message,
        );
      }
    };

    if (!isResendConfigured()) {
      await markDelivery("failed");
      return {
        status: "warning",
        message:
          "Your ticket is recorded. Email delivery is being configured, so please keep this ticket number.",
        ticketNumber: ticket.ticket_number,
      };
    }

    try {
      const providerId = await sendSupportTicketEmail({
        ticketNumber: ticket.ticket_number,
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        description: parsed.data.description,
        priority: ticket.priority,
        createdAt: new Date(ticket.created_at).toISOString(),
      });

      await markDelivery("sent", providerId);

      return {
        status: "success",
        message: "Your ticket is open. We emailed a copy to you and the GrowthLens support team.",
        ticketNumber: ticket.ticket_number,
      };
    } catch (error) {
      await markDelivery("failed");
      console.error("GrowthLens support ticket email failed", (error as Error).message);
      return {
        status: "warning",
        message:
          "Your ticket is recorded, but the email copy is delayed. Support can still see your request.",
        ticketNumber: ticket.ticket_number,
      };
    }
  } catch (error) {
    console.error("Unexpected GrowthLens support ticket failure", (error as Error).message);
    return {
      status: "error",
      message: "We could not open your ticket right now. Please email support@flowlog.dev directly.",
      values: validValues,
    };
  }
}
