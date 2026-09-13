import { createClient } from "@supabase/supabase-js";

export type InquiryRow = {
  id: string;
  display_id: string;
  created_at: string;
  type: string;
  company: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  privacy: boolean;
  status: string;
  notes: string | null;
};

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { hour12: false });
}

export function mapInquiryRow(row: InquiryRow) {
  return {
    id: row.display_id,
    date: formatDate(row.created_at),
    type: row.type,
    company: row.company ?? "",
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    message: row.message,
    privacy: row.privacy ? "YES" : "NO",
    status: row.status,
    notes: row.notes ?? "",
  };
}
