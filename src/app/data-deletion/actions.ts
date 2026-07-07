"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Public, unauthenticated data-deletion mechanism required by Meta App
// Review (spec Section 13). Looks up the customer by the email they submit
// and purges every tenant row across all data tables, then logs the request
// for audit purposes regardless of whether a matching customer was found.
export async function requestDataDeletion(
  _prevState: { message: string } | null,
  formData: FormData,
): Promise<{ message: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { message: "Please enter the email associated with your account." };
  }

  const supabase = createAdminClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (!customer) {
    await supabase
      .from("data_deletion_requests")
      .insert({ email, status: "not_found" });
    return {
      message: "If an account exists for that email, its data has been queued for deletion.",
    };
  }

  const customerId = customer.id;

  await Promise.all([
    supabase.from("link_clicks").delete().eq("customer_id", customerId),
    supabase.from("ai_insights").delete().eq("customer_id", customerId),
    supabase.from("post_performance").delete().eq("customer_id", customerId),
    supabase.from("daily_metrics").delete().eq("customer_id", customerId),
    supabase.from("platform_accounts").delete().eq("customer_id", customerId),
  ]);

  await supabase.from("customers").delete().eq("id", customerId);

  if (customer.auth_user_id) {
    await supabase.auth.admin.deleteUser(customer.auth_user_id);
  }

  await supabase
    .from("data_deletion_requests")
    .insert({ email, customer_id: customerId, status: "completed" });

  return { message: "Your data has been deleted." };
}
