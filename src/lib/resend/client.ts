import "server-only";
import { Resend } from "resend";

let client: Resend | undefined;

export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY!);
  }
  return client;
}

export const EMAIL_FROM = "GrowthLens <insights@usegrowthlens.com>";
