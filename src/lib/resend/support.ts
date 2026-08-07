import "server-only";
import { EMAIL_FROM, getResendClient } from "./client";

export const SUPPORT_INBOX = "support@flowlog.dev";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendSupportTicketEmail(params: {
  ticketNumber: string;
  name: string;
  email: string;
  subject: string;
  description: string;
  priority: "standard" | "priority";
  createdAt: string;
}) {
  const safe = {
    ticketNumber: escapeHtml(params.ticketNumber),
    name: escapeHtml(params.name),
    email: escapeHtml(params.email),
    subject: escapeHtml(params.subject),
    description: escapeHtml(params.description).replaceAll("\n", "<br />"),
    priority: escapeHtml(params.priority),
    createdAt: escapeHtml(params.createdAt),
  };

  const subject = `[${params.ticketNumber}] ${params.subject}`;
  const text = [
      `GrowthLens support ticket ${params.ticketNumber}`,
      "",
      `Name: ${params.name}`,
      `Email: ${params.email}`,
      `Priority: ${params.priority}`,
      `Created: ${params.createdAt}`,
      "",
      `Subject: ${params.subject}`,
      "",
      params.description,
      "",
      "Keep the ticket number in the subject when replying.",
    ].join("\n");
  const html = `
      <div style="font-family:Arial,sans-serif;color:#171b18;line-height:1.6;max-width:680px;margin:0 auto">
        <div style="background:#111812;color:#fff;border-radius:18px;padding:24px 26px">
          <p style="margin:0 0 8px;color:#d9ff6b;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">GrowthLens support</p>
          <h1 style="margin:0;font-size:24px">Ticket ${safe.ticketNumber}</h1>
        </div>
        <div style="padding:26px 2px">
          <p>Hi ${safe.name},</p>
          <p>Your support request has been recorded. A copy was also delivered to the GrowthLens support team.</p>
          <table style="width:100%;border-collapse:collapse;margin:22px 0">
            <tr><td style="padding:9px 0;color:#6b726d;width:110px">Ticket</td><td style="padding:9px 0;font-weight:700">${safe.ticketNumber}</td></tr>
            <tr><td style="padding:9px 0;color:#6b726d">Email</td><td style="padding:9px 0">${safe.email}</td></tr>
            <tr><td style="padding:9px 0;color:#6b726d">Priority</td><td style="padding:9px 0">${safe.priority}</td></tr>
            <tr><td style="padding:9px 0;color:#6b726d">Created</td><td style="padding:9px 0">${safe.createdAt}</td></tr>
          </table>
          <div style="border-top:1px solid #e2e5e0;padding-top:20px">
            <p style="margin:0 0 8px;color:#6b726d;font-size:13px">Subject</p>
            <p style="margin:0 0 20px;font-weight:700">${safe.subject}</p>
            <p style="margin:0 0 8px;color:#6b726d;font-size:13px">Description</p>
            <p style="margin:0">${safe.description}</p>
          </div>
          <p style="margin-top:26px;color:#6b726d;font-size:13px">Reply to this email and keep ${safe.ticketNumber} in the subject so we can match your response.</p>
        </div>
      </div>
    `;

  const { data, error } = await getResendClient().batch.send([
    {
      from: EMAIL_FROM,
      to: params.email,
      replyTo: SUPPORT_INBOX,
      subject,
      text,
      html,
    },
    {
      from: EMAIL_FROM,
      to: SUPPORT_INBOX,
      replyTo: params.email,
      subject,
      text,
      html,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data?.data.map((email) => email.id).join(",") ?? null;
}
