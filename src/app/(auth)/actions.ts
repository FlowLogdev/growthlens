"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const businessName = String(formData.get("business_name") ?? "");

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  const authUserId = data.user?.id;
  if (authUserId) {
    // Provision the tenant row with the service-role client: when email
    // confirmation is required, signUp() returns no session, so the caller
    // isn't authenticated yet and the RLS policy on customers (auth_user_id
    // = auth.uid()) would reject this insert under the normal user client.
    // subscription_status defaults to 'trialing' in the schema, so this
    // customer can use the dashboard immediately and pick a plan (Stripe
    // Checkout) at any point before the trial ends.
    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase.from("customers").insert({
      auth_user_id: authUserId,
      email,
      business_name: businessName || null,
    });

    if (insertError) {
      redirect(`/signup?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
