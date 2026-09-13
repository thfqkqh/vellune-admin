import { NextResponse } from "next/server";
import { requireBoardApi } from "@/lib/api-auth";
import { generateBoardReplyDraft } from "@/lib/openai";

export async function POST(request: Request) {
  const { error } = await requireBoardApi();
  if (error) return error;

  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      authorEmail?: string;
      createdAt?: string;
      existingReplies?: string[];
    };

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: "Post data is incomplete." },
        { status: 400 },
      );
    }

    const suggestion = await generateBoardReplyDraft({
      title: body.title,
      content: body.content,
      authorEmail: body.authorEmail ?? "unknown",
      createdAt: body.createdAt ?? "",
      existingReplies: body.existingReplies ?? [],
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
