"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Meta requires a public data-deletion instructions URL, but the destructive
// operation itself must be authenticated. The submitted email is only used as
// a confirmation value; the account is resolved from the signed-in user.
export async function requestDataDeletion(
  _prevState: { message: string } | null,
  formData: FormData,
): Promise<{ message: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { message: "Please enter the email associated with your account." };
  }

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return { message: "Please sign in first so we can verify that this is your account." };
  }

  const supabase = createAdminClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, auth_user_id, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (customerError || !customer) {
    return { message: "We could not find a GrowthLens account for your signed-in user." };
  }

  if (customer.email.toLowerCase() !== email) {
    return { message: "That email does not match the account you are signed in to." };
  }

  const customerId = customer.id;

  const deletionResults = await Promise.all([
    supabase.from("link_clicks").delete().eq("customer_id", customerId),
    supabase.from("ai_insights").delete().eq("customer_id", customerId),
    supabase.from("post_performance").delete().eq("customer_id", customerId),
    supabase.from("daily_metrics").delete().eq("customer_id", customerId),
    supabase.from("platform_accounts").delete().eq("customer_id", customerId),
  ]);

  if (deletionResults.some((result) => result.error)) {
    return { message: "We could not complete the deletion. Please contact support@flowlog.dev." };
  }

  const { error: deleteCustomerError } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId);

  if (deleteCustomerError) {
    return { message: "We could not complete the deletion. Please contact support@flowlog.dev." };
  }

  if (customer.auth_user_id) {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(customer.auth_user_id);
    if (deleteUserError) {
      return {
        message: "Your GrowthLens data was deleted, but the login could not be removed. Please contact support@flowlog.dev.",
      };
    }
  }

  await supabase
    .from("data_deletion_requests")
    .insert({ email, customer_id: customerId, status: "completed" });

  return { message: "Your data has been deleted." };
}
