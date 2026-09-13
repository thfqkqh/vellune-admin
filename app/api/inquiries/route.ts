import { NextResponse } from "next/server";
import { requireInquiriesApi } from "@/lib/api-auth";
import { fetchInquiries } from "@/lib/admin-api";

export async function GET() {
  const { error } = await requireInquiriesApi();
  if (error) return error;

  try {
    const inquiries = await fetchInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load inquiries.",
      },
      { status: 500 },
    );
  }
}
