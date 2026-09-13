import { NextResponse } from "next/server";
import {
  ADMIN_ROLE_LABELS,
  canAccessBoard,
  canAccessInquiries,
} from "@/lib/auth";
import { getAdminSession } from "@/lib/api-auth";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      email: session.user.email,
      role: session.role,
      roleLabel: ADMIN_ROLE_LABELS[session.role],
      canAccessInquiries: canAccessInquiries(session.role),
      canAccessBoard: canAccessBoard(session.role),
    },
  });
}
