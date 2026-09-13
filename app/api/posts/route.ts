import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { fetchPosts } from "@/lib/posts-api";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

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
