import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function isAdminClientConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

// Service-role client. Bypasses RLS entirely — only ever import this from
// server-side code that itself enforces tenant scoping (cron jobs, webhook
// handlers, OAuth callbacks). Never reference this from a Client Component
// or anything reachable with the anon key's trust level.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured");
  }

  return createSupabaseClient(
    url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
