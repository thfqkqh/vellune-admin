import { NextResponse } from "next/server";
import { verifySession } from "./auth";

export async function requireAdminApi() {
  const ok = await verifySession();
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  return null;
}
