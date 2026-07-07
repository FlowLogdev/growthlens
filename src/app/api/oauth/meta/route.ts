import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildMetaAuthUrl } from "@/lib/integrations/meta";
import { createOAuthState } from "@/lib/oauth-state";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "Customer record not found" }, { status: 404 });
  }

  const state = createOAuthState(customer.id);
  return NextResponse.redirect(buildMetaAuthUrl(state));
}
