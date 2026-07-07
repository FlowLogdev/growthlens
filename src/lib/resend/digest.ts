import "server-only";
import { getResendClient, EMAIL_FROM } from "./client";
import type { AiInsightResult } from "@/lib/anthropic/analyze";

export async function sendWeeklyDigestEmail(params: {
  to: string;
  businessName: string | null;
  insights: AiInsightResult[];
}) {
  const { to, businessName, insights } = params;

  const recommendationsHtml = insights
    .flatMap((insight) => insight.recommendations)
    .slice(0, 5)
    .map((rec) => `<li><strong>${rec.action}</strong> — ${rec.why} (${rec.timeframe})</li>`)
    .join("");

  await getResendClient().emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Your weekly GrowthLens insights",
    html: `
      <p>Hi ${businessName ?? "there"},</p>
      <p>Here are this week's top recommendations across your connected accounts:</p>
      <ul>${recommendationsHtml || "<li>No new recommendations this week.</li>"}</ul>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/insights">View full insights →</a></p>
    `,
  });
}
