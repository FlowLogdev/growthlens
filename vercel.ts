import type { VercelConfig } from "@vercel/config/v1";

// Cron schedules implement the fan-out pattern from spec Section 8: each
// entry only triggers the lightweight /api/cron/* route, which enqueues one
// call per account rather than looping through all customers itself.
export const config: VercelConfig = {
  framework: "nextjs",
  crons: [
    { path: "/api/cron/trigger-syncs", schedule: "0 */6 * * *" },
    { path: "/api/cron/refresh-tokens", schedule: "0 */6 * * *" },
    { path: "/api/cron/generate-insights", schedule: "0 8 * * 1" },
    { path: "/api/cron/send-digests", schedule: "0 9 * * 1" },
  ],
};
