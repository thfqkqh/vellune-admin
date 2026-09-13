import type { User } from "@supabase/supabase-js";

export function isAdminUser(user: User | null | undefined) {
  if (!user?.email) {
    return false;
  }

  if (user.app_metadata?.role === "admin") {
    return true;
  }

  const allowedEmails =
    process.env.ADMIN_EMAILS?.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean) ?? [];

  return allowedEmails.includes(user.email.toLowerCase());
}
