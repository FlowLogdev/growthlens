"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentCustomer } from "@/lib/current-customer";

export async function disconnectAccount(formData: FormData) {
  const accountId = String(formData.get("account_id"));
  const { supabase, customer } = await requireCurrentCustomer();

  await supabase
    .from("platform_accounts")
    .update({ status: "revoked" })
    .eq("id", accountId)
    .eq("customer_id", customer.id);

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/connect");
}

export async function updateBusinessName(formData: FormData) {
  const businessName = String(formData.get("business_name"));
  const { supabase, customer } = await requireCurrentCustomer();

  await supabase.from("customers").update({ business_name: businessName }).eq("id", customer.id);

  revalidatePath("/dashboard/settings");
}
