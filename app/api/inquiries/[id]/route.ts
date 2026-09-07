import { NextResponse } from "next/server";
import { updateInquiry } from "@/lib/admin-api";
import type { InquiryStatus } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: InquiryStatus;
      notes?: string;
    };

    const inquiry = await updateInquiry(id, body);
    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update inquiry.",
      },
      { status: 500 },
    );
  }
}
