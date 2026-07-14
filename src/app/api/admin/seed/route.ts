import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// One-time bootstrap endpoint for provisioning the first admin/owner
// account directly (confirmed email, no signup flow). Protected by
// ADMIN_SEED_TOKEN, which only exists in Vercel's production env — not in
// this file or the repo. Remove this route once it has been used.
export async function POST(request: NextRequest) {
  const token = request.headers.get("x-seed-token");
  if (!token || token !== process.env.ADMIN_SEED_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("customers").insert({
    auth_user_id: data.user.id,
    email,
    business_name: "GrowthLens Admin",
    subscription_status: "active",
    plan_tier: "business",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user_id: data.user.id });
}
