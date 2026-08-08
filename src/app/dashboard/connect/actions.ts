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
