"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentCustomer } from "@/lib/current-customer";
import { decryptToken } from "@/lib/encryption";
import { syncTikTokAccountData } from "@/lib/integrations/sync-tiktok";

export async function syncTikTokAccount(formData: FormData) {
  const accountId = formData.get("account_id");
  if (typeof accountId !== "string" || !accountId) {
    redirect("/dashboard/connect?sync=failed");
  }

  const { supabase, customer } = await requireCurrentCustomer();
  const { data: account } = await supabase
    .from("platform_accounts")
    .select("id, customer_id, platform, access_token")
    .eq("id", accountId)
    .eq("customer_id", customer.id)
    .eq("platform", "tiktok")
    .single();

  if (!account) {
    redirect("/dashboard/connect?sync=failed");
  }

  let syncResult = "complete";
  try {
    await syncTikTokAccountData({
      accountId: account.id,
      customerId: customer.id,
      accessToken: decryptToken(account.access_token),
    });
  } catch (error) {
    console.error("Manual TikTok sync failed", error);
    syncResult = "failed";
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard/tiktok");
  revalidatePath("/dashboard/connect");
  redirect(`/dashboard/connect?sync=${syncResult}`);
}

export async function syncMetaAccount(formData: FormData) {
  const accountId = formData.get("account_id");
  if (typeof accountId !== "string" || !accountId) {
    redirect("/dashboard/connect?sync=meta_failed");
  }

  const { supabase, customer } = await requireCurrentCustomer();
  const { data: account } = await supabase
    .from("platform_accounts")
    .select("id, platform")
    .eq("id", accountId)
    .eq("customer_id", customer.id)
    .in("platform", ["facebook", "instagram"])
    .single();

  if (!account) {
    redirect("/dashboard/connect?sync=meta_failed");
  }

  let syncResult = "meta_complete";
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/jobs/sync-account?account_id=${encodeURIComponent(account.id)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error(await response.text());
  } catch (error) {
    console.error("Manual Meta sync failed", {
      accountId: account.id,
      platform: account.platform,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    syncResult = "meta_failed";
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/posts");
  revalidatePath(`/dashboard/${account.platform}`);
  revalidatePath("/dashboard/connect");
  redirect(`/dashboard/connect?sync=${syncResult}`);
}
