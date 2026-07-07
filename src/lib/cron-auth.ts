import "server-only";
import type { NextRequest } from "next/server";

// Vercel Cron invocations carry `Authorization: Bearer ${CRON_SECRET}`.
// Any route triggered by cron (or that fans out jobs on cron's behalf)
// must reject requests that don't present this secret.
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}
