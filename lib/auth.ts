import type { User } from "@supabase/supabase-js";

export type AdminRole = "super_admin" | "inquiries_admin" | "board_admin";

export function getAdminRole(user: User | null | undefined): AdminRole | null {
  if (!user?.email) {
    return null;
  }

  const adminRole = user.app_metadata?.admin_role;
  if (
    adminRole === "super_admin" ||
    adminRole === "inquiries_admin" ||
    adminRole === "board_admin"
  ) {
    return adminRole;
  }

  if (user.app_metadata?.role === "admin") {
    return "super_admin";
  }

  const allowedEmails =
    process.env.ADMIN_EMAILS?.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean) ?? [];

  if (allowedEmails.includes(user.email.toLowerCase())) {
    return "super_admin";
  }

  return null;
}

export function isAdminUser(user: User | null | undefined) {
  return getAdminRole(user) !== null;
}

export function canAccessInquiries(role: AdminRole | null) {
  return role === "super_admin" || role === "inquiries_admin";
}

export function canAccessBoard(role: AdminRole | null) {
  return role === "super_admin" || role === "board_admin";
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Full Admin",
  inquiries_admin: "Inquiries",
  board_admin: "Board",
};
