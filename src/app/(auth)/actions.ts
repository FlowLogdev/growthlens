"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isPlanTier } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function safeRedirect(value: FormDataEntryValue | null, fallback = "/dashboard") {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

const signupSchema = z.object({
  businessName: z.string().trim().max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export async function signUp(formData: FormData) {
  const parsed = signupSchema.safeParse({
    businessName: formData.get("business_name") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const requestedPlan = formData.get("plan");
  const plan = isPlanTier(requestedPlan) ? requestedPlan : "starter";

  if (!parsed.success) {
    redirect(`/signup?plan=${plan}&error=${encodeURIComponent("Enter a valid email and a password with at least 8 characters.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    redirect(`/signup?plan=${plan}&error=${encodeURIComponent(error.message)}`);
  }

  const authUserId = data.user?.id;
  if (authUserId) {
    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase.from("customers").insert({
      auth_user_id: authUserId,
      email: parsed.data.email,
      business_name: parsed.data.businessName || null,
      plan_tier: plan,
    });

    if (insertError) {
      redirect(`/signup?plan=${plan}&error=${encodeURIComponent(insertError.message)}`);
    }
  }

  const destination = `/dashboard/billing?plan=${plan}&welcome=1`;
  if (data.session) {
    redirect(`${destination}&registration_completed=1`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Check your email to confirm your account, then log in to choose your plan.")}&redirect_to=${encodeURIComponent(destination)}&registration_completed=1`,
  );
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const destination = safeRedirect(formData.get("redirect_to"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&redirect_to=${encodeURIComponent(destination)}`,
    );
  }

  redirect(destination);
}

export async function signInWithGoogle(formData: FormData) {
  const destination = safeRedirect(formData.get("redirect_to"));
  const supabase = await createClient();
  const callbackUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_SITE_URL);
  callbackUrl.searchParams.set("next", destination);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&redirect_to=${encodeURIComponent(destination)}`,
    );
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
