import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Signed, self-contained OAuth `state` param: {customerId}.{expiry}.{hmac}
// Avoids a DB round trip while still binding the callback to the customer
// who initiated the connect flow and rejecting stale/replayed values.
const STATE_TTL_MS = 10 * 60 * 1000;

function sign(payload: string) {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(payload)
    .digest("hex");
}

export function createOAuthState(customerId: string) {
  const expiry = Date.now() + STATE_TTL_MS;
  const payload = `${customerId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyOAuthState(state: string | null): string | null {
  if (!state) return null;

  const [customerId, expiryStr, signature] = state.split(".");
  if (!customerId || !expiryStr || !signature) return null;

  const payload = `${customerId}.${expiryStr}`;
  const expected = sign(payload);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  if (Date.now() > Number(expiryStr)) return null;

  return customerId;
}
