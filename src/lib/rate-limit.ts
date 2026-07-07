import "server-only";

// Minimal in-memory sliding-window limiter for OAuth callback routes
// (spec Section 9). Good enough for a single dev instance; on Vercel's
// multi-instance serverless runtime this resets per cold start and isn't
// shared across regions, so swap in Upstash Redis (or Vercel Firewall rate
// limiting rules) before real customer traffic depends on it.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  timestamps.push(now);
  hits.set(key, timestamps);

  return timestamps.length > MAX_REQUESTS;
}
