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

  let userId: string;

  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (created.error) {
    if (!created.error.message.includes("already been registered")) {
      return NextResponse.json({ error: created.error.message }, { status: 400 });
    }

    // User already exists from a prior failed signup attempt — find them
    // and reset their password + confirm their email instead of creating.
    let existingUserId: string | undefined;
    let page = 1;
    while (!existingUserId) {
      const { data: list, error: listError } = await supabase.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 400 });
      }
      existingUserId = list.users.find((u) => u.email === email)?.id;
      if (existingUserId || list.users.length < 200) break;
      page += 1;
    }

    if (!existingUserId) {
      return NextResponse.json({ error: "user reported as duplicate but not found" }, { status: 500 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUserId, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    userId = existingUserId;
  } else {
    userId = created.data.user.id;
  }

  const { error: upsertError } = await supabase.from("customers").upsert(
    {
      auth_user_id: userId,
      email,
      business_name: "GrowthLens Admin",
      subscription_status: "active",
      plan_tier: "business",
    },
    { onConflict: "auth_user_id" },
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user_id: userId });
}
