import type { Inquiry, InquiryStatus } from "./types";
import {
  createSupabaseAdmin,
  mapInquiryRow,
  type InquiryRow,
} from "./supabase/server";

export async function fetchInquiries(): Promise<Inquiry[]> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as InquiryRow[]).map(mapInquiryRow) as Inquiry[];
}

export async function updateInquiry(
  displayId: string,
  data: { status?: InquiryStatus; notes?: string },
): Promise<Inquiry> {
  const supabase = createSupabaseAdmin();

  const payload: Partial<Pick<InquiryRow, "status" | "notes">> = {};
  if (data.status !== undefined) payload.status = data.status;
  if (data.notes !== undefined) payload.notes = data.notes;

  const { data: row, error } = await supabase
    .from("inquiries")
    .update(payload)
    .eq("display_id", displayId)
    .select()
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "Failed to update inquiry.");
  }

  return mapInquiryRow(row as InquiryRow) as Inquiry;
}
