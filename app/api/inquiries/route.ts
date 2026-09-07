import { NextResponse } from "next/server";
import { fetchInquiries } from "@/lib/admin-api";

export async function GET() {
  try {
    const inquiries = await fetchInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load inquiries.",
      },
      { status: 500 },
    );
  }
}
