import { NextResponse } from "next/server";
import { requireBoardApi } from "@/lib/api-auth";
import { fetchPosts } from "@/lib/posts-api";

export async function GET() {
  const { error } = await requireBoardApi();
  if (error) return error;

  try {
    const posts = await fetchPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load posts.",
      },
      { status: 500 },
    );
  }
}
