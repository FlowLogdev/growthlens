import "server-only";
import { Resend } from "resend";

let client: Resend | undefined;

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}

export const EMAIL_FROM =
  process.env.RESEND_FROM_EMAIL?.trim() || "GrowthLens <support@flowlog.dev>";
