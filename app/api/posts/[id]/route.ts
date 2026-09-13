import { NextResponse } from "next/server";
import { requireBoardApi } from "@/lib/api-auth";
import { deletePost, fetchPost } from "@/lib/posts-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireBoardApi();
  if (error) return error;

  try {
    const { id } = await context.params;
    const post = await fetchPost(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load post.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireBoardApi();
  if (error) return error;

  try {
    const { id } = await context.params;
    await deletePost(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete post.",
      },
      { status: 500 },
    );
  }
}
