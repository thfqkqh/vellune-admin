import { NextResponse } from "next/server";
import { requireInquiriesApi } from "@/lib/api-auth";
import { generateInquiryNotes } from "@/lib/openai";
import type { InquiryStatus } from "@/lib/types";

export async function POST(request: Request) {
  const { error } = await requireInquiriesApi();
  if (error) return error;

  try {
    const body = (await request.json()) as {
      id?: string;
      date?: string;
      type?: string;
      company?: string;
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
      status?: InquiryStatus;
      notes?: string;
    };

    if (!body.id || !body.message || !body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Inquiry data is incomplete." },
        { status: 400 },
      );
    }

    const suggestion = await generateInquiryNotes({
      id: body.id,
      date: body.date ?? "",
      type: body.type ?? "",
      company: body.company ?? "",
      name: body.name,
      email: body.email,
      phone: body.phone ?? "",
      message: body.message,
      status: body.status ?? "NEW",
      notes: body.notes ?? "",
    });

    return NextResponse.json({ success: true, suggestion });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "AI suggestion failed.",
      },
      { status: 500 },
    );
  }
}
