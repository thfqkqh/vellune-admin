import { NextResponse } from "next/server";
import { isAdminUser } from "./auth";
import { createSupabaseServerClient } from "./supabase/server";

export async function requireAdminApi() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  return null;
}
