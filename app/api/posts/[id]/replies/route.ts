import { NextResponse } from "next/server";
import { requireBoardApi } from "@/lib/api-auth";
import { createAdminReply } from "@/lib/posts-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { error } = await requireBoardApi();
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { content?: string };

    if (!body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Reply content is required." },
        { status: 400 },
      );
    }

    const reply = await createAdminReply(id, body.content);
    return NextResponse.json({ success: true, reply });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create reply.",
      },
      { status: 500 },
    );
  }
}
