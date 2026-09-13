import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import {
  canAccessBoard,
  canAccessInquiries,
  getAdminRole,
  type AdminRole,
} from "./auth";
import { createSupabaseServerClient } from "./supabase/server";

export type AdminSession = {
  user: User;
  role: AdminRole;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = getAdminRole(user);
  if (!user || !role) {
    return null;
  }

  return { user, role };
}

function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 },
  );
}

function forbiddenResponse() {
  return NextResponse.json(
    { success: false, error: "Forbidden" },
    { status: 403 },
  );
}

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) {
    return { error: unauthorizedResponse(), session: null };
  }
  return { error: null, session };
}

export async function requireInquiriesApi() {
  const result = await requireAdminApi();
  if (result.error) {
    return result;
  }

  if (!canAccessInquiries(result.session!.role)) {
    return { error: forbiddenResponse(), session: null };
  }

  return result;
}

export async function requireBoardApi() {
  const result = await requireAdminApi();
  if (result.error) {
    return result;
  }

  if (!canAccessBoard(result.session!.role)) {
    return { error: forbiddenResponse(), session: null };
  }

  return result;
}
